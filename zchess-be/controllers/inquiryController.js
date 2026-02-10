const Inquiry = require("../models/Inquiry");

// Create Inquiry (Public)
exports.createInquiry = async (req, res) => {
  try {
    const { name, email, phone, message, type } = req.body;
    
    const inquiry = new Inquiry({
      name,
      email,
      phone,
      message,
      type
    });

    await inquiry.save();
    res.status(201).json({ message: "Inquiry submitted successfully", inquiry });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get All Inquiries (Admin)
exports.getInquiries = async (req, res) => {
  try {
    const inquiries = await Inquiry.find().sort({ createdAt: -1 });
    res.json(inquiries);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update Status/Notes (Admin)
exports.updateInquiry = async (req, res) => {
  try {
    const inquiry = await Inquiry.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!inquiry) return res.status(404).json({ message: "Inquiry not found" });
    res.json(inquiry);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
