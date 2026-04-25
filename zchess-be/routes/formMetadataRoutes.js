const express = require("express");
const { protect, authorize } = require("../middleware/authMiddleware");
const controller = require("../controllers/formMetadataController");

const router = express.Router();

router.use(protect, authorize("Admin"));
router.get("/", controller.getForms);
router.get("/:formId", controller.getFormById);

module.exports = router;
