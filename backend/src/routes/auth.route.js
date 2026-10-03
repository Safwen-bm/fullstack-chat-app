import express from "express";
import { checkAuth, login, logout, signup, updateProfile } from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  loginLimiter,
  profileLimiter,
  signupLimiter,
} from "../middleware/rateLimit.middleware.js";

const router = express.Router();

router.post("/signup", signupLimiter, signup);
router.post("/login", loginLimiter, login);
router.post("/logout", logout);

router.put("/update-profile", protectRoute, profileLimiter, updateProfile);

router.get("/check", protectRoute, checkAuth);

export default router;