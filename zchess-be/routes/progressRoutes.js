const express = require("express");
const router = express.Router();
const progressController = require("../controllers/progressController");
const { protect, authorize } = require("../middleware/authMiddleware");
const { validateObjectIdParam } = require("../middleware/paramValidationMiddleware");

// CRUD
router.get(
  "/export/:studentId/:classId",
  protect,
  authorize("Admin", "Teacher", "Parent"),
  validateObjectIdParam("studentId"),
  validateObjectIdParam("classId"),
  progressController.exportProgressReport,
);
router.get(
  "/:studentId/:classId/export",
  protect,
  authorize("Admin", "Teacher", "Parent"),
  validateObjectIdParam("studentId"),
  validateObjectIdParam("classId"),
  progressController.exportProgressReport,
);
router.get(
  "/:studentId/:classId",
  protect,
  authorize("Admin", "Teacher", "Parent"),
  validateObjectIdParam("studentId"),
  validateObjectIdParam("classId"),
  progressController.getProgress,
);
router.post("/", protect, authorize("Admin", "Teacher"), progressController.saveProgress);
router.delete(
  "/:studentId/:classId",
  protect,
  authorize("Admin", "Teacher"),
  validateObjectIdParam("studentId"),
  validateObjectIdParam("classId"),
  progressController.deleteProgress,
);

module.exports = router;
