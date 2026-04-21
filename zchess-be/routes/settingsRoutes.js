const express = require("express");
const { protect, authorize } = require("../middleware/authMiddleware");
const settingsController = require("../controllers/settingsController");

const router = express.Router();

router.get("/", settingsController.getSettings);
router.patch(
  "/",
  protect,
  authorize("Admin"),
  settingsController.updateSettings,
);

module.exports = router;
