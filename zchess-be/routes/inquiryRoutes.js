const express = require("express");
const router = express.Router();
const inquiryController = require("../controllers/inquiryController");
const { protect, authorize } = require("../middleware/authMiddleware");

// Public Create
router.post("/", inquiryController.createInquiry);

// Protected Admin (Read/Update)
router.get("/", protect, authorize("Admin"), inquiryController.getInquiries);
router.put("/:id", protect, authorize("Admin"), inquiryController.updateInquiry);

module.exports = router;
