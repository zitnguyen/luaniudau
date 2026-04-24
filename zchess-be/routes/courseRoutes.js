const express = require("express");
const router = express.Router();
const courseController = require("../controllers/courseController");
const { protect, authorize, optionalProtect } = require("../middleware/authMiddleware");

// Public
router.get("/", courseController.getAllCourses);
router.get("/user/my-courses", protect, courseController.getMyCourses);
router.get(
  "/parent/my-courses",
  protect,
  authorize("Parent"),
  courseController.getParentChildrenCourses,
);
router.get(
  "/id/:id",
  protect,
  authorize("Admin", "Teacher"),
  courseController.getCourseById,
);
router.get(
  "/id/:id/access",
  protect,
  authorize("Admin"),
  courseController.getCourseAccess,
);
router.get(
  "/:id/access",
  protect,
  authorize("Admin"),
  courseController.getCourseAccess,
);
router.put(
  "/id/:id/access",
  protect,
  authorize("Admin"),
  courseController.setCourseAccess,
);
router.put(
  "/:id/access",
  protect,
  authorize("Admin"),
  courseController.setCourseAccess,
);
router.get("/:slug", optionalProtect, courseController.getCourseBySlug);

// Protected (Admin/Teacher)
router.post("/", protect, authorize("Admin", "Teacher"), courseController.createCourse);
router.put("/:id", protect, authorize("Admin", "Teacher"), courseController.updateCourse);
router.delete("/:id", protect, authorize("Admin", "Teacher"), courseController.deleteCourse);

module.exports = router;
