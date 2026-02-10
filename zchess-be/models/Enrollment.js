const mongoose = require("mongoose");
const enrollmentSchema = new mongoose.Schema({
  enrollmentId: { 
    type: String, 
    required: true, 
    unique: true, 
    default: () => `EN-${Date.now()}` 
  },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student" },
  classId: { type: mongoose.Schema.Types.ObjectId, ref: "Class" },
  enrollmentDate: { type: Date, default: Date.now },
  status: { 
    type: String, 
    enum: ["Active", "Completed", "Dropped", "Reserved"], 
    default: "Active" 
  },
  feeAmount: Number,
  paymentStatus: { 
    type: String, 
    enum: ["unpaid", "paid", "partial"], 
    default: "unpaid" 
  },
  sessionsTotal: { type: Number, default: 0 }, // Tổng số buổi của khóa
  sessionsUsed: { type: Number, default: 0 },  // Số buổi đã học
});

const Enrollment = mongoose.model("Enrollment", enrollmentSchema);
module.exports = Enrollment;
