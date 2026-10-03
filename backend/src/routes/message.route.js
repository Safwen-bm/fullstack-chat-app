import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { sendMessageLimiter } from "../middleware/rateLimit.middleware.js";
import {
  getMessages,
  getUsersForSidebar,
  markMessagesAsRead,
  sendMessage,
} from "../controllers/message.controller.js";

const router = express.Router();

router.get("/users", protectRoute, getUsersForSidebar);
router.put("/read/:id", protectRoute, markMessagesAsRead);
router.get("/:id", protectRoute, getMessages);
router.post("/send/:id", protectRoute, sendMessageLimiter, sendMessage);

export default router;