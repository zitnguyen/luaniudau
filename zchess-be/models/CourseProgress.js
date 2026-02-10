const mongoose = require("mongoose");

const courseProgressSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
  completedLessons: [{ type: mongoose.Schema.Types.ObjectId, ref: "Lesson" }],
  lastWatchedLessonId: { type: mongoose.Schema.Types.ObjectId, ref: "Lesson" },
  progressPercentage: { type: Number, default: 0 },
  lastAccessed: { type: Date, default: Date.now },
  isCompleted: { type: Boolean, default: false },
  completedAt: { type: Date }
});

// Compound index to ensure a user has only one progress record per course
courseProgressSchema.index({ userId: 1, courseId: 1 }, { unique: true });

const CourseProgress = mongoose.model("CourseProgress", courseProgressSchema);
module.exports = CourseProgress;
