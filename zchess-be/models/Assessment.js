const mongoose = require("mongoose");

const assessmentSchema = new mongoose.Schema(
  {
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["Regular", "MidTerm", "EndTerm"],
      default: "Regular",
    },
    score: {
      type: Number,
      min: 0,
      max: 10,
      required: true,
    },
    comment: {
      type: String,
      trim: true,
      default: "",
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Assessment", assessmentSchema);
