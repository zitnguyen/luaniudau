const Order = require("../models/Order");
const Course = require("../models/Course");

// Create a new order
exports.createOrder = async (req, res) => {
  try {
    const { items, paymentMethod } = req.body;
    
    if (!items || items.length === 0) {
      return res.status(400).json({ message: "No items in order" });
    }

    let totalAmount = 0;
    const orderItems = [];

    // Verify course prices/availability
    for (const item of items) {
      const course = await Course.findById(item.courseId);
      if (!course) {
        return res.status(404).json({ message: `Course not found: ${item.courseId}` });
      }
      const price = course.salePrice > 0 ? course.salePrice : course.price;
      totalAmount += price;
      orderItems.push({
        courseId: course._id,
        price: price
      });
    }

    const order = new Order({
      userId: req.user?._id || req.body.userId, // For testing, fallback to body.userId
      items: orderItems,
      totalAmount,
      paymentMethod,
      status: "pending" // Default status until payment confirmed
    });

    const savedOrder = await order.save();
    res.status(201).json(savedOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get order by ID
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("userId", "fullName email")
      .populate("items.courseId", "title thumbnail");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get my orders
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user?._id || req.params.userId })
        .populate("items.courseId", "title thumbnail");
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update order status (Admin/System)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status, transactionId } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.status = status || order.status;
    order.transactionId = transactionId || order.transactionId;

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
