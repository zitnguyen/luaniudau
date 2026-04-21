const Lesson = require("../models/Lesson");
const Chapter = require("../models/Chapter");
const asyncHandler = require("../middleware/asyncHandler");

exports.createLesson = asyncHandler(async (req, res) => {
  const { title, chapterId, type, content, duration, isFree, order } =
    req.body;

  const chapter = await Chapter.findById(chapterId);
  if (!chapter) {
    return res.status(404).json({ message: "Chương không tồn tại" });
  }

  const lesson = await Lesson.create({
    title,
    chapterId,
    courseId: chapter.courseId,
    type,
    content,
    duration,
    isFree,
    order,
  });

  res.status(201).json(lesson);
});

exports.updateLesson = asyncHandler(async (req, res) => {
  const lesson = await Lesson.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!lesson) {
    return res.status(404).json({ message: "Bài học không tồn tại" });
  }

  res.json(lesson);
});

exports.deleteLesson = asyncHandler(async (req, res) => {
  const lesson = await Lesson.findByIdAndDelete(req.params.id);
  if (!lesson) {
    return res.status(404).json({ message: "Bài học không tồn tại" });
  }

  res.json({ message: "Đã xóa bài học" });
});

exports.getLessonById = asyncHandler(async (req, res) => {
  const lesson = await Lesson.findById(req.params.id);
  if (!lesson) {
    return res.status(404).json({ message: "Bài học không tồn tại" });
  }
  res.json(lesson);
});
