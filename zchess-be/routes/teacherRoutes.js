const express = require("express");
const { protect, authorize } = require("../middleware/authMiddleware");
const teacherController = require("../controllers/teacherController");
const payrollController = require("../controllers/payrollController");

const router = express.Router();

router.use(protect);
router.use(authorize("Teacher", "Admin"));

router.get("/dashboard", teacherController.getTeacherDashboard);
router.get("/classes", teacherController.getTeacherClasses);
router.get("/students", teacherController.getTeacherStudents);
router.get("/attendance", teacherController.getTeacherAttendance);
router.get("/finance", teacherController.getTeacherFinance);
router.post("/assessments", teacherController.createTeacherAssessment);
router.put("/assessments/:id", teacherController.updateTeacherAssessment);
router.post(
  "/sessions",
  authorize("Teacher"),
  payrollController.createTeacherSession,
);
router.get(
  "/sessions",
  authorize("Teacher"),
  payrollController.getTeacherSessions,
);

module.exports = router;
