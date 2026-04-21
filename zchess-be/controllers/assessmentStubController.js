const asyncHandler = require("../middleware/asyncHandler");
const Assessment = require("../models/Assessment");
const Class = require("../models/Class");
const Enrollment = require("../models/Enrollment");
const Student = require("../models/Student");

const ensureTeacherOwnsClass = async (classId, reqUser) => {
  if (reqUser.role !== "Teacher") return true;
  const ownClass = await Class.exists({ _id: classId, teacherId: reqUser._id });
  return Boolean(ownClass);
};

exports.listByClass = asyncHandler(async (req, res) => {
  const { classId } = req.params;
  const canAccess = await ensureTeacherOwnsClass(classId, req.user);
  if (!canAccess) {
    return res.status(403).json({ message: "Forbidden" });
  }

  const query = { classId };
  if (req.user.role === "Teacher") {
    query.teacherId = req.user._id;
  }

  const assessments = await Assessment.find(query)
    .populate("studentId", "fullName studentId")
    .populate("teacherId", "fullName username")
    .sort({ date: -1, createdAt: -1 });

  res.json(assessments);
});

exports.listByStudent = asyncHandler(async (req, res) => {
  const { studentId } = req.params;
  if (req.user.role === "Parent") {
    const owns = await Student.exists({ _id: studentId, parentId: req.user._id });
    if (!owns) {
      return res.status(403).json({ message: "Forbidden" });
    }
  }

  const query = { studentId };
  if (req.user.role === "Teacher") {
    query.teacherId = req.user._id;
  }

  const assessments = await Assessment.find(query)
    .populate("studentId", "fullName studentId")
    .populate("teacherId", "fullName username")
    .populate("classId", "className")
    .sort({ date: -1, createdAt: -1 });

  res.json(assessments);
});

exports.create = asyncHandler(async (req, res) => {
  const { classId, studentId, type, score, comment, date } = req.body;

  const canAccess = await ensureTeacherOwnsClass(classId, req.user);
  if (!canAccess) {
    return res.status(403).json({ message: "Forbidden" });
  }

  const enrollmentExists = await Enrollment.exists({ classId, studentId });
  if (!enrollmentExists) {
    return res.status(400).json({ message: "Học viên không thuộc lớp này" });
  }

  const teacherId = req.user.role === "Teacher" ? req.user._id : req.body.teacherId;
  const assessment = await Assessment.create({
    classId,
    studentId,
    teacherId,
    type: type || "Regular",
    score: Number(score),
    comment: comment || "",
    date: date ? new Date(date) : new Date(),
  });

  const populated = await Assessment.findById(assessment._id)
    .populate("studentId", "fullName studentId")
    .populate("teacherId", "fullName username")
    .populate("classId", "className");

  res.status(201).json(populated);
});

exports.update = asyncHandler(async (req, res) => {
  const assessment = await Assessment.findById(req.params.id);
  if (!assessment) {
    return res.status(404).json({ message: "Không tìm thấy bản đánh giá" });
  }

  const canAccess = await ensureTeacherOwnsClass(assessment.classId, req.user);
  if (!canAccess) {
    return res.status(403).json({ message: "Forbidden" });
  }
  if (
    req.user.role === "Teacher" &&
    String(assessment.teacherId) !== String(req.user._id)
  ) {
    return res.status(403).json({ message: "Forbidden" });
  }

  const patch = { ...req.body };
  delete patch.teacherId;
  if (patch.score !== undefined) patch.score = Number(patch.score);
  if (patch.date) patch.date = new Date(patch.date);

  const updated = await Assessment.findByIdAndUpdate(req.params.id, patch, {
    new: true,
    runValidators: true,
  })
    .populate("studentId", "fullName studentId")
    .populate("teacherId", "fullName username")
    .populate("classId", "className");

  res.json(updated);
});

exports.remove = asyncHandler(async (req, res) => {
  const assessment = await Assessment.findById(req.params.id);
  if (!assessment) {
    return res.status(404).json({ message: "Không tìm thấy bản đánh giá" });
  }

  if (
    req.user.role === "Teacher" &&
    String(assessment.teacherId) !== String(req.user._id)
  ) {
    return res.status(403).json({ message: "Forbidden" });
  }

  await Assessment.findByIdAndDelete(req.params.id);
  res.json({ message: "Đã xóa đánh giá" });
});
