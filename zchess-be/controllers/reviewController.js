const Review = require("../models/Review");
const asyncHandler = require("../middleware/asyncHandler");

exports.getReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ courseId: req.params.courseId })
    .populate("userId", "fullName")
    .sort({ createdAt: -1 });
  res.json(reviews);
});

exports.createReview = asyncHandler(async (req, res) => {
  const { courseId, rating, comment } = req.body;

  const existingReview = await Review.findOne({
    userId: req.user._id,
    courseId,
  });
  if (existingReview) {
    return res
      .status(400)
      .json({ message: "You have already reviewed this course" });
  }

  const review = new Review({
    userId: req.user._id,
    courseId,
    rating,
    comment,
  });

  await review.save();
  res.status(201).json(review);
});

exports.deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findByIdAndDelete(req.params.id);
  if (!review) {
    return res.status(404).json({ message: "Review not found" });
  }
  res.json({ message: "Review deleted" });
});
