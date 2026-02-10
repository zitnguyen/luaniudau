const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");

router.post("/", orderController.createOrder);
router.get("/myorders/:userId", orderController.getMyOrders); // Temporary, should use auth middleware
router.get("/:id", orderController.getOrderById);
router.put("/:id/pay", orderController.updateOrderStatus);

module.exports = router;
