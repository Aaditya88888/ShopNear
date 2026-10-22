import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes.js";

const app = express();

// Trust reverse proxy for accurate IP rate-limiting
app.set("trust proxy", 1);

// Middlewares
app.use(
  cors({
    origin: ["http://localhost:5173", "https://shop-near.vercel.app"],
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

export default app;
