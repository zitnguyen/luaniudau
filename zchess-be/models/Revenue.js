const mongoose = require("mongoose");
const revenueSchema = new mongoose.Schema({
  revenueId: { type: Number, required: true, unique: true },
  date: { type: Date, default: Date.now },
  source: String,
  amount: { type: Number, required: true },
  description: String,
  relatedPaymentId: { type: mongoose.Schema.Types.ObjectId, ref: "Payment" },
});

const Revenue = mongoose.model("Revenue", revenueSchema);
module.exports = Revenue;
