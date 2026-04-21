const Testimonial = require("../models/Testimonial");
const asyncHandler = require("../middleware/asyncHandler");

exports.getPublicTestimonials = asyncHandler(async (req, res) => {
  const items = await Testimonial.find({ isPublished: true })
    .sort({ sortOrder: 1, createdAt: -1 })
    .limit(20);
  res.json(items);
});

exports.getTestimonials = asyncHandler(async (req, res) => {
  const items = await Testimonial.find({})
    .populate("createdBy", "fullName username")
    .sort({ sortOrder: 1, createdAt: -1 });
  res.json(items);
});

exports.getTestimonialById = asyncHandler(async (req, res) => {
  const item = await Testimonial.findById(req.params.id).populate(
    "createdBy",
    "fullName username",
  );
  if (!item) return res.status(404).json({ message: "Testimonial not found" });
  res.json(item);
});

exports.createTestimonial = asyncHandler(async (req, res) => {
  const payload = {
    name: req.body.name,
    role: req.body.role || "",
    content: req.body.content,
    image: req.body.image || "",
    rating: Number(req.body.rating || 5),
    isPublished: Boolean(req.body.isPublished),
    sortOrder: Number(req.body.sortOrder || 0),
    createdBy: req.user?._id || null,
  };
  const item = await Testimonial.create(payload);
  res.status(201).json(item);
});

exports.updateTestimonial = asyncHandler(async (req, res) => {
  const item = await Testimonial.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      role: req.body.role || "",
      content: req.body.content,
      image: req.body.image || "",
      rating: Number(req.body.rating || 5),
      isPublished: Boolean(req.body.isPublished),
      sortOrder: Number(req.body.sortOrder || 0),
    },
    { new: true },
  );
  if (!item) return res.status(404).json({ message: "Testimonial not found" });
  res.json(item);
});

exports.deleteTestimonial = asyncHandler(async (req, res) => {
  const item = await Testimonial.findByIdAndDelete(req.params.id);
  if (!item) return res.status(404).json({ message: "Testimonial not found" });
  res.json({ message: "Deleted successfully" });
});
