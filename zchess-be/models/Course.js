const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, trim: true },
  description: { type: String, required: true },
  thumbnail: { type: String }, // URL to image
  heroBackground: { type: String, trim: true },
  price: { type: Number, required: true, default: 0 },
  salePrice: { type: Number, default: 0 },
  level: { 
    type: String, 
    enum: ["Beginner", "Intermediate", "Advanced", "All Levels"],
    default: "All Levels" 
  },
  category: { 
    type: String, 
    enum: ["Opening", "Strategy", "Tactics", "Endgame", "General"],
    default: "General"
  },
  tags: [{ type: String }],
  instructor: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Link to a Teacher/Admin user
  isPublished: { type: Boolean, default: false },
  totalLessons: { type: Number, default: 0 },
  totalDuration: { type: Number, default: 0 }, // in minutes
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Calculate discount percentage
courseSchema.virtual("discountPercentage").get(function() {
  if (this.price > 0 && this.salePrice > 0 && this.salePrice < this.price) {
    return Math.round(((this.price - this.salePrice) / this.price) * 100);
  }
  return 0;
});

const Course = mongoose.model("Course", courseSchema);
module.exports = Course;
