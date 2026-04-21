const mongoose = require("mongoose");

const notificationRecipientSchema = new mongoose.Schema(
  {
    notificationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Notification",
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    roleSnapshot: {
      type: String,
      enum: ["Admin", "Teacher", "Parent", "Student"],
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    readAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

notificationRecipientSchema.index(
  { notificationId: 1, userId: 1 },
  { unique: true },
);

module.exports = mongoose.model(
  "NotificationRecipient",
  notificationRecipientSchema,
);
