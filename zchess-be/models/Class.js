const mongoose = require("mongoose");

const classSchema = new mongoose.Schema(
  {
    classId: {
      type: String,
      required: true,
      unique: true,
      default: () => `CL-${Date.now()}`
    },

    className: {
      type: String,
      required: true,
    },

    description: String,
    fee: Number,
    level: String,
    maxStudents: Number,
    totalSessions: { type: Number, default: 16 },
    durationWeeks: Number,

    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
      default: null,
    },

    startDate: {
      type: Date,
    },

    schedule: {
      type: String,
    },

    currentStudents: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: ["Pending", "Active", "Finished"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Class", classSchema);
