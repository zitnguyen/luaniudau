const express = require("express");
const router = express.Router();
const chapterController = require("../controllers/chapterController");
const { protect, authorize } = require("../middleware/authMiddleware");

// All routes are protected
router.post("/", protect, authorize("Admin", "Teacher"), chapterController.createChapter);
router.put("/:id", protect, authorize("Admin", "Teacher"), chapterController.updateChapter);
router.delete("/:id", protect, authorize("Admin", "Teacher"), chapterController.deleteChapter);
router.get("/course/:courseId", chapterController.getChaptersByCourse); // Public or Protected depending on strategy

module.exports = router;
