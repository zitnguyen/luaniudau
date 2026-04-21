const Expense = require("../models/Expense");
const asyncHandler = require("../middleware/asyncHandler");

exports.getAllExpenses = asyncHandler(async (req, res) => {
  const expenses = await Expense.find().populate("approvedBy", "fullName email");
  res.json(expenses);
});

exports.getExpenseById = asyncHandler(async (req, res) => {
  const expense = await Expense.findOne({
    expenseId: req.params.id,
  }).populate("approvedBy", "fullName email");
  if (!expense)
    return res.status(404).json({ message: "Không tìm thấy chi phí" });
  res.json(expense);
});

exports.createExpense = asyncHandler(async (req, res) => {
  const expense = new Expense(req.body);
  await expense.save();
  res.status(201).json(expense);
});

exports.updateExpense = asyncHandler(async (req, res) => {
  const expense = await Expense.findOneAndUpdate(
    { expenseId: req.params.id },
    req.body,
    { new: true },
  );
  if (!expense)
    return res.status(404).json({ message: "Không tìm thấy chi phí" });
  res.json(expense);
});

exports.deleteExpense = asyncHandler(async (req, res) => {
  const expense = await Expense.findOneAndDelete({
    expenseId: req.params.id,
  });
  if (!expense)
    return res.status(404).json({ message: "Không tìm thấy chi phí" });
  res.json({ message: "Đã xóa chi phí" });
});
