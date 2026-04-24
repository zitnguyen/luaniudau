const mongoose = require("mongoose");

const lessonChessProgressSchema = new mongoose.Schema(
  {
    lessonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lesson",
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    fen: { type: String, trim: true, default: "" },
    pgn: { type: String, trim: true, default: "" },
    moves: [{ type: String, trim: true }],
  },
  { timestamps: true },
);

lessonChessProgressSchema.index({ lessonId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model("LessonChessProgress", lessonChessProgressSchema);
