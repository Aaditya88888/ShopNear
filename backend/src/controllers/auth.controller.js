import crypto from "crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import {
  redis,
  otpEmailRateLimiter,
  otpIpRateLimiter,
  REDIS_KEYS,
} from "../lib/redis.js";
import { sendOtpEmail, sendWelcomeEmail, sendLoginAlertEmail } from "../lib/mail.js";
import { ENV } from "../lib/env.js";

// Helper to set standard HttpOnly JWT Cookie
const setAuthCookie = (res, token) => {
  res.cookie("jwt", token, {
    httpOnly: true, // Immune to JavaScript XSS access
    secure: ENV.NODE_ENV === "production",
    sameSite: ENV.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
    path: "/",
  });
};

// ==========================================
// 1. INITIATE SIGNUP (Generates & Emails OTP)
// ==========================================
export const initiateSignup = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate inputs
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long",
      });
    }

    // Check if user already exists in MongoDB
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser && existingUser.isVerified) {
      return res.status(409).json({
        success: false,
        message: "An account with this email address already exists. Please log in.",
      });
    }

    // Rate Limiting: Max 5 OTP requests per email in 60s
    const emailLimitResult = await otpEmailRateLimiter.limit(normalizedEmail);
    if (!emailLimitResult.success) {
      const retryAfterSec = Math.max(
        1,
        Math.ceil((emailLimitResult.reset - Date.now()) / 1000),
      );
      res.setHeader("Retry-After", retryAfterSec);
      return res.status(429).json({
        success: false,
        message: `Too many OTP requests. Please wait ${retryAfterSec} seconds before requesting another code.`,
        retryAfter: retryAfterSec,
      });
    }

    // IP-based Rate Limiting (prevents multi-email bot spam)
    const clientIp =
      req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
      req.socket?.remoteAddress ||
      "127.0.0.1";
    const ipLimitResult = await otpIpRateLimiter.limit(clientIp);
    if (!ipLimitResult.success) {
      return res.status(429).json({
        success: false,
        message: "Too many requests from this network. Please try again in a few moments.",
      });
    }

    // Generate cryptographically secure 6-digit OTP
    const otp = crypto.randomInt(100000, 1000000).toString();

    // Hash password with bcrypt (salt rounds: 10)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Store in Upstash Redis with 5-minute TTL (300 seconds)
    const otpKey = `${REDIS_KEYS.OTP_PREFIX}${normalizedEmail}`;
    const tempSignupKey = `${REDIS_KEYS.TEMP_SIGNUP_PREFIX}${normalizedEmail}`;
    const attemptsKey = `${REDIS_KEYS.ATTEMPTS_PREFIX}${normalizedEmail}`;

    await Promise.all([
      redis.set(otpKey, otp, { ex: REDIS_KEYS.OTP_TTL_SECONDS }),
      redis.set(
        tempSignupKey,
        JSON.stringify({ email: normalizedEmail, hashedPassword }),
        { ex: REDIS_KEYS.OTP_TTL_SECONDS },
      ),
      redis.set(attemptsKey, 0, { ex: REDIS_KEYS.OTP_TTL_SECONDS }),
    ]);

    // Send OTP email via SMTP
    try {
      await sendOtpEmail(normalizedEmail, otp);
    } catch (mailError) {
      console.error("Failed to send OTP email:", mailError);
      // Clean up Redis keys if email delivery failed
      await redis.del(otpKey, tempSignupKey, attemptsKey);
      return res.status(500).json({
        success: false,
        message: "Failed to deliver verification email. Please check your email and try again.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Verification code sent to your email address",
      email: normalizedEmail,
      expiresInSeconds: REDIS_KEYS.OTP_TTL_SECONDS,
    });
  } catch (error) {
    console.error("Error in initiateSignup:", error);
    return res.status(500).json({
      success: false,
      message: "An unexpected error occurred during signup",
    });
  }
};

// ==========================================
// 2. VERIFY SIGNUP OTP & CREATE ACCOUNT
// ==========================================
export const verifySignupOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and verification code are required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const otpTrimmed = otp.trim();

    const otpKey = `${REDIS_KEYS.OTP_PREFIX}${normalizedEmail}`;
    const tempSignupKey = `${REDIS_KEYS.TEMP_SIGNUP_PREFIX}${normalizedEmail}`;
    const attemptsKey = `${REDIS_KEYS.ATTEMPTS_PREFIX}${normalizedEmail}`;

    // Check verification attempt count (brute-force protection: max 5 tries)
    const currentAttempts = await redis.get(attemptsKey);
    const attemptsCount = currentAttempts ? parseInt(currentAttempts, 10) : 0;

    if (attemptsCount >= REDIS_KEYS.MAX_VERIFY_ATTEMPTS) {
      // Invalidate OTP on repeated failures
      await redis.del(otpKey, tempSignupKey, attemptsKey);
      return res.status(429).json({
        success: false,
        message:
          "Too many failed verification attempts. For your security, this code has been cancelled. Please request a new code.",
      });
    }

    // Retrieve stored OTP from Upstash Redis
    const storedOtp = await redis.get(otpKey);
    if (!storedOtp) {
      return res.status(400).json({
        success: false,
        message: "The verification code has expired or is invalid. Please request a new code.",
      });
    }

    // Compare submitted OTP
    if (storedOtp.toString() !== otpTrimmed) {
      // Increment attempt counter in Redis
      await redis.incr(attemptsKey);
      const remainingAttempts = REDIS_KEYS.MAX_VERIFY_ATTEMPTS - (attemptsCount + 1);
      return res.status(400).json({
        success: false,
        message: `Invalid verification code. ${remainingAttempts > 0 ? remainingAttempts + " attempt(s) remaining." : ""}`,
      });
    }

    // Retrieve pre-hashed password and temp signup data
    const tempSignupData = await redis.get(tempSignupKey);
    if (!tempSignupData) {
      return res.status(400).json({
        success: false,
        message: "Signup session has expired. Please sign up again.",
      });
    }

    const { hashedPassword } =
      typeof tempSignupData === "string"
        ? JSON.parse(tempSignupData)
        : tempSignupData;

    // Atomically delete Redis keys to prevent duplicate use
    await redis.del(otpKey, tempSignupKey, attemptsKey);

    // Concurrency protection: Check if account was created in a parallel thread
    let user = await User.findOne({ email: normalizedEmail });
    if (user && user.isVerified) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists. Please log in.",
      });
    }

    // Create or update verified user in MongoDB
    if (user && !user.isVerified) {
      user.password = hashedPassword;
      user.isVerified = true;
      user.lastLogin = new Date();
      await user.save();
    } else {
      user = await User.create({
        email: normalizedEmail,
        password: hashedPassword,
        isVerified: true,
        lastLogin: new Date(),
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      ENV.JWT_SECRET,
      { expiresIn: "7d" },
    );

    // Set secure HttpOnly cookie
    setAuthCookie(res, token);

    // Send Welcome Email asynchronously
    sendWelcomeEmail(user.email).catch((err) =>
      console.error("Failed to send welcome email:", err.message),
    );

    return res.status(201).json({
      success: true,
      message: "Account verified and created successfully!",
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    console.error("Error in verifySignupOtp:", error);
    return res.status(500).json({
      success: false,
      message: "An unexpected error occurred while verifying OTP",
    });
  }
};

// ==========================================
// 3. RESEND SIGNUP OTP
// ==========================================
export const resendSignupOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required to resend verification code",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const tempSignupKey = `${REDIS_KEYS.TEMP_SIGNUP_PREFIX}${normalizedEmail}`;

    // Verify that a pending signup session exists
    const tempSignupData = await redis.get(tempSignupKey);
    if (!tempSignupData) {
      return res.status(400).json({
        success: false,
        message: "Signup session has expired. Please enter your email and password again.",
      });
    }

    // Rate Limiting: Max 5 OTP requests per email in 60s
    const emailLimitResult = await otpEmailRateLimiter.limit(normalizedEmail);
    if (!emailLimitResult.success) {
      const retryAfterSec = Math.max(
        1,
        Math.ceil((emailLimitResult.reset - Date.now()) / 1000),
      );
      res.setHeader("Retry-After", retryAfterSec);
      return res.status(429).json({
        success: false,
        message: `Too many OTP requests. Please wait ${retryAfterSec} seconds before requesting a new code.`,
        retryAfter: retryAfterSec,
      });
    }

    // Generate new secure 6-digit OTP
    const newOtp = crypto.randomInt(100000, 1000000).toString();
    const otpKey = `${REDIS_KEYS.OTP_PREFIX}${normalizedEmail}`;
    const attemptsKey = `${REDIS_KEYS.ATTEMPTS_PREFIX}${normalizedEmail}`;

    // Overwrite old OTP and refresh TTL to 300s
    await Promise.all([
      redis.set(otpKey, newOtp, { ex: REDIS_KEYS.OTP_TTL_SECONDS }),
      redis.set(tempSignupKey, tempSignupData, { ex: REDIS_KEYS.OTP_TTL_SECONDS }),
      redis.set(attemptsKey, 0, { ex: REDIS_KEYS.OTP_TTL_SECONDS }),
    ]);

    // Send fresh email
    await sendOtpEmail(normalizedEmail, newOtp);

    return res.status(200).json({
      success: true,
      message: "A new verification code has been sent to your email",
      expiresInSeconds: REDIS_KEYS.OTP_TTL_SECONDS,
    });
  } catch (error) {
    console.error("Error in resendSignupOtp:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to resend verification code",
    });
  }
};

// ==========================================
// 4. LOGIN (No OTP required for ordinary login)
// ==========================================
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Find user in MongoDB (explicitly including password)
    const user = await User.findOne({ email: normalizedEmail }).select("+password");

    // Dummy compare to mitigate timing attacks if user is not found
    if (!user) {
      await bcrypt.compare(
        password,
        "$2a$10$abcdefghijklmnopqrstuvwxyz1234567890abcdefghijklmnopqr",
      );
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Verify password against stored hash
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Ensure account email was verified during signup
    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        message: "Please complete email verification before signing in.",
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      ENV.JWT_SECRET,
      { expiresIn: "7d" },
    );

    // Set HttpOnly cookie
    setAuthCookie(res, token);

    // Update last login timestamp
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    // Send login alert email asynchronously
    sendLoginAlertEmail(user.email).catch((err) =>
      console.error("Failed to send login alert:", err.message),
    );

    return res.status(200).json({
      success: true,
      message: "Logged in successfully",
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    console.error("Error in login:", error);
    return res.status(500).json({
      success: false,
      message: "An unexpected error occurred during login",
    });
  }
};

// ==========================================
// 5. LOGOUT
// ==========================================
export const logout = (req, res) => {
  res.clearCookie("jwt", {
    httpOnly: true,
    secure: ENV.NODE_ENV === "production",
    sameSite: ENV.NODE_ENV === "production" ? "none" : "lax",
    path: "/",
  });

  return res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
};

// ==========================================
// 6. GET CURRENT AUTHENTICATED USER (Me / Session Probe)
// ==========================================
export const getMe = async (req, res) => {
  try {
    let token = req.cookies?.jwt;
    if (!token && req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }

    // If no token exists, return 200 with user: null (prevents noisy red 401s in browser console)
    if (!token) {
      return res.status(200).json({
        success: true,
        isAuthenticated: false,
        user: null,
      });
    }

    try {
      const decoded = jwt.verify(token, ENV.JWT_SECRET);
      if (!decoded?.userId) {
        return res.status(200).json({
          success: true,
          isAuthenticated: false,
          user: null,
        });
      }

      const user = await User.findById(decoded.userId).select("-password");
      if (!user) {
        return res.status(200).json({
          success: true,
          isAuthenticated: false,
          user: null,
        });
      }

      return res.status(200).json({
        success: true,
        isAuthenticated: true,
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
          isVerified: user.isVerified,
          createdAt: user.createdAt,
        },
      });
    } catch (tokenErr) {
      // Clear invalid or expired cookie and respond with user: null
      res.clearCookie("jwt", {
        httpOnly: true,
        secure: ENV.NODE_ENV === "production",
        sameSite: ENV.NODE_ENV === "production" ? "none" : "lax",
        path: "/",
      });
      return res.status(200).json({
        success: true,
        isAuthenticated: false,
        user: null,
      });
    }
  } catch (error) {
    console.error("Error in getMe:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error checking session",
    });
  }
};
