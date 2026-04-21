const Chapter = require("../models/Chapter");
const Course = require("../models/Course");
const Lesson = require("../models/Lesson");
const mongoose = require("mongoose");
const asyncHandler = require("../middleware/asyncHandler");

exports.createChapter = asyncHandler(async (req, res) => {
  const { title, courseId, order } = req.body;
  if (!title || !String(title).trim()) {
    return res.status(400).json({ message: "Tên chương là bắt buộc" });
  }
  if (!courseId || !mongoose.Types.ObjectId.isValid(courseId)) {
    return res.status(400).json({ message: "courseId không hợp lệ" });
  }

  const course = await Course.findById(courseId);
  if (!course) {
    return res.status(404).json({ message: "Khóa học không tồn tại" });
  }

  let nextOrder = Number.isFinite(Number(order)) ? Number(order) : undefined;
  if (nextOrder === undefined) {
    const lastChapter = await Chapter.findOne({ courseId }).sort({ order: -1 });
    nextOrder = lastChapter ? Number(lastChapter.order || 0) + 1 : 1;
  }

  const chapter = await Chapter.create({
    title: String(title).trim(),
    courseId,
    order: nextOrder,
  });

  res.status(201).json(chapter);
});

exports.updateChapter = asyncHandler(async (req, res) => {
  const chapter = await Chapter.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!chapter) {
    return res.status(404).json({ message: "Chương không tồn tại" });
  }

  res.json(chapter);
});

exports.deleteChapter = asyncHandler(async (req, res) => {
  const chapter = await Chapter.findByIdAndDelete(req.params.id);
  if (!chapter) {
    return res.status(404).json({ message: "Chương không tồn tại" });
  }

  await Lesson.deleteMany({ chapterId: chapter._id });

  res.json({ message: "Đã xóa chương và các bài học liên quan" });
});

exports.getChaptersByCourse = asyncHandler(async (req, res) => {
  const chapters = await Chapter.find({ courseId: req.params.courseId }).sort(
    "order",
  );
  res.json(chapters);
});
