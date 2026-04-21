const Order = require("../models/Order");
const Course = require("../models/Course");
const CourseAccess = require("../models/CourseAccess");
const asyncHandler = require("../middleware/asyncHandler");

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
  }
  res.json(updatedOrder);
});
