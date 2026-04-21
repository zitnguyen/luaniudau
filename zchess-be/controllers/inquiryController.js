const Inquiry = require("../models/Inquiry");
const asyncHandler = require("../middleware/asyncHandler");

exports.createInquiry = asyncHandler(async (req, res) => {
  const { name, email, phone, message, type } = req.body;

  const inquiry = new Inquiry({
    name,
    email,
    phone,
    message,
    type,
  });

  await inquiry.save();
  res.status(201).json({ message: "Inquiry submitted successfully", inquiry });
});

exports.getInquiries = asyncHandler(async (req, res) => {
  const inquiries = await Inquiry.find().sort({ createdAt: -1 });
  res.json(inquiries);
});

exports.updateInquiry = asyncHandler(async (req, res) => {
  const inquiry = await Inquiry.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  if (!inquiry) return res.status(404).json({ message: "Inquiry not found" });
  res.json(inquiry);
});
