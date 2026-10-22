import express from "express";
import {
  initiateSignup,
  verifySignupOtp,
  resendSignupOtp,
  login,
  logout,
  getMe,
} from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

// Public Authentication Endpoints
router.post("/signup/initiate", initiateSignup);
router.post("/signup/verify", verifySignupOtp);
router.post("/signup/resend-otp", resendSignupOtp);
router.post("/login", login);
router.post("/logout", logout);

// Session probe endpoint (returns user: null gracefully if not logged in)
router.get("/me", getMe);

export default router;
