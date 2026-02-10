const express = require("express");
const router = express.Router();
const scheduleController = require("../controllers/scheduleController");

// Lấy lịch học của học viên
router.get("/student/:studentId", scheduleController.getByStudentId);

// Tạo hoặc cập nhật lịch học
router.put("/student/:studentId", scheduleController.upsertByStudentId);

// Xóa lịch học
router.delete("/student/:studentId", scheduleController.deleteByStudentId);

module.exports = router;
