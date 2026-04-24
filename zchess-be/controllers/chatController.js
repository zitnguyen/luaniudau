const mongoose = require("mongoose");
const asyncHandler = require("../middleware/asyncHandler");
const User = require("../models/User");
const Message = require("../models/Message");

const isAdminRole = (role) => String(role || "").toLowerCase() === "admin";

const canChat = ({ senderRole, recipientRole }) => {
  if (isAdminRole(senderRole)) return true;
  return isAdminRole(recipientRole);
};

exports.getContacts = asyncHandler(async (req, res) => {
  const me = req.user;
  const filter = isAdminRole(me.role)
    ? { _id: { $ne: me._id }, role: { $ne: "Admin" } }
    : { role: "Admin" };

  const contacts = await User.aggregate([
    { $match: filter },
    {
      $lookup: {
        from: "messages",
        let: { contactId: "$_id", meId: me._id },
        pipeline: [
          {
            $match: {
              $expr: {
                $or: [
                  {
                    $and: [
                      { $eq: ["$senderId", "$$meId"] },
                      { $eq: ["$recipientId", "$$contactId"] },
                    ],
                  },
                  {
                    $and: [
                      { $eq: ["$senderId", "$$contactId"] },
                      { $eq: ["$recipientId", "$$meId"] },
                    ],
                  },
                ],
              },
            },
          },
          { $sort: { createdAt: -1 } },
          { $limit: 1 },
          { $project: { _id: 0, createdAt: 1 } },
        ],
        as: "lastMessage",
      },
    },
    {
      $addFields: {
        lastMessageAt: { $ifNull: [{ $arrayElemAt: ["$lastMessage.createdAt", 0] }, null] },
      },
    },
    {
      $project: {
        _id: 1,
        username: 1,
        fullName: 1,
        role: 1,
        avatarUrl: 1,
        isOnline: 1,
        lastSeenAt: 1,
        lastMessageAt: 1,
      },
    },
    { $sort: { lastMessageAt: -1, fullName: 1, username: 1 } },
  ]);

  res.json(contacts);
});

exports.getConversation = asyncHandler(async (req, res) => {
  const me = req.user;
  const { userId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ message: "Invalid user id" });
  }

  const other = await User.findById(userId).select("_id role fullName username");
  if (!other) return res.status(404).json({ message: "User not found" });

  if (!canChat({ senderRole: me.role, recipientRole: other.role })) {
    return res.status(403).json({ message: "Không có quyền nhắn tin với tài khoản này" });
  }

  const messages = await Message.find({
    $or: [
      { senderId: me._id, recipientId: other._id },
      { senderId: other._id, recipientId: me._id },
    ],
  })
    .sort({ createdAt: 1 })
    .limit(500)
    .lean();

  await Message.updateMany(
    { senderId: other._id, recipientId: me._id, readAt: null },
    { $set: { readAt: new Date() } },
  );

  res.json(messages);
});

exports.sendMessage = asyncHandler(async (req, res) => {
  const me = req.user;
  const { recipientId, content, imageUrl } = req.body || {};

  if (!recipientId || !mongoose.Types.ObjectId.isValid(recipientId)) {
    return res.status(400).json({ message: "recipientId không hợp lệ" });
  }
  const normalizedContent = String(content || "").trim();
  const normalizedImageUrl = String(imageUrl || "").trim();
  if (!normalizedContent && !normalizedImageUrl) {
    return res.status(400).json({ message: "Tin nhắn phải có nội dung hoặc ảnh" });
  }

  const recipient = await User.findById(recipientId).select("_id role");
  if (!recipient) return res.status(404).json({ message: "User nhận không tồn tại" });
  if (String(recipient._id) === String(me._id)) {
    return res.status(400).json({ message: "Không thể tự nhắn cho chính mình" });
  }
  if (!canChat({ senderRole: me.role, recipientRole: recipient.role })) {
    return res.status(403).json({ message: "Bạn không có quyền nhắn tin cho tài khoản này" });
  }

  const created = await Message.create({
    senderId: me._id,
    recipientId: recipient._id,
    content: normalizedContent,
    imageUrl: normalizedImageUrl,
  });

  const message = await Message.findById(created._id).lean();
  res.status(201).json(message);
});

exports.getUnreadSummary = asyncHandler(async (req, res) => {
  const me = req.user;
  const unread = await Message.aggregate([
    { $match: { recipientId: me._id, readAt: null } },
    { $group: { _id: "$senderId", count: { $sum: 1 } } },
  ]);

  const bySender = unread.reduce((acc, item) => {
    acc[String(item._id)] = Number(item.count || 0);
    return acc;
  }, {});
  const totalUnread = unread.reduce((sum, item) => sum + Number(item.count || 0), 0);

  res.json({ totalUnread, bySender });
});
