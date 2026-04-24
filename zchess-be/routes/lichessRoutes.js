const express = require("express");
const { protect, authorize } = require("../middleware/authMiddleware");
const lichessController = require("../controllers/lichessController");

const router = express.Router();

router.get("/account", protect, authorize("Admin"), lichessController.getMyLichessAccount);

module.exports = router;
