const mongoose = require("mongoose");
const scheduleSchema = new mongoose.Schema({
  scheduleId: { type: Number, required: true, unique: true }, 
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student", 
  },
  slots: [{ 
    day: { type: Number }, // 0=Sun, 1=Mon
    time: { type: String }, // "18:00"
    duration: { type: Number, default: 90 }
  }],
  startDate: { type: Date },
  room: { 
    type: String, 
    enum: ["Học tại trung tâm", "Học online", "Học kèm tại nhà"],
    default: "Học tại trung tâm"
  }, 
});

const Schedule = mongoose.model("Schedule", scheduleSchema);
module.exports = Schedule;
