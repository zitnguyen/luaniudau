const Review = require("../models/Review");
const asyncHandler = require("../middleware/asyncHandler");
const CourseAccess = require("../models/CourseAccess");
const Student = require("../models/Student");

const canReviewCourse = async (courseId, user) => {
  if (!user) return false;
  const role = String(user.role || "").toLowerCase();
  if (role === "admin") return true;

  const hasDirectAccess = await CourseAccess.exists({
    courseId,
    userId: user._id,
  });
  if (hasDirectAccess) return true;

  if (role === "parent") {
    const grantedUserIds = await CourseAccess.find({ courseId }).distinct("userId");
    const hasLinkedStudentWithAccess = await Student.exists({
      parentId: user._id,
      _id: { $in: grantedUserIds },
      isDeleted: { $ne: true },
    });
    return Boolean(hasLinkedStudentWithAccess);
  }

  return false;
};

exports.getReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ courseId: req.params.courseId })
    .populate("userId", "fullName")
    .sort({ createdAt: -1 });
  res.json(reviews);
});

exports.createReview = asyncHandler(async (req, res) => {
  const { courseId, rating, comment } = req.body;
  const allowed = await canReviewCourse(courseId, req.user);
  if (!allowed) {
    return res.status(403).json({
      message:
        "Bạn chưa có quyền xem nội dung bài học của khóa này nên chưa thể đánh giá.",
    });
  }

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

exports.updateReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  const updateData = {};
  if (rating !== undefined) updateData.rating = rating;
  if (comment !== undefined) updateData.comment = comment;

  const review = await Review.findByIdAndUpdate(req.params.id, updateData, {
    new: true,
    runValidators: true,
  }).populate("userId", "fullName");

  if (!review) {
    return res.status(404).json({ message: "Review not found" });
  }
  res.json(review);
});

exports.deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findByIdAndDelete(req.params.id);
  if (!review) {
    return res.status(404).json({ message: "Review not found" });
  }
  res.json({ message: "Review deleted" });
});
