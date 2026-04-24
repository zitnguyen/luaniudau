const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chatController");
const { protect } = require("../middleware/authMiddleware");

router.get("/contacts", protect, chatController.getContacts);
router.get("/unread-summary", protect, chatController.getUnreadSummary);
router.get("/messages/:userId", protect, chatController.getConversation);
router.post("/messages", protect, chatController.sendMessage);

module.exports = router;
