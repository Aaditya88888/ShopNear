import express from "express";
import multer from "multer";
import {
  initiateSignup,
  verifySignupOtp,
  resendSignupOtp,
  login,
  logout,
  getMe,
  updateProfile,
  uploadAvatar,
  removeAvatar,
  changePassword,
  deleteAccount,
} from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

// Multer memory storage configuration for avatar upload
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB maximum image size
});

// Public Authentication Endpoints
router.post("/signup/initiate", initiateSignup);
router.post("/signup/verify", verifySignupOtp);
router.post("/signup/resend-otp", resendSignupOtp);
router.post("/login", login);
router.post("/logout", logout);

// Session probe endpoint (returns user: null gracefully if not logged in)
router.get("/me", getMe);

// Authenticated User Profile Endpoints
router.put("/profile", protectRoute, updateProfile);
router.post("/avatar", protectRoute, upload.single("avatar"), uploadAvatar);
router.delete("/avatar", protectRoute, removeAvatar);
router.put("/change-password", protectRoute, changePassword);
router.delete("/account", protectRoute, deleteAccount);

export default router;
