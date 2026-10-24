import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { ENV } from "../lib/env.js";

export const protectRoute = async (req, res, next) => {
  try {
    // 1. Retrieve token from HttpOnly cookie or Authorization header
    let token = req.cookies?.jwt;
    if (!token && req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: No token provided",
      });
    }

    // 2. Verify token signature & expiration
    const decoded = jwt.verify(token, ENV.JWT_SECRET);
    if (!decoded || !decoded.userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: Invalid token signature",
      });
    }

    // 3. Find user in database (excluding password)
    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: User not found",
      });
    }

    // 4. Attach verified user to request
    req.user = user;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: Session has expired. Please log in again.",
      });
    }
    return res.status(401).json({
      success: false,
      message: "Unauthorized: Invalid session token",
    });
  }
};

// Optional auth: identifies user if logged in, but does not block guests
export const optionalAuth = async (req, res, next) => {
  try {
    let token = req.cookies?.jwt;
    if (!token && req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (token) {
      const decoded = jwt.verify(token, ENV.JWT_SECRET);
      if (decoded && decoded.userId) {
        const user = await User.findById(decoded.userId).select("-password");
        if (user) {
          req.user = user;
        }
      }
    }
  } catch (error) {
    // If token is invalid or expired, proceed silently as guest
  }
  next();
};
