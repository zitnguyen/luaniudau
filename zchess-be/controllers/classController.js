const Class = require("../models/Class");
const asyncHandler = require("../middleware/asyncHandler");

exports.createClass = asyncHandler(async (req, res) => {
  const newClass = await Class.create({
    ...req.body,
    status: "Pending",
  });

  res.status(201).json(newClass);
});

exports.getAllClasses = asyncHandler(async (req, res) => {
  const { teacherId, status, keyword } = req.query;
  const filter = {};

  if (teacherId) filter.teacherId = teacherId;
  if (status) filter.status = status;
  if (keyword) {
    filter.className = { $regex: keyword, $options: "i" };
  }

  const classes = await Class.find(filter)
    .populate("teacherId", "fullName email phone")
    .sort("-createdAt");

  res.json(classes);
});

exports.getClassesByTeacher = asyncHandler(async (req, res) => {
  const { teacherId } = req.params;
  const filter = { teacherId };

  if (
    req.user &&
    req.user.role === "Teacher" &&
    String(req.user._id) !== String(teacherId)
  ) {
    return res.status(403).json({ message: "Forbidden" });
  }

  const classes = await Class.find(filter)
    .populate("teacherId", "fullName email phone username")
    .sort("-createdAt");

  res.json(classes);
});

exports.getClassById = asyncHandler(async (req, res) => {
  const classItem = await Class.findById(req.params.id).populate(
    "teacherId",
    "fullName email",
  );

  if (!classItem) {
    return res.status(404).json({ message: "Lớp học không tồn tại" });
  }

  res.json(classItem);
});

exports.updateClass = asyncHandler(async (req, res) => {
  const classItem = await Class.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!classItem) {
    return res.status(404).json({ message: "Lớp học không tồn tại" });
  }

  res.json(classItem);
});

exports.deleteClass = asyncHandler(async (req, res) => {
  const classItem = await Class.findByIdAndDelete(req.params.id);
  if (!classItem) {
    return res.status(404).json({ message: "Lớp học không tồn tại" });
  }

  res.json({ message: "Đã xóa lớp học" });
});
