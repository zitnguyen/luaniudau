const Review = require("../models/Review");

// Get reviews for a course
exports.getReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ courseId: req.params.courseId })
      .populate("userId", "fullName")
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a review
exports.createReview = async (req, res) => {
  try {
    const { courseId, rating, comment } = req.body;

    // Check if user already reviewed? Limit 1 review per user per course?
    const existingReview = await Review.findOne({ userId: req.user._id, courseId });
    if (existingReview) {
        return res.status(400).json({ message: "You have already reviewed this course" });
    }

    const review = new Review({
      userId: req.user._id,
      courseId,
      rating,
      comment
    });

    await review.save();
    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a review (Admin only)
exports.deleteReview = async (req, res) => {
  try {
      const review = await Review.findByIdAndDelete(req.params.id);
      if (!review) {
          return res.status(404).json({ message: "Review not found" });
      }
      res.json({ message: "Review deleted" });
  } catch (error) {
      res.status(500).json({ message: error.message });
  }
};
