const mongoose = require("mongoose");
const progressSchema = new mongoose.Schema({

  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true,
  },
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Class",
    required: true,
  },
  sessions: [
    {
      attendanceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Attendance",
      },
      content: String, // Nội dung buổi học
      assessment: String, // Đánh giá từng buổi
    },
  ],

  midTermEvaluation: {
    score: Number,
    comment: String,
    date: Date,
  },

  finalTermEvaluation: {
    score: Number,
    comment: String,
    date: Date,
  },

  teacherFeedback: {
    strengths: String,
    weaknesses: String,
    improvementPlan: String,
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Progress = mongoose.model("Progress", progressSchema);
module.exports = Progress;
