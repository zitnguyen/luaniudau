const Revenue = require("../models/Revenue");
const asyncHandler = require("../middleware/asyncHandler");

exports.getAllRevenues = asyncHandler(async (req, res) => {
  const revenues = await Revenue.find().populate(
    "relatedPaymentId",
    "amount enrollmentId parentId",
  );
  res.json(revenues);
});

exports.getRevenueById = asyncHandler(async (req, res) => {
  const revenue = await Revenue.findOne({
    revenueId: req.params.id,
  }).populate("relatedPaymentId", "amount enrollmentId parentId");
  if (!revenue)
    return res.status(404).json({ message: "Không tìm thấy doanh thu" });
  res.json(revenue);
});

exports.createRevenue = asyncHandler(async (req, res) => {
  const revenue = new Revenue(req.body);
  await revenue.save();
  res.status(201).json(revenue);
});

exports.updateRevenue = asyncHandler(async (req, res) => {
  const revenue = await Revenue.findOneAndUpdate(
    { revenueId: req.params.id },
    req.body,
    { new: true },
  );
  if (!revenue)
    return res.status(404).json({ message: "Không tìm thấy doanh thu" });
  res.json(revenue);
});

exports.deleteRevenue = asyncHandler(async (req, res) => {
  const revenue = await Revenue.findOneAndDelete({
    revenueId: req.params.id,
  });
  if (!revenue)
    return res.status(404).json({ message: "Không tìm thấy doanh thu" });
  res.json({ message: "Đã xóa doanh thu" });
});
