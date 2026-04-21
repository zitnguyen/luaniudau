const asyncHandler = require("../middleware/asyncHandler");
const Notification = require("../models/Notification");
const NotificationRecipient = require("../models/NotificationRecipient");
const User = require("../models/User");

const TARGETABLE_ROLES = ["Teacher", "Parent", "Student"];

const normalizeRoles = (targetRoles) => {
  if (!Array.isArray(targetRoles) || targetRoles.length === 0) {
    return TARGETABLE_ROLES;
  }
  const normalized = targetRoles
    .map((role) => String(role || "").trim())
    .filter(Boolean)
    .map((role) => {
      if (role.toLowerCase() === "all") return "ALL";
      return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
    });
  if (normalized.includes("ALL")) return TARGETABLE_ROLES;
  return [...new Set(normalized)].filter((role) => TARGETABLE_ROLES.includes(role));
};

exports.createNotification = asyncHandler(async (req, res) => {
  const { title, content, targetRoles, userIds = [] } = req.body || {};

  if (!title || !content) {
    return res.status(400).json({ message: "Thiếu title hoặc content" });
  }

  const roles = normalizeRoles(targetRoles);
  if (roles.length === 0) {
    return res.status(400).json({ message: "Không có role nhận hợp lệ" });
  }

  const recipientFilter = { role: { $in: roles } };
  if (Array.isArray(userIds) && userIds.length > 0) {
    recipientFilter._id = { $in: userIds };
  }
  const recipients = await User.find(recipientFilter).select("_id role");
  if (!recipients.length) {
    return res.status(400).json({ message: "Không tìm thấy người nhận phù hợp" });
  }

  const notification = await Notification.create({
    title: String(title).trim(),
    content: String(content).trim(),
    createdBy: req.user._id,
  });

  await NotificationRecipient.insertMany(
    recipients.map((recipient) => ({
      notificationId: notification._id,
      userId: recipient._id,
      roleSnapshot: recipient.role,
      isRead: false,
      readAt: null,
    })),
    { ordered: false },
  );

  res.status(201).json({
    ...notification.toObject(),
    recipientsCount: recipients.length,
  });
});

exports.getMyNotifications = asyncHandler(async (req, res) => {
  const recipientDocs = await NotificationRecipient.find({ userId: req.user._id })
    .sort({ createdAt: -1 })
    .populate({
      path: "notificationId",
      populate: { path: "createdBy", select: "fullName username role" },
    });

  const items = recipientDocs
    .filter((doc) => doc.notificationId)
    .map((doc) => ({
      id: doc.notificationId._id,
      recipientId: doc._id,
      title: doc.notificationId.title,
      content: doc.notificationId.content,
      createdAt: doc.notificationId.createdAt,
      createdBy: doc.notificationId.createdBy,
      isRead: doc.isRead,
      readAt: doc.readAt,
      roleSnapshot: doc.roleSnapshot,
    }));

  const unreadCount = items.filter((item) => !item.isRead).length;
  const latestUnreadCreatedAt =
    items
      .filter((item) => !item.isRead)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0]
      ?.createdAt || null;
  res.json({ items, unreadCount, latestUnreadCreatedAt });
});

exports.getNotificationDetail = asyncHandler(async (req, res) => {
  const { id } = req.params;

  let recipient = await NotificationRecipient.findOne({
    userId: req.user._id,
    notificationId: id,
  }).populate({
    path: "notificationId",
    populate: { path: "createdBy", select: "fullName username role" },
  });

  if (!recipient && req.user.role === "Admin") {
    const asCreator = await Notification.findById(id).populate(
      "createdBy",
      "fullName username role",
    );
    if (!asCreator) {
      return res.status(404).json({ message: "Notification không tồn tại" });
    }
    return res.json({
      id: asCreator._id,
      recipientId: null,
      title: asCreator.title,
      content: asCreator.content,
      createdAt: asCreator.createdAt,
      createdBy: asCreator.createdBy,
      isRead: false,
      readAt: null,
      roleSnapshot: "Admin",
    });
  }

  if (!recipient || !recipient.notificationId) {
    return res.status(404).json({ message: "Notification không tồn tại" });
  }

  res.json({
    id: recipient.notificationId._id,
    recipientId: recipient._id,
    title: recipient.notificationId.title,
    content: recipient.notificationId.content,
    createdAt: recipient.notificationId.createdAt,
    createdBy: recipient.notificationId.createdBy,
    isRead: recipient.isRead,
    readAt: recipient.readAt,
    roleSnapshot: recipient.roleSnapshot,
  });
});

exports.markNotificationRead = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { isRead = true } = req.body || {};

  const recipient = await NotificationRecipient.findOne({
    userId: req.user._id,
    notificationId: id,
  });
  if (!recipient) {
    return res.status(404).json({ message: "Notification không tồn tại" });
  }

  recipient.isRead = Boolean(isRead);
  recipient.readAt = recipient.isRead ? new Date() : null;
  await recipient.save();

  res.json({
    message: recipient.isRead
      ? "Đã đánh dấu đã đọc"
      : "Đã đánh dấu chưa đọc",
    isRead: recipient.isRead,
    readAt: recipient.readAt,
  });
});
