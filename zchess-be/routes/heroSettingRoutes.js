const express = require("express");
const heroSettingController = require("../controllers/heroSettingController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/public", heroSettingController.getPublicHeroSetting);
router.get("/", protect, authorize("Admin"), heroSettingController.getHeroSetting);
router.put(
  "/",
  protect,
  authorize("Admin"),
  heroSettingController.updateHeroSetting,
);

module.exports = router;
