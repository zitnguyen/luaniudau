const express = require("express");
const router = express.Router();
const scheduleController = require("../controllers/scheduleController");
const { protect, authorize } = require("../middleware/authMiddleware");
router.get(
  "/",
  protect,
  authorize("Admin", "Teacher", "Parent", "Student"),
  scheduleController.getAllSchedules,
);

module.exports = router;
