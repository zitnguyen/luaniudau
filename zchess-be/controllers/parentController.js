const crypto = require("crypto");
const Parent = require("../models/Parents");
const User = require("../models/User");
const Student = require("../models/Student");
const asyncHandler = require("../middleware/asyncHandler");
const { ok, created, deleted, fail } = require("../utils/apiResponse");

const PARENT_UPDATABLE_FIELDS = ["fullName", "email", "phone", "address", "avatarUrl"];

const pickParentPatch = (body = {}) => {
  const patch = {};
  PARENT_UPDATABLE_FIELDS.forEach((field) => {
    if (body[field] !== undefined) {
      patch[field] = typeof body[field] === "string" ? body[field].trim() : body[field];
    }
  });
  return patch;
};

const generateTempPassword = () => {
  return "zchesscenter";
};

exports.getAllParents = asyncHandler(async (req, res) => {
  const parents = await User.find({ role: { $regex: /^parent$/i } });
  return ok(res, parents);
});

exports.getParentById = asyncHandler(async (req, res) => {
  if (req.user?.role === "Parent" && String(req.user._id) !== String(req.params.id)) {
    return fail(res, "Forbidden", 403);
  }
  const parent = await User.findOne({
    _id: req.params.id,
    role: { $regex: /^parent$/i },
  });
  if (!parent)
    return fail(res, "Không tìm thấy phụ huynh", 404);
  return ok(res, parent);
});

exports.createParent = asyncHandler(async (req, res) => {
  const { fullName, phone, email, address } = req.body;

  const username = phone;
  const password = generateTempPassword();
  const emailToUse = email || `${phone}@zchess.com`;

  const existingUser = await User.findOne({
    $or: [{ username }, { email: emailToUse }, { phone: phone }],
  });

  if (existingUser) {
    if (existingUser.phone === phone)
      return fail(res, "Số điện thoại này đã được đăng ký", 400);
    if (existingUser.email === emailToUse)
      return fail(res, "Email này đã được sử dụng", 400);
    return fail(res, "Phụ huynh với số điện thoại hoặc email này đã tồn tại", 400);
  }

  const parent = new Parent({
    username,
    password,
    plainPassword: password,
    fullName,
    phone,
    email: emailToUse,
    address,
    role: "Parent",
  });

  try {
    await parent.save();
    // Trả mật khẩu tạm 1 lần để Admin chuyển tới phụ huynh; tránh log/persist nơi khác.
    const payload = parent.toObject ? parent.toObject() : { ...parent };
    delete payload.password;
    payload.tempPassword = password;
    return created(res, payload);
  } catch (err) {
    if (err.code === 11000) {
      if (err.keyPattern?.phone)
        return fail(res, "Số điện thoại này đã được đăng ký", 400);
      if (err.keyPattern?.email)
        return fail(res, "Email này đã được sử dụng", 400);
    }
    throw err;
  }
});

exports.updateParent = asyncHandler(async (req, res) => {
  if (req.user?.role === "Parent" && String(req.user._id) !== String(req.params.id)) {
    return fail(res, "Forbidden", 403);
  }
  if (req.body.phone) {
    const duplicate = await User.findOne({
      phone: req.body.phone,
      _id: { $ne: req.params.id },
      role: { $regex: /^parent$/i },
    });
    if (duplicate) {
      return fail(res, "Số điện thoại này đã được sử dụng bởi tài khoản khác", 400);
    }
  }

  try {
    // Whitelist trường được sửa: tránh PH/Admin "leo quyền" qua role/password/isDeleted...
    const patch = pickParentPatch(req.body);
    const parent = await User.findOneAndUpdate(
      { _id: req.params.id, role: { $regex: /^parent$/i } },
      { $set: patch },
      { new: true, runValidators: true },
    );
    if (!parent)
      return fail(res, "Không tìm thấy phụ huynh", 404);
    return ok(res, parent);
  } catch (err) {
    if (err.code === 11000 && err.keyPattern?.phone) {
      return fail(res, "Số điện thoại này đã được sử dụng bởi tài khoản khác", 400);
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
    return fail(res, "Không tìm thấy phụ huynh", 404);
  }

  await Student.updateMany(
    { parentId: req.params.id, isDeleted: { $ne: true } },
    { $set: { isDeleted: true, deletedAt: new Date() } },
  );

  return ok(res, { deletedId: req.params.id }, "Đã xóa phụ huynh và các học viên liên quan");
});

exports.getParentPassword = asyncHandler(async (req, res) => {
  const parent = await User.findOne({
    _id: req.params.id,
    role: { $regex: /^parent$/i },
  }).select("plainPassword");
  if (!parent) return fail(res, "Không tìm thấy phụ huynh", 404);
  return ok(res, { password: parent.plainPassword || "" });
});

exports.resetParentPassword = asyncHandler(async (req, res) => {
  const { newPassword } = req.body;
  if (!newPassword || newPassword.length < 6)
    return fail(res, "Mật khẩu phải có ít nhất 6 ký tự", 400);

  const parent = await User.findOne({
    _id: req.params.id,
    role: { $regex: /^parent$/i },
  });
  if (!parent) return fail(res, "Không tìm thấy phụ huynh", 404);

  parent.password = newPassword;
  parent.plainPassword = newPassword;
  await parent.save();
  return ok(res, { message: "Đặt lại mật khẩu thành công" });
});

exports.getParentStudents = asyncHandler(async (req, res) => {
  if (req.user?.role === "Parent" && String(req.user._id) !== String(req.params.id)) {
    return fail(res, "Forbidden", 403);
  }
  const students = await Student.find({
    parentId: req.params.id,
    isDeleted: { $ne: true },
  });
  return ok(res, students);
});
