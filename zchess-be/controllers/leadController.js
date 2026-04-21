const Inquiry = require("../models/Inquiry");
const asyncHandler = require("../middleware/asyncHandler");

exports.createLead = asyncHandler(async (req, res) => {
  const { name, email, phone, message } = req.body;
  const doc = await Inquiry.create({
    name: name || "Lead",
    email: email || "",
    phone: phone || "0000000000",
    message: message || "",
    type: "General",
    status: "New",
  });
  res.status(201).json({ ok: true, inquiry: doc });
});
