const express = require("express");
const router = express.Router();
const c = require("../controllers/teachingLogStubController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.get("/my-logs", protect, authorize("Admin", "Teacher"), c.listMine);
router.post("/", protect, authorize("Admin", "Teacher"), c.create);
router.put("/:id", protect, authorize("Admin", "Teacher"), c.update);
router.delete("/:id", protect, authorize("Admin", "Teacher"), c.remove);

module.exports = router;
