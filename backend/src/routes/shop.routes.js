import express from "express";
import { protectRoute, optionalAuth } from "../middleware/auth.middleware.js";
import {
  getMyShops,
  createShop,
  updateShop,
  deleteShop,
  seedDemoShops,
  reverseGeocode,
  getNearbyShops,
  getPublicShops,
  getSearchSuggestions,
} from "../controllers/shop.controller.js";

const router = express.Router();

// Public discovery & location routes (with optional auth to exclude user's own shops)
router.get("/public", optionalAuth, getPublicShops);
router.get("/nearby", optionalAuth, getNearbyShops);
router.get("/suggestions", optionalAuth, getSearchSuggestions);
router.get("/reverse-geocode", reverseGeocode);

// Protected shopkeeper management routes
router.get("/my-shops", protectRoute, getMyShops);
router.post("/", protectRoute, createShop);
router.put("/:id", protectRoute, updateShop);
router.post("/seed-demo", protectRoute, seedDemoShops);
router.delete("/:id", protectRoute, deleteShop);

export default router;
