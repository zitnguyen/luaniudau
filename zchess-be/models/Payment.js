const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  paymentId: { type: Number, required: true, unique: true },
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order" }, // Optional, can be null for manual payments
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  amount: { type: Number, required: true },
  method: { 
    type: String, 
    enum: ["bank_transfer", "momo", "cash", "credit_card"],
    required: true 
  },
  status: { 
    type: String, 
    enum: ["pending", "completed", "failed", "refunded"],
    default: "pending"
  },
  transactionDate: { type: Date, default: Date.now },
  transactionId: { type: String }, // External transaction ID (e.g., from MoMo)
  notes: { type: String }
});

const Payment = mongoose.model("Payment", paymentSchema);
module.exports = Payment;
