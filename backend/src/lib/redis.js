import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";
import { ENV } from "./env.js";

// 1. Initialize Upstash Redis Client
export const redis = new Redis({
  url: ENV.UPSTASH_REDIS_REST_URL,
  token: ENV.UPSTASH_REDIS_REST_TOKEN,
});

// 2. Email-based Rate Limiter: Max 5 OTP requests per email in a rolling 60-second window (Mandatory)
export const otpEmailRateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "60 s"),
  analytics: true,
  prefix: "ratelimit:otp:email",
});

// 3. IP-based Rate Limiter: Max 10 OTP requests per IP in a rolling 60-second window
export const otpIpRateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "60 s"),
  analytics: true,
  prefix: "ratelimit:otp:ip",
});

// 4. Redis Key Namespaces & TTL Constants
export const REDIS_KEYS = {
  OTP_PREFIX: "otp:",
  TEMP_SIGNUP_PREFIX: "temp_signup:",
  ATTEMPTS_PREFIX: "attempts:otp:",
  OTP_TTL_SECONDS: 300, // 5 minutes
  MAX_VERIFY_ATTEMPTS: 5,
};
