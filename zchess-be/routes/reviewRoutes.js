const express = require("express");
const router = express.Router();
const reviewController = require("../controllers/reviewController");
const { protect, authorize } = require("../middleware/authMiddleware");

// Public: Get reviews
router.get("/course/:courseId", reviewController.getReviews);

// Protected: Any authenticated user can review
router.post("/", protect, reviewController.createReview);

// Protected: Admin only can delete (moderation)
router.put("/:id", protect, authorize("Admin"), reviewController.updateReview);
router.delete("/:id", protect, authorize("Admin"), reviewController.deleteReview);

module.exports = router;
