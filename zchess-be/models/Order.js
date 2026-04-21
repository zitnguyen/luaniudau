const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  items: [{
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    price: { type: Number, required: true }
  }],
  totalAmount: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ["pending", "completed", "cancelled", "refunded"],
    default: "pending" 
  },
  paymentMethod: { 
    type: String, 
    enum: ["bank_transfer", "momo", "cash", "other"],
    default: "bank_transfer"
  },
  transactionId: { type: String },
  paidAt: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now }
});

const Order = mongoose.model("Order", orderSchema);
module.exports = Order;
