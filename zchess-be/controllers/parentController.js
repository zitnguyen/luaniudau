const Parent = require("../models/Parents");
const User = require("../models/User");
const Student = require("../models/Student");
const asyncHandler = require("../middleware/asyncHandler");

exports.getAllParents = asyncHandler(async (req, res) => {
  const parents = await User.find({ role: { $regex: /^parent$/i } });
  res.json(parents);
});

exports.getParentById = asyncHandler(async (req, res) => {
  if (req.user?.role === "Parent" && String(req.user._id) !== String(req.params.id)) {
    return res.status(403).json({ message: "Forbidden" });
  }
  const parent = await User.findOne({
    _id: req.params.id,
    role: { $regex: /^parent$/i },
  });
  if (!parent)
    return res.status(404).json({ message: "Không tìm thấy phụ huynh" });
  res.json(parent);
});

exports.createParent = asyncHandler(async (req, res) => {
  const { fullName, phone, email, address } = req.body;

  const username = phone;
  const password = "123456";
  const emailToUse = email || `${phone}@zchess.com`;

  const existingUser = await User.findOne({
    $or: [{ username }, { email: emailToUse }, { phone: phone }],
  });

  if (existingUser) {
    if (existingUser.phone === phone)
      return res.status(400).json({ message: "Số điện thoại này đã được đăng ký" });
    if (existingUser.email === emailToUse)
      return res.status(400).json({ message: "Email này đã được sử dụng" });
    return res
      .status(400)
      .json({ message: "Phụ huynh với số điện thoại hoặc email này đã tồn tại" });
  }

  const parent = new Parent({
    username,
    password,
    fullName,
    phone,
    email: emailToUse,
    address,
    role: "Parent",
  });

  try {
    await parent.save();
    res.status(201).json(parent);
  } catch (err) {
    if (err.code === 11000) {
      if (err.keyPattern?.phone)
        return res.status(400).json({ message: "Số điện thoại này đã được đăng ký" });
      if (err.keyPattern?.email)
        return res.status(400).json({ message: "Email này đã được sử dụng" });
    }
    throw err;
  }
});

exports.updateParent = asyncHandler(async (req, res) => {
  if (req.user?.role === "Parent" && String(req.user._id) !== String(req.params.id)) {
    return res.status(403).json({ message: "Forbidden" });
  }
  if (req.body.phone) {
    const duplicate = await User.findOne({
      phone: req.body.phone,
      _id: { $ne: req.params.id },
      role: { $regex: /^parent$/i },
    });
    if (duplicate) {
      return res
        .status(400)
        .json({ message: "Số điện thoại này đã được sử dụng bởi tài khoản khác" });
    }
  }

  try {
    const parent = await User.findOneAndUpdate(
      { _id: req.params.id, role: { $regex: /^parent$/i } },
      req.body,
      { new: true, runValidators: true },
    );
    if (!parent)
      return res.status(404).json({ message: "Không tìm thấy phụ huynh" });
    res.json(parent);
  } catch (err) {
    if (err.code === 11000 && err.keyPattern?.phone) {
      return res
        .status(400)
        .json({ message: "Số điện thoại này đã được sử dụng bởi tài khoản khác" });
    }
    throw err;
  }
});

exports.deleteParent = asyncHandler(async (req, res) => {
  const deletedParent = await User.findOneAndDelete({
    _id: req.params.id,
    role: { $regex: /^parent$/i },
  });
  if (!deletedParent) {
    return res.status(404).json({ message: "Không tìm thấy phụ huynh" });
  }

  await Student.updateMany(
    { parentId: req.params.id, isDeleted: { $ne: true } },
    { $set: { isDeleted: true, deletedAt: new Date() } },
  );

  res.json({
    message: "Đã xóa phụ huynh và các học viên liên quan",
    deletedId: req.params.id,
  });
});

exports.getParentStudents = asyncHandler(async (req, res) => {
  if (req.user?.role === "Parent" && String(req.user._id) !== String(req.params.id)) {
    return res.status(403).json({ message: "Forbidden" });
  }
  const students = await Student.find({
    parentId: req.params.id,
    isDeleted: { $ne: true },
  });
  res.json(students);
});
