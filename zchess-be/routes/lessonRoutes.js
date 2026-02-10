const express = require("express");
const router = express.Router();
const lessonController = require("../controllers/lessonController");
const { protect, authorize } = require("../middleware/authMiddleware");

// Protected (Admin/Teacher)
router.post("/", protect, authorize("Admin", "Teacher"), lessonController.createLesson);
router.put("/:id", protect, authorize("Admin", "Teacher"), lessonController.updateLesson);
router.delete("/:id", protect, authorize("Admin", "Teacher"), lessonController.deleteLesson);

// Public/Protected (View)
router.get("/:id", lessonController.getLessonById); // Verify access logic inside controller

module.exports = router;
