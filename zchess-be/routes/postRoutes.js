const express = require("express");
const router = express.Router();
const postController = require("../controllers/postController");
const { protect, authorize } = require("../middleware/authMiddleware");

// Public Read
router.get("/", postController.getPosts);
router.get("/:id", postController.getPost); // id can be slug

// Protected Write (Admin/Teacher)
router.post("/", protect, authorize("Admin", "Teacher"), postController.createPost);
router.put("/:id", protect, authorize("Admin", "Teacher"), postController.updatePost);
router.delete("/:id", protect, authorize("Admin", "Teacher"), postController.deletePost);

module.exports = router;
