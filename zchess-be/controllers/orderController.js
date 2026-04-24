const Order = require("../models/Order");
const Course = require("../models/Course");
const CourseAccess = require("../models/CourseAccess");
const Notification = require("../models/Notification");
const NotificationRecipient = require("../models/NotificationRecipient");
const User = require("../models/User");
const asyncHandler = require("../middleware/asyncHandler");
const { emitNotificationToUsers } = require("../realtime/socketHub");

function assertOrderAccess(order, user) {
  if (!user) return false;
  if (user.role === "Admin") return true;
  return String(order.userId) === String(user._id);
}

exports.createOrder = asyncHandler(async (req, res) => {
  const { items, paymentMethod } = req.body;
  const userId = req.user?._id || req.body.userId;

  if (!items || items.length === 0) {
    return res.status(400).json({ message: "No items in order" });
  }

  let totalAmount = 0;
  const orderItems = [];
  const courseTitles = [];

  for (const item of items) {
    const existingPendingOrder = await Order.findOne({
      userId,
      status: "pending",
      "items.courseId": item.courseId,
    });
    if (existingPendingOrder) {
      return res.status(200).json(existingPendingOrder);
    }

    const course = await Course.findById(item.courseId);
    if (!course) {
      return res
        .status(404)
        .json({ message: `Course not found: ${item.courseId}` });
    }
    const price = course.salePrice > 0 ? course.salePrice : course.price;
    totalAmount += price;
    courseTitles.push(course.title || "Khóa học");
    orderItems.push({
      courseId: course._id,
      price: price,
    });
  }

  const order = new Order({
    userId,
    items: orderItems,
    totalAmount,
    paymentMethod,
    status: "pending",
  });

  const savedOrder = await order.save();

  // Notify all admins when a new pending order is created.
  try {
    const adminUsers = await User.find({ role: "Admin" }).select("_id role");
    if (adminUsers.length > 0) {
      const buyerName = req.user?.fullName || req.user?.username || "Người dùng";
      const shortOrderId = String(savedOrder._id).slice(-6).toUpperCase();
      const notification = await Notification.create({
        title: "Đơn hàng khóa học mới chờ duyệt",
        content: `${buyerName} vừa tạo đơn ORD-${shortOrderId} (${courseTitles.join(", ")}). Vui lòng vào Tài chính để duyệt.`,
        createdBy: userId,
      });
      await NotificationRecipient.insertMany(
        adminUsers.map((admin) => ({
          notificationId: notification._id,
          userId: admin._id,
          roleSnapshot: admin.role,
          isRead: false,
          readAt: null,
        })),
        { ordered: false },
      );
      emitNotificationToUsers(
        adminUsers.map((admin) => admin._id),
        { type: "ORDER_PENDING_CREATED", notificationId: notification._id },
      );
    }
  } catch (notifyError) {
    // Do not block order creation if notification dispatch fails.
    console.error("Failed to notify admins for pending order:", notifyError);
  }

  res.status(201).json(savedOrder);
});

exports.getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate("userId", "fullName email")
    .populate("items.courseId", "title thumbnail");

  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }

  if (!assertOrderAccess(order, req.user)) {
    return res.status(403).json({ message: "Forbidden" });
  }

  res.json(order);
});

exports.getMyOrdersForAuthUser = asyncHandler(async (req, res) => {
  const orders = await Order.find({ userId: req.user._id }).populate(
    "items.courseId",
    "title thumbnail",
  );
  res.json(orders);
});

exports.getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({
    userId: req.params.userId,
  }).populate("items.courseId", "title thumbnail");
  res.json(orders);
});

exports.listAllOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find()
    .sort({ createdAt: -1 })
    .populate("userId", "fullName email")
    .populate("items.courseId", "title thumbnail");
  res.json(orders);
});

exports.updateOrderStatus = asyncHandler(async (req, res) => {
  const { status, transactionId } = req.body;
  const order = await Order.findById(req.params.id);

  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }

  if (!assertOrderAccess(order, req.user)) {
    return res.status(403).json({ message: "Forbidden" });
  }

  const isAdmin = String(req.user?.role || "").toLowerCase() === "admin";
  if (status !== undefined && !isAdmin) {
    return res
      .status(403)
      .json({ message: "Chỉ Admin mới có quyền duyệt trạng thái đơn hàng." });
  }

  const previousStatus = order.status;
  order.status = status || order.status;
  order.transactionId = transactionId || order.transactionId;
  if (status === "completed") {
    order.paidAt = new Date();
  } else if (status && status !== "completed") {
    order.paidAt = null;
  }

  const updatedOrder = await order.save();

  if (updatedOrder.status === "completed") {
    const accessRows = (updatedOrder.items || [])
      .filter((item) => item?.courseId)
      .map((item) => ({
        courseId: item.courseId,
        userId: updatedOrder.userId,
        grantedBy: req.user?._id,
      }));
    if (accessRows.length > 0) {
      await CourseAccess.bulkWrite(
        accessRows.map((row) => ({
          updateOne: {
            filter: { courseId: row.courseId, userId: row.userId },
            update: { $setOnInsert: row },
            upsert: true,
          },
        })),
      );
    }

    // Notify buyer (parent) when admin approves the order.
    if (isAdmin && previousStatus !== "completed") {
      try {
        const buyer = await User.findById(updatedOrder.userId).select(
          "_id role fullName username",
        );
        if (buyer && String(buyer.role || "").toLowerCase() === "parent") {
          const courseIds = (updatedOrder.items || [])
            .map((item) => item?.courseId)
            .filter(Boolean);
          const courses = await Course.find({ _id: { $in: courseIds } }).select("title");
          const courseTitleMap = new Map(
            courses.map((course) => [String(course._id), course.title || "Khóa học"]),
          );
          const courseTitles = courseIds
            .map((id) => courseTitleMap.get(String(id)))
            .filter(Boolean);
          const shortOrderId = String(updatedOrder._id).slice(-6).toUpperCase();

          const notification = await Notification.create({
            title: "Đơn hàng khóa học đã được duyệt",
            content: `Đơn ORD-${shortOrderId} của bạn đã được Admin duyệt. Bạn có thể vào học ngay${courseTitles.length ? `: ${courseTitles.join(", ")}` : ""}.`,
            createdBy: req.user._id,
          });

          await NotificationRecipient.create({
            notificationId: notification._id,
            userId: buyer._id,
            roleSnapshot: "Parent",
            isRead: false,
            readAt: null,
          });
          emitNotificationToUsers([buyer._id], {
            type: "ORDER_APPROVED",
            notificationId: notification._id,
          });
        }
      } catch (notifyError) {
        console.error("Failed to notify parent on order approval:", notifyError);
      }
    }
  }
  res.json(updatedOrder);
});
