const express = require("express");
const { protect, authorize } = require("../middleware/authMiddleware");
const payrollController = require("../controllers/payrollController");

const router = express.Router();

router.use(protect);
router.use(authorize("Admin"));

router.get("/payroll/summary", payrollController.getPayrollSummary);
router.get("/payroll/payslip", payrollController.exportPayslip);
router.get("/payroll/:teacherId", payrollController.getAdminPayrollByTeacher);
router.get("/payroll", payrollController.getAdminPayroll);
router.post("/payroll/session", payrollController.createAdminSession);
router.patch("/payroll/session/:id/salary", payrollController.updateSessionSalary);
router.delete("/payroll/session/:id/salary", payrollController.resetSessionSalary);
router.delete("/payroll/session/:id", payrollController.deleteSession);

module.exports = router;
