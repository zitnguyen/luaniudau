const express = require('express');
const router = express.Router();
const parentController = require('../controllers/parentController');
const { protect, authorize } = require("../middleware/authMiddleware");
const { validateObjectIdParam } = require("../middleware/paramValidationMiddleware");

router.get('/', protect, authorize("Admin"), parentController.getAllParents);
router.get('/:id', protect, authorize("Admin", "Parent"), validateObjectIdParam("id"), parentController.getParentById);
router.post('/', protect, authorize("Admin"), parentController.createParent);
router.put('/:id', protect, authorize("Admin", "Parent"), validateObjectIdParam("id"), parentController.updateParent);
router.delete('/:id', protect, authorize("Admin"), validateObjectIdParam("id"), parentController.deleteParent);
router.get('/:id/students', protect, authorize("Admin", "Parent"), validateObjectIdParam("id"), parentController.getParentStudents);

module.exports = router;
