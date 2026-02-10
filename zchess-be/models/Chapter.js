const mongoose = require("mongoose");

const chapterSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
  order: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

const Chapter = mongoose.model("Chapter", chapterSchema);
module.exports = Chapter;
