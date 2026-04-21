const express = require("express");
const router = express.Router();
const c = require("../controllers/assessmentStubController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.get(
  "/class/:classId",
  protect,
  authorize("Admin", "Teacher"),
  c.listByClass,
);
router.get(
  "/student/:studentId",
  protect,
  authorize("Admin", "Teacher", "Parent"),
  c.listByStudent,
);
router.post("/", protect, authorize("Admin", "Teacher"), c.create);
router.put("/:id", protect, authorize("Admin", "Teacher"), c.update);
router.delete("/:id", protect, authorize("Admin", "Teacher"), c.remove);

module.exports = router;
