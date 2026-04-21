const Lesson = require("../models/Lesson");
const Chapter = require("../models/Chapter");
const Student = require("../models/Student");
const CourseAccess = require("../models/CourseAccess");
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
  const role = String(req.user?.role || "").toLowerCase();
  if (role === "admin") {
    return res.json(lesson);
  }
  const hasDirectAccess = req.user?._id
    ? Boolean(
        await CourseAccess.exists({ courseId: lesson.courseId, userId: req.user._id }),
      )
    : false;
  const isLinkedParent =
    role === "parent"
      ? Boolean(
          await Student.exists({
            parentId: req.user._id,
            _id: {
              $in: await CourseAccess.find({ courseId: lesson.courseId }).distinct(
                "userId",
              ),
            },
            isDeleted: { $ne: true },
          }),
        )
      : false;
  if (!hasDirectAccess && !isLinkedParent) {
    return res.status(403).json({
      message:
        "Bạn không có quyền xem nội dung bài học. Vui lòng liên hệ Admin để được cấp quyền.",
    });
  }
  res.json(lesson);
});
