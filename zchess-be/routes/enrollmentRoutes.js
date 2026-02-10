const express = require("express");
const router = express.Router();
const enrollmentController = require("../controllers/enrollmentController");
const { protect, authorize } = require("../middleware/authMiddleware");

// Admin / Staff Routes
router.post("/", protect, authorize("Admin", "Teacher"), enrollmentController.enrollStudent);
router.post("/withdraw", protect, authorize("Admin", "Teacher"), enrollmentController.withdrawStudent);
router.get("/class/:classId", protect, authorize("Admin", "Teacher"), enrollmentController.getEnrollmentsByClass);

// Student/Parent Routes (View own enrollments)
router.get("/student/:studentId", protect, enrollmentController.getStudentEnrollments); // Add middleware to check parent ownership

module.exports = router;
