const express = require("express");
const router = express.Router();
const lessonController = require("../controllers/lessonController");
const { protect, authorize, optionalProtect } = require("../middleware/authMiddleware");

// Protected (Admin/Teacher)
router.post("/", protect, authorize("Admin", "Teacher"), lessonController.createLesson);
router.put("/:id", protect, authorize("Admin", "Teacher"), lessonController.updateLesson);
router.delete("/:id", protect, authorize("Admin", "Teacher"), lessonController.deleteLesson);

// Public/Protected (View)
router.get("/:id/next", protect, lessonController.getNextLesson);
router.get("/:id/prev", protect, lessonController.getPrevLesson);
router.get("/:id", optionalProtect, lessonController.getLessonById); // Verify access logic inside controller
router.get("/:id/chess-progress", protect, lessonController.getMyChessProgress);
router.put("/:id/chess-progress", protect, lessonController.saveMyChessProgress);

module.exports = router;
