const express = require("express");
const router = express.Router();
const progressController = require("../controllers/progressController");

// CRUD
router.get("/:studentId/:classId", progressController.getProgress);
router.post("/", progressController.saveProgress);
router.delete("/:studentId/:classId", progressController.deleteProgress);

// Export report
router.get("/:studentId/:classId/export", progressController.exportProgressReport);

module.exports = router;
