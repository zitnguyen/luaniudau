const express = require("express");
const router = express.Router();
const expenseController = require("../controllers/expenseController");
const { protect, authorize } = require("../middleware/authMiddleware");
const { validateObjectIdParam } = require("../middleware/paramValidationMiddleware");

// CRUD routes
router.get("/", protect, authorize("Admin"), expenseController.getAllExpenses);
router.get("/:id", protect, authorize("Admin"), validateObjectIdParam("id"), expenseController.getExpenseById);
router.post("/", protect, authorize("Admin"), expenseController.createExpense);
router.put("/:id", protect, authorize("Admin"), validateObjectIdParam("id"), expenseController.updateExpense);
router.delete("/:id", protect, authorize("Admin"), validateObjectIdParam("id"), expenseController.deleteExpense);

module.exports = router;
