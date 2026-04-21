const Order = require("../models/Order");
const Course = require("../models/Course");
const asyncHandler = require("../middleware/asyncHandler");

function assertOrderAccess(order, user) {
  if (!user) return false;
  if (user.role === "Admin") return true;
  return String(order.userId) === String(user._id);
}

exports.createOrder = asyncHandler(async (req, res) => {
  const { items, paymentMethod } = req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({ message: "No items in order" });
  }

  let totalAmount = 0;
  const orderItems = [];

  for (const item of items) {
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
    userId: req.user?._id || req.body.userId,
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

  order.status = status || order.status;
  order.transactionId = transactionId || order.transactionId;

  const updatedOrder = await order.save();
  res.json(updatedOrder);
});
