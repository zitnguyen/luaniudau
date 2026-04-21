const mongoose = require("mongoose");
const SKILL_LEVELS = [
  "kid1",
  "kid2",
  "level1",
  "level2",
  "level3",
  "level4",
  "level5",
  "level6",
  "level7",
  "level8",
  "level9",
  "level10",
];

const studentSchema = new mongoose.Schema(
  {
    studentId: {
      type: String,
      required: true,
      unique: true,
      default: () => `ST-${Date.now()}`,
    },
    fullName: { type: String, required: true, trim: true },
    dateOfBirth: { type: Date },
    enrollmentDate: { type: Date },
    address: { type: String, trim: true },
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    skillLevel: {
      type: String,
      enum: SKILL_LEVELS,
      trim: true,
    },
    totalSessions: { type: Number, default: 0, min: 0 },
    totalLessons: { type: Number, default: 0, min: 0 },
    completedLessons: { type: Number, default: 0, min: 0 },
    note: { type: String, trim: true },
    isDeleted: { type: Boolean, default: false, index: true },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true },
);
const Student = mongoose.model("Student", studentSchema);
module.exports = Student;
