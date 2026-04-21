const express = require("express");
const router = express.Router();
const testimonialController = require("../controllers/testimonialController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.get("/public", testimonialController.getPublicTestimonials);

router.get("/", protect, authorize("Admin"), testimonialController.getTestimonials);
router.get("/:id", protect, authorize("Admin"), testimonialController.getTestimonialById);
router.post("/", protect, authorize("Admin"), testimonialController.createTestimonial);
router.put("/:id", protect, authorize("Admin"), testimonialController.updateTestimonial);
router.delete("/:id", protect, authorize("Admin"), testimonialController.deleteTestimonial);

module.exports = router;
