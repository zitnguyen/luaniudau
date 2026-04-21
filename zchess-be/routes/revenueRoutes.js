const express = require("express");
const router = express.Router();
const revenueController = require("../controllers/revenueController");
const { protect, authorize } = require("../middleware/authMiddleware");
const { validateObjectIdParam } = require("../middleware/paramValidationMiddleware");

// CRUD routes
router.get("/", protect, authorize("Admin"), revenueController.getAllRevenues);
router.get("/:id", protect, authorize("Admin"), validateObjectIdParam("id"), revenueController.getRevenueById);
router.post("/", protect, authorize("Admin"), revenueController.createRevenue);
router.put("/:id", protect, authorize("Admin"), validateObjectIdParam("id"), revenueController.updateRevenue);
router.delete("/:id", protect, authorize("Admin"), validateObjectIdParam("id"), revenueController.deleteRevenue);

module.exports = router;
