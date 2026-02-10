const express = require("express");
const router = express.Router();
const studentController = require("../controllers/studentController");
const { protect, authorize } = require("../middleware/authMiddleware");

// Parent Routes
router.get(
  "/my-children",
  protect,
  authorize("Parent"),
  studentController.getMyChildren,
);
// Parent can create student? Maybe, or Admin only. Let's allow Parent for now.
router.post(
  "/my-children",
  protect,
  authorize("Parent"),
  (req, res, next) => {
    req.body.parentId = req.user._id; // Force parentId to be current user
    next();
  },
  studentController.createStudent,
);

// Admin Routes
router.get("/", protect, authorize("Admin"), studentController.getAllStudents);
router.get(
  "/:id",
  protect,
  authorize("Admin", "Parent"),
  studentController.getStudentById,
); // Parents can view their child - need check inside controller or middleware
router.post("/", protect, authorize("Admin"), studentController.createStudent);
router.put(
  "/:id",
  protect,
  authorize("Admin"),
  studentController.updateStudent,
);
router.delete(
  "/:id",
  protect,
  authorize("Admin"),
  studentController.deleteStudent,
);

module.exports = router;
