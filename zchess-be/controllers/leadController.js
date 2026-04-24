const Inquiry = require("../models/Inquiry");
const asyncHandler = require("../middleware/asyncHandler");
const Notification = require("../models/Notification");
const NotificationRecipient = require("../models/NotificationRecipient");
const User = require("../models/User");

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

  const adminUsers = await User.find({ role: "Admin" }).select("_id");
  if (adminUsers.length > 0) {
    const notification = await Notification.create({
      title: "Có phụ huynh liên hệ mới",
      content: `Liên hệ mới từ ${name || "Phụ huynh"}${phone ? ` - SĐT: ${phone}` : ""}`,
      createdBy: adminUsers[0]._id,
    });

    await NotificationRecipient.insertMany(
      adminUsers.map((admin) => ({
        notificationId: notification._id,
        userId: admin._id,
        roleSnapshot: "Admin",
        isRead: false,
        readAt: null,
      })),
      { ordered: false },
    );
  }

  res.status(201).json({ ok: true, inquiry: doc });
});
