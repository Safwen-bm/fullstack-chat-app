import express from "express";
import {
  changePassword,
  checkAuth,
  deleteAccount,
  login,
  logout,
  signup,
  updateProfile,
} from "../controllers/auth.controller.js";
import { optionalAuth, protectRoute } from "../middleware/auth.middleware.js";
import {
  loginLimiter,
  passwordLimiter,
  profileLimiter,
  signupLimiter,
} from "../middleware/rateLimit.middleware.js";

const router = express.Router();

router.post("/signup", signupLimiter, signup);
router.post("/login", loginLimiter, login);
router.post("/logout", logout);

router.put("/update-profile", protectRoute, profileLimiter, updateProfile);
router.put("/change-password", protectRoute, passwordLimiter, changePassword);
router.delete("/account", protectRoute, passwordLimiter, deleteAccount);

router.get("/check", optionalAuth, checkAuth);

export default router;