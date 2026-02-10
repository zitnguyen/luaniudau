const Lesson = require("../models/Lesson");
const Chapter = require("../models/Chapter");
const Course = require("../models/Course");

// 1. Create a Lesson
exports.createLesson = async (req, res) => {
  try {
    const { title, chapterId, type, content, duration, isFree, order } = req.body;

    // Verify chapter exists
    const chapter = await Chapter.findById(chapterId);
    if (!chapter) {
        return res.status(404).json({ message: "Chương không tồn tại" });
    }

    const lesson = await Lesson.create({
      title,
      chapterId,
      courseId: chapter.courseId, // Denormalize courseId for easier querying
      type,
      content,
      duration,
      isFree,
      order
    });

    // Update course totalLessons and totalDuration (Optional but good for performance)
    // await Course.findByIdAndUpdate(chapter.courseId, { $inc: { totalLessons: 1, totalDuration: duration || 0 } });

    res.status(201).json(lesson);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// 2. Update Lesson
exports.updateLesson = async (req, res) => {
  try {
    const lesson = await Lesson.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!lesson) {
      return res.status(404).json({ message: "Bài học không tồn tại" });
    }

    res.json(lesson);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// 3. Delete Lesson
exports.deleteLesson = async (req, res) => {
  try {
    const lesson = await Lesson.findByIdAndDelete(req.params.id);
    if (!lesson) {
      return res.status(404).json({ message: "Bài học không tồn tại" });
    }
    
    // Decrease totalLessons/totalDuration in Course if needed

    res.json({ message: "Đã xóa bài học" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 4. Get Lesson Detail (Check access rights - Todo)
exports.getLessonById = async (req, res) => {
    try {
        const lesson = await Lesson.findById(req.params.id);
        if (!lesson) {
            return res.status(404).json({ message: "Bài học không tồn tại" });
        }
        // TODO: Check if user has purchased the course (or isFree is true)
        res.json(lesson);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
