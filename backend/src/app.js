import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { ENV } from "./lib/env.js";
import authRoutes from "./routes/auth.routes.js";
import shopRoutes from "./routes/shop.routes.js";

const app = express();

// Trust reverse proxy for accurate IP rate-limiting behind Render/cloud load balancers
app.set("trust proxy", 1);

// Allowed origins for CORS (supports localhost, production Vercel domain, and Vercel branch previews)
const allowedOrigins = [
  "http://localhost:5173",
  "https://shop-near.vercel.app",
  ENV.CLIENT_URL,
].filter(Boolean);

// Middlewares
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (
        allowedOrigins.includes(origin) ||
        /\.vercel\.app$/.test(origin)
      ) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true, // Allows HttpOnly cookie sharing
  }),
);
app.use(express.json());
app.use(cookieParser());

// Base Health Check Route
app.get("/", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "ShopNear API server is running smoothly",
  });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/shops", shopRoutes);

export default app;
