const mongoose = require("mongoose");

const courseAccessSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    grantedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true },
);

courseAccessSchema.index({ courseId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model("CourseAccess", courseAccessSchema);
