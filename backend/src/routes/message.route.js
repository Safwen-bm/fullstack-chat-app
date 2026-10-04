import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  messageActionLimiter,
  sendMessageLimiter,
} from "../middleware/rateLimit.middleware.js";
import {
  deleteMessage,
  editMessage,
  getMessages,
  getUsersForSidebar,
  markMessagesAsRead,
  reactToMessage,
  sendMessage,
} from "../controllers/message.controller.js";

const router = express.Router();

router.get("/users", protectRoute, getUsersForSidebar);
router.put("/read/:id", protectRoute, markMessagesAsRead);

router.patch("/item/:messageId", protectRoute, messageActionLimiter, editMessage);
router.delete("/item/:messageId", protectRoute, messageActionLimiter, deleteMessage);
router.put("/item/:messageId/reaction", protectRoute, messageActionLimiter, reactToMessage);

router.get("/:id", protectRoute, getMessages);
router.post("/send/:id", protectRoute, sendMessageLimiter, sendMessage);

export default router;