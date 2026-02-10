const express = require("express");
const router = express.Router();
const attendanceController = require("../controllers/attendanceController");
const { protect, authorize } = require("../middleware/authMiddleware");

// Teachers/Admin take attendance
router.post("/", protect, authorize("Admin", "Teacher"), attendanceController.markAttendance);
router.get("/class/:classId", protect, authorize("Admin", "Teacher"), attendanceController.getClassAttendance);
router.put("/:id", protect, authorize("Admin", "Teacher"), attendanceController.updateAttendance);

module.exports = router;
