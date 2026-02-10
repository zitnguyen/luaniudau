const Chapter = require("../models/Chapter");
const Course = require("../models/Course");
const Lesson = require("../models/Lesson");

// 1. Create a Chapter
exports.createChapter = async (req, res) => {
  try {
    const { title, courseId, order } = req.body;

    // Verify course exists
    const course = await Course.findById(courseId);
    if (!course) {
        return res.status(404).json({ message: "Khóa học không tồn tại" });
    }

    const chapter = await Chapter.create({
      title,
      courseId,
      order
    });

    res.status(201).json(chapter);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// 2. Update Chapter
exports.updateChapter = async (req, res) => {
  try {
    const chapter = await Chapter.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!chapter) {
      return res.status(404).json({ message: "Chương không tồn tại" });
    }

    res.json(chapter);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// 3. Delete Chapter
exports.deleteChapter = async (req, res) => {
  try {
    const chapter = await Chapter.findByIdAndDelete(req.params.id);
    if (!chapter) {
      return res.status(404).json({ message: "Chương không tồn tại" });
    }
    
    // Delete all lessons in this chapter
    await Lesson.deleteMany({ chapterId: chapter._id });

    res.json({ message: "Đã xóa chương và các bài học liên quan" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 4. Get Chapters by CourseId (Internal use or specific API)
exports.getChaptersByCourse = async (req, res) => {
    try {
        const chapters = await Chapter.find({ courseId: req.params.courseId }).sort("order");
        res.json(chapters);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
