const express = require("express");
const router = express.Router();
const courseController = require("../controllers/courseController");
const { protect, authorize } = require("../middleware/authMiddleware");

// Public
router.get("/", courseController.getAllCourses);
router.get("/:slug", courseController.getCourseBySlug);

// Protected (Admin/Teacher)
router.post("/", protect, authorize("Admin", "Teacher"), courseController.createCourse);
router.put("/:id", protect, authorize("Admin", "Teacher"), courseController.updateCourse);
router.delete("/:id", protect, authorize("Admin", "Teacher"), courseController.deleteCourse);

// User (Protected)
router.get("/user/my-courses", protect, courseController.getMyCourses);

module.exports = router;
