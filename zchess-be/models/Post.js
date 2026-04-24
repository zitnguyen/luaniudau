const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, trim: true },
  content: { type: String, required: true },
  summary: { type: String, trim: true },
  thumbnail: { type: String },
  images: [{ type: String, trim: true }],
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  category: { type: String, default: "General" },
  tags: [{ type: String }],
  isPublished: { type: Boolean, default: false },
  views: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Post = mongoose.model("Post", postSchema);
module.exports = Post;
