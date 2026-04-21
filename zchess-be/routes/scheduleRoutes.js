const express = require("express");
const router = express.Router();
const scheduleController = require("../controllers/scheduleController");
const { protect, authorize } = require("../middleware/authMiddleware");
const { validateObjectIdParam } = require("../middleware/paramValidationMiddleware");

router.get("/", protect, authorize("Admin", "Teacher", "Parent"), scheduleController.getAllSchedules);

router.get(
  "/student/:studentId",
  protect,
  authorize("Admin", "Teacher", "Parent"),
  validateObjectIdParam("studentId"),
  scheduleController.getByStudentId,
);

router.put(
  "/student/:studentId",
  protect,
  authorize("Admin", "Teacher"),
  validateObjectIdParam("studentId"),
  scheduleController.upsertByStudentId,
);

router.delete(
  "/student/:studentId",
  protect,
  authorize("Admin", "Teacher"),
  validateObjectIdParam("studentId"),
  scheduleController.deleteByStudentId,
);

module.exports = router;
