const Attendance = require("../models/Attendance");

// Create or update attendance for a single student (simplified for model match)
exports.markAttendance = async (req, res) => {
  try {
    const { classId, studentId, date, status, note } = req.body;

    let attendance = await Attendance.findOne({ classId, studentId, date });

    if (attendance) {
      attendance.status = status;
      attendance.note = note;
      await attendance.save();
    } else {
      attendance = new Attendance({
        classId,
        studentId,
        date,
        status,
        note
      });
      await attendance.save();
    }

    res.status(201).json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get attendance by class
exports.getClassAttendance = async (req, res) => {
  try {
    const { classId } = req.params;
    const attendance = await Attendance.find({ classId }).populate("studentId", "fullName");
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update specific attendance record
exports.updateAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const attendance = await Attendance.findByIdAndUpdate(id, req.body, { new: true });
    if (!attendance) return res.status(404).json({ message: "Not found" });
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
