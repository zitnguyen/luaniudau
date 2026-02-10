const mongoose = require("mongoose");
const studentSchema = new mongoose.Schema({
  studentId: {
    type: String,
    required: true,
    unique: true,
    default: () => `ST-${Date.now()}`,
  },
  fullName: { type: String, required: true },
  dateOfBirth: { type: Date },
  address: { type: String },
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  skillLevel: { type: String },
  note: { type: String },
});
const Student = mongoose.model("Student", studentSchema);
module.exports = Student;
