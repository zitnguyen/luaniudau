const mongoose = require("mongoose");

const inquirySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, trim: true },
  phone: { type: String, required: true, trim: true }, // Crucial for callbacks
  message: { type: String },
  type: { 
      type: String, 
      enum: ["General", "Trial", "Consultation"], 
      default: "General" 
  },
  status: { 
      type: String, 
      enum: ["New", "Contacted", "Converted", "Closed"], 
      default: "New" 
  },
  notes: { type: String }, // Admin notes
  createdAt: { type: Date, default: Date.now }
});

const Inquiry = mongoose.model("Inquiry", inquirySchema);
module.exports = Inquiry;
