import mongoose from "mongoose";
import { Shop } from "../models/shop.model.js";
import { User } from "../models/user.model.js";
import { deleteCloudinaryImage, extractPublicIdFromUrl, uploadShopImage } from "../lib/cloudinary.js";
import { ENV } from "../lib/env.js";

// Helper: parse and validate GeoJSON [longitude, latitude] coordinates
const parseCoordinates = (coords) => {
  if (!coords) return undefined;
  if (Array.isArray(coords) && coords.length === 2) {
    const lng = parseFloat(coords[0]);
    const lat = parseFloat(coords[1]);
    if (!isNaN(lng) && !isNaN(lat) && lng >= -180 && lng <= 180 && lat >= -90 && lat <= 90) {
      return [lng, lat];
    }
  } else if (typeof coords === "object" && coords.lat !== undefined && coords.lng !== undefined) {
    const lat = parseFloat(coords.lat);
    const lng = parseFloat(coords.lng);
    if (!isNaN(lng) && !isNaN(lat) && lng >= -180 && lng <= 180 && lat >= -90 && lat <= 90) {
      return [lng, lat];
    }
  }
  return undefined;
};

// Separated Application Categories
export const APP_CATEGORIES = [
  "Stationery",
  "Photocopy & Xerox",
  "Sweets & Mithai",
  "Bakery & Cakes",
  "Fruits",
  "Vegetables",
  "Grocery & Kirana",
  "Clothing & Apparel",
  "Tailor & Boutique",
  "Mobile & Phone Repair",
  "Pharmacy & Medical",
  "Electronics & Electricals",
  "Hardware & Sanitary",
  "Restaurant & Cafe",
  "General Store & Services",
];

// Local Commerce Synonym & Semantic Expansion Map
const SYNONYM_MAP = {
  photocopy: ["photocopy", "xerox", "printing", "printout", "scan", "lamination", "stationery and xerox", "xerox and stationery"],
  xerox: ["xerox", "photocopy", "printing", "printout", "scan", "lamination", "stationery and xerox"],
  printing: ["printing", "printout", "photocopy", "xerox"],
  printout: ["printout", "printing", "photocopy", "xerox"],
  stationery: ["stationery", "stationary", "books", "notebook", "pen", "stationery and xerox", "xerox and stationery"],
  stationary: ["stationary", "stationery", "books", "notebook", "pen"],
  sweet: ["sweet", "sweets", "mithai", "halwai", "dessert", "bakery"],
  sweets: ["sweets", "sweet", "mithai", "halwai", "dessert", "bakery"],
  mithai: ["mithai", "sweet", "sweets", "halwai", "dessert"],
  fruit: ["fruit", "fruits", "fal", "fresh fruits"],
  fruits: ["fruits", "fruit", "fal", "fresh fruits"],
  vegetable: ["vegetable", "vegetables", "sabzi", "veggies", "fresh vegetables"],
  vegetables: ["vegetables", "vegetable", "sabzi", "veggies", "fresh vegetables"],
  sabzi: ["sabzi", "vegetables", "vegetable", "veggies"],
  clothing: ["clothing", "clothes", "apparel", "garments", "wear", "dress"],
  clothes: ["clothes", "clothing", "apparel", "garments", "wear"],
  tailor: ["tailor", "tailoring", "boutique", "stitching", "alteration"],
  tailoring: ["tailoring", "tailor", "boutique", "stitching"],
  boutique: ["boutique", "tailor", "tailoring", "clothing"],
  grocery: ["grocery", "kirana", "ration", "general store", "supermarket"],
  kirana: ["kirana", "grocery", "ration", "general store", "provision"],
  medical: ["medical", "medicine", "pharmacy", "chemist", "druggist", "healthcare"],
  pharmacy: ["pharmacy", "medical", "medicine", "chemist", "druggist"],
  chemist: ["chemist", "pharmacy", "medical", "medicine"],
  mobile: ["mobile", "phone", "smartphone", "cellular", "repair"],
  repair: ["repair", "service", "fixing", "servicing"],
  bakery: ["bakery", "cake", "cakes", "pastry", "bread"],
  cake: ["cake", "cakes", "bakery", "pastry"],
  cakes: ["cakes", "cake", "bakery", "pastry"],
  hardware: ["hardware", "tools", "sanitary", "plumbing"],
  electrical: ["electrical", "electricals", "electronics", "appliances"],
  electronics: ["electronics", "electrical", "gadgets"],
};

const STOP_WORDS = new Set(["shop", "store", "center", "centre", "near", "in", "and", "&", "the", "a", "of", "to", "for"]);

// Smart tokenized search builder with stop-word removal and synonym expansion
const buildSmartSearchQuery = (query) => {
  if (!query || typeof query !== "string" || !query.trim()) return null;

  const raw = query.trim().toLowerCase();
  const escapedRaw = raw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const patterns = [escapedRaw];

  const words = raw
    .split(/[\s,+/&\\-]+/)
    .map((w) => w.trim())
    .filter((w) => w.length > 0);

  const significantWords = words.filter((w) => !STOP_WORDS.has(w));
  const wordsToProcess = significantWords.length > 0 ? significantWords : words;

  for (const word of wordsToProcess) {
    patterns.push(word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));

    // Check singular / plural
    if (word.endsWith("s") && word.length > 3) {
      patterns.push(word.slice(0, -1));
    } else {
      patterns.push(word + "s");
    }

    // Synonym expansion
    const synonyms = SYNONYM_MAP[word];
    if (synonyms) {
      synonyms.forEach((syn) => patterns.push(syn.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
    }
  }

  const uniquePatterns = [...new Set(patterns.filter(Boolean))];
  const combinedRegex = new RegExp(uniquePatterns.join("|"), "i");

  return [
    { name: { $regex: combinedRegex } },
    { category: { $regex: combinedRegex } },
    { address: { $regex: combinedRegex } },
    { description: { $regex: combinedRegex } },
  ];
};

// Sample initial data with valid NCR / Ghaziabad coordinates for demo seeding
const DEMO_SHOPS_SEED = [
  {
    name: "Rahul Sweets",
    category: "Sweets & Snacks",
    address: "Sadar Bazar, Ghaziabad",
    phone: "+91 98111 22334",
    hours: "8:00 AM - 10:00 PM",
    isOpen: true,
    image: "https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=400&auto=format&fit=crop&q=80",
    location: {
      type: "Point",
      coordinates: [77.4244, 28.6656], // Sadar Bazar Ghaziabad [lng, lat]
    },
  },
  {
    name: "Sharma Stationery",
    category: "Stationery",
    address: "Gandhi Chowk, Muradnagar",
    phone: "+91 98222 33445",
    hours: "9:00 AM - 8:30 PM",
    isOpen: true,
    image: "https://images.unsplash.com/photo-1585776245991-cf89dd7fc73a?w=400&auto=format&fit=crop&q=80",
    location: {
      type: "Point",
      coordinates: [77.5023, 28.7758], // Gandhi Chowk Muradnagar [lng, lat]
    },
  },
  {
    name: "Mobile Care",
    category: "Mobile Repair",
    address: "Main Market, Muradnagar",
    phone: "+91 98333 44556",
    hours: "10:00 AM - 9:00 PM",
    isOpen: true,
    image: "https://images.unsplash.com/photo-1580910051074-3eb694886505?w=400&auto=format&fit=crop&q=80",
    location: {
      type: "Point",
      coordinates: [77.5050, 28.7745], // Main Market Muradnagar [lng, lat]
    },
  },
];

// GET /api/shops/reverse-geocode?lat=...&lng=...
// Secure server-side reverse geocoding proxy (uses LocationIQ with fallback to Nominatim)
export const reverseGeocode = async (req, res) => {
  try {
    const lat = parseFloat(req.query.lat);
    const lng = parseFloat(req.query.lng);

    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return res.status(400).json({
        success: false,
        message: "Valid latitude (-90 to 90) and longitude (-180 to 180) are required.",
      });
    }

    // 1. Try LocationIQ if private key is present in environment
    if (ENV.LOCATIONIQ_KEY && ENV.LOCATIONIQ_KEY.trim() !== "") {
      try {
        const liqUrl = `https://us1.locationiq.com/v1/reverse?key=${encodeURIComponent(
          ENV.LOCATIONIQ_KEY.trim()
        )}&lat=${lat}&lon=${lng}&format=json`;

        const response = await fetch(liqUrl, {
          headers: { Accept: "application/json" },
        });

        if (response.ok) {
          const data = await response.json();
          const addr = data.address || {};
          const road = addr.road || addr.pedestrian || addr.street || "";
          const neighbourhood = addr.neighbourhood || addr.suburb || addr.residential || "";
          const city = addr.city || addr.town || addr.village || addr.county || "";
          const state = addr.state || "";
          const cleanParts = [road, neighbourhood, city, state].filter(Boolean);
          const formatted = cleanParts.length > 0 ? cleanParts.join(", ") : data.display_name;

          return res.status(200).json({
            success: true,
            provider: "locationiq",
            address: formatted,
            locality: neighbourhood || city || state,
            city: city || state,
            state,
            displayName: data.display_name,
            coordinates: { lat, lng },
          });
        }
      } catch (liqErr) {
        console.warn("LocationIQ reverse geocoding failed, falling back to OSM Nominatim:", liqErr.message);
      }
    }

    // 2. Fallback to OpenStreetMap Nominatim (Free, no secret token needed)
    const osmUrl = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`;
    const osmRes = await fetch(osmUrl, {
      headers: {
        Accept: "application/json",
        "User-Agent": "ShopNear-Hyperlocal/1.0",
      },
    });

    if (!osmRes.ok) {
      throw new Error(`Reverse geocoding provider responded with status ${osmRes.status}`);
    }

    const osmData = await osmRes.json();
    const addr = osmData.address || {};
    const road = addr.road || addr.pedestrian || addr.street || "";
    const neighbourhood = addr.neighbourhood || addr.suburb || addr.residential || "";
    const city = addr.city || addr.town || addr.village || addr.county || "";
    const state = addr.state || "";
    const cleanParts = [road, neighbourhood, city, state].filter(Boolean);
    const formatted = cleanParts.length > 0 ? cleanParts.join(", ") : osmData.display_name;

    return res.status(200).json({
      success: true,
      provider: "nominatim",
      address: formatted,
      locality: neighbourhood || city || state,
      city: city || state,
      state,
      displayName: osmData.display_name,
      coordinates: { lat, lng },
    });
  } catch (err) {
    console.error("Error in reverseGeocode:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to reverse geocode coordinates",
      error: err.message,
    });
  }
};

// GET /api/shops/nearby?lat=...&lng=...&category=...&query=...&radiusKm=...
// Discovers shops sorted by spherical distance from user coordinates
export const getNearbyShops = async (req, res) => {
  try {
    const lat = parseFloat(req.query.lat);
    const lng = parseFloat(req.query.lng);

    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return res.status(400).json({
        success: false,
        message: "Valid latitude (-90 to 90) and longitude (-180 to 180) are required for nearby discovery.",
      });
    }

    const { category, query, radiusKm } = req.query;
    const maxRadiusKm = Math.min(Math.max(parseFloat(radiusKm) || 10, 0.5), 50);
    const maxDistanceMeters = maxRadiusKm * 1000;

    const matchQuery = {};

    // Filter by category if specified (case-insensitive exact or substring, also checking synonyms)
    if (category && category.trim() && category.trim().toLowerCase() !== "all") {
      const catConditions = buildSmartSearchQuery(category);
      if (catConditions) {
        matchQuery.$or = catConditions;
      } else {
        matchQuery.category = { $regex: new RegExp(category.trim(), "i") };
      }
    }

    // Filter by text search if provided
    if (query && query.trim()) {
      const searchConditions = buildSmartSearchQuery(query);
      if (searchConditions) {
        if (matchQuery.$or) {
          matchQuery.$and = [{ $or: matchQuery.$or }, { $or: searchConditions }];
          delete matchQuery.$or;
        } else {
          matchQuery.$or = searchConditions;
        }
      }
    }

    // Filter to only include shops with valid coordinates
    matchQuery["location.coordinates"] = { $exists: true, $ne: [] };

    // Exclude the current user's own shops if authenticated
    if (req.user && req.user._id) {
      matchQuery.owner = { $ne: new mongoose.Types.ObjectId(req.user._id) };
    }

    const pipeline = [
      {
        $geoNear: {
          near: {
            type: "Point",
            coordinates: [lng, lat],
          },
          distanceField: "distanceMeters",
          maxDistance: maxDistanceMeters,
          spherical: true,
          query: matchQuery,
        },
      },
      {
        $addFields: {
          distanceKm: { $round: [{ $divide: ["$distanceMeters", 1000] }, 2] },
        },
      },
      {
        $sort: { distanceMeters: 1 },
      },
    ];

    const rawShops = await Shop.aggregate(pipeline);

    // Format human-friendly distance on each result
    const shops = rawShops.map((shop) => {
      const meters = Math.round(shop.distanceMeters || 0);
      let distanceText = "";
      if (meters < 1000) {
        distanceText = `${meters} m away`;
      } else {
        const km = (meters / 1000).toFixed(1);
        distanceText = `${km} km away`;
      }

      return {
        ...shop,
        distanceText,
        distanceKm: (meters / 1000).toFixed(1),
      };
    });

    return res.status(200).json({
      success: true,
      count: shops.length,
      radiusKm: maxRadiusKm,
      userCoordinates: { lat, lng },
      shops,
    });
  } catch (error) {
    console.error("Error in getNearbyShops:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to search nearby shops",
      error: error.message,
    });
  }
};

// GET /api/shops/public?category=...&query=...
// Retrieves all registered real shops with optional category/text filtering
export const getPublicShops = async (req, res) => {
  try {
    const { category, query } = req.query;
    const filter = {};

    if (category && category.trim() && category.trim().toLowerCase() !== "all") {
      const catConditions = buildSmartSearchQuery(category);
      if (catConditions) {
        filter.$or = catConditions;
      } else {
        filter.category = { $regex: new RegExp(category.trim(), "i") };
      }
    }

    if (query && query.trim()) {
      const searchConditions = buildSmartSearchQuery(query);
      if (searchConditions) {
        if (filter.$or) {
          filter.$and = [{ $or: filter.$or }, { $or: searchConditions }];
          delete filter.$or;
        } else {
          filter.$or = searchConditions;
        }
      }
    }

    // Exclude the current user's own shops if authenticated
    if (req.user && req.user._id) {
      filter.owner = { $ne: req.user._id };
    }

    const shops = await Shop.find(filter)
      .sort({ createdAt: -1 })
      .populate("owner", "name email");

    return res.status(200).json({
      success: true,
      count: shops.length,
      shops,
    });
  } catch (error) {
    console.error("Error in getPublicShops:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch public shops",
      error: error.message,
    });
  }
};

// GET /api/shops/suggestions?q=...
// Returns ONLY matching categories for search autocomplete (excludes individual shop names)
export const getSearchSuggestions = async (req, res) => {
  try {
    const q = (req.query.q || "").trim().toLowerCase();
    if (!q) {
      return res.status(200).json({ success: true, suggestions: [] });
    }

    const suggestions = [];
    const seen = new Set();

    // Match categories by substring, prefix, or category synonyms
    for (const cat of APP_CATEGORIES) {
      const catLower = cat.toLowerCase();
      let isMatch = catLower.includes(q);

      // Check if query is a known synonym for this category
      if (!isMatch) {
        const querySynonyms = SYNONYM_MAP[q] || [];
        for (const syn of querySynonyms) {
          if (catLower.includes(syn.toLowerCase())) {
            isMatch = true;
            break;
          }
        }
      }

      // Check reverse synonym match
      if (!isMatch) {
        const catWords = catLower.split(/[\s&/]+/);
        for (const cw of catWords) {
          const cwSynonyms = SYNONYM_MAP[cw] || [];
          if (cwSynonyms.some((s) => s.toLowerCase() === q || q.includes(s.toLowerCase()))) {
            isMatch = true;
            break;
          }
        }
      }

      if (isMatch && !seen.has(catLower)) {
        suggestions.push({
          type: "category",
          text: cat,
          label: cat,
        });
        seen.add(catLower);
      }
    }

    return res.status(200).json({
      success: true,
      suggestions: suggestions.slice(0, 8),
    });
  } catch (error) {
    console.error("Error in getSearchSuggestions:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch suggestions",
    });
  }
};

// GET /api/shops/my-shops
export const getMyShops = async (req, res) => {
  try {
    const shops = await Shop.find({ owner: req.user._id }).sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      shops,
      count: shops.length,
    });
  } catch (error) {
    console.error("Error in getMyShops:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch user shops",
    });
  }
};

// POST /api/shops
export const createShop = async (req, res) => {
  try {
    const { name, category, address, phone, hours, image, isOpen, coordinates, description, additionalImages } = req.body;

    if (!name || !category || !address) {
      return res.status(400).json({
        success: false,
        message: "Shop name, category, and address are required",
      });
    }

    let finalImageUrl = image?.trim() || "";
    let finalImagePublicId = "";

    // Upload cover image to Cloudinary if base64 dataURI provided
    if (finalImageUrl.startsWith("data:image/")) {
      try {
        const uploadResult = await uploadShopImage(finalImageUrl);
        finalImageUrl = uploadResult.secure_url;
        finalImagePublicId = uploadResult.public_id;
      } catch (uploadErr) {
        console.warn("Cloudinary upload failed for cover image, keeping fallback:", uploadErr.message);
      }
    }

    if (!finalImageUrl) {
      finalImageUrl = "https://images.unsplash.com/photo-1580910051074-3eb694886505?w=400&auto=format&fit=crop&q=80";
    }

    // Process additional images if present
    const uploadedAdditionalImages = [];
    if (Array.isArray(additionalImages)) {
      for (const imgItem of additionalImages) {
        if (typeof imgItem === "string" && imgItem.trim()) {
          if (imgItem.startsWith("data:image/")) {
            try {
              const resImg = await uploadShopImage(imgItem);
              uploadedAdditionalImages.push(resImg.secure_url);
            } catch (err) {
              uploadedAdditionalImages.push(imgItem);
            }
          } else {
            uploadedAdditionalImages.push(imgItem.trim());
          }
        }
      }
    }

    const parsedCoords = parseCoordinates(coordinates);
    const shopData = {
      name: name.trim(),
      category: category.trim(),
      address: address.trim(),
      phone: phone?.trim() || "+91 98000 00000",
      hours: hours?.trim() || "9:00 AM - 9:00 PM",
      description: description?.trim() || "",
      isOpen: isOpen !== undefined ? Boolean(isOpen) : true,
      image: finalImageUrl,
      imagePublicId: finalImagePublicId,
      additionalImages: uploadedAdditionalImages,
      owner: req.user._id,
    };

    if (parsedCoords) {
      shopData.location = {
        type: "Point",
        coordinates: parsedCoords,
      };
    }

    const shop = await Shop.create(shopData);

    await User.findByIdAndUpdate(req.user._id, { $addToSet: { shops: shop._id } });

    return res.status(201).json({
      success: true,
      message: "Shop successfully created",
      shop,
    });
  } catch (error) {
    console.error("Error in createShop:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create shop",
      error: error.message,
    });
  }
};

// POST /api/shops/seed-demo (Helper to seed demo shops)
export const seedDemoShops = async (req, res) => {
  try {
    const existingCount = await Shop.countDocuments({ owner: req.user._id });
    if (existingCount > 0) {
      const shops = await Shop.find({ owner: req.user._id }).sort({ createdAt: -1 });
      return res.status(200).json({
        success: true,
        message: "User already has registered shops",
        shops,
        count: shops.length,
      });
    }

    const createdShops = [];
    for (const demo of DEMO_SHOPS_SEED) {
      const shop = await Shop.create({
        ...demo,
        owner: req.user._id,
      });
      createdShops.push(shop);
      await User.findByIdAndUpdate(req.user._id, { $addToSet: { shops: shop._id } });
    }

    return res.status(201).json({
      success: true,
      message: "Demo shops seeded successfully",
      shops: createdShops,
      count: createdShops.length,
    });
  } catch (error) {
    console.error("Error in seedDemoShops:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to seed demo shops",
    });
  }
};

// PUT /api/shops/:id
export const updateShop = async (req, res) => {
  try {
    const shop = await Shop.findOne({ _id: req.params.id, owner: req.user._id });
    if (!shop) {
      return res.status(404).json({
        success: false,
        message: "Shop not found or you are not authorized to edit it",
      });
    }

    const { name, category, address, phone, hours, image, isOpen, coordinates, description, additionalImages } = req.body;

    if (name !== undefined) shop.name = name.trim();
    if (category !== undefined) shop.category = category.trim();
    if (address !== undefined) shop.address = address.trim();
    if (phone !== undefined) shop.phone = phone.trim();
    if (hours !== undefined) shop.hours = hours.trim();
    if (description !== undefined) shop.description = description.trim();
    if (isOpen !== undefined) shop.isOpen = Boolean(isOpen);
    if (additionalImages !== undefined && Array.isArray(additionalImages)) {
      shop.additionalImages = additionalImages;
    }
    if (image !== undefined && image.trim() !== "") shop.image = image.trim();

    if (coordinates !== undefined) {
      const parsedCoords = parseCoordinates(coordinates);
      if (parsedCoords) {
        shop.location = {
          type: "Point",
          coordinates: parsedCoords,
        };
      }
    }

    await shop.save();

    return res.status(200).json({
      success: true,
      message: "Shop updated successfully",
      shop,
    });
  } catch (error) {
    console.error("Error in updateShop:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update shop",
    });
  }
};

// DELETE /api/shops/:id
export const deleteShop = async (req, res) => {
  try {
    const shop = await Shop.findOne({ _id: req.params.id, owner: req.user._id });
    if (!shop) {
      return res.status(404).json({
        success: false,
        message: "Shop not found or you are not authorized to delete it",
      });
    }

    // Delete shop image from Cloudinary if hosted there
    const shopImgId = shop.imagePublicId || extractPublicIdFromUrl(shop.image);
    if (shopImgId) {
      await deleteCloudinaryImage(shopImgId);
    }

    await Shop.findByIdAndDelete(shop._id);
    await User.findByIdAndUpdate(req.user._id, { $pull: { shops: shop._id } });

    return res.status(200).json({
      success: true,
      message: "Shop removed successfully",
    });
  } catch (error) {
    console.error("Error in deleteShop:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete shop",
    });
  }
};
