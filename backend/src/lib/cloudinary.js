import { v2 as cloudinary } from "cloudinary";
import { ENV } from "./env.js";

cloudinary.config({
  cloud_name: ENV.CLOUDINARY_CLOUD_NAME,
  api_key: ENV.CLOUDINARY_API_KEY,
  api_secret: ENV.CLOUDINARY_API_SECRET,
});

/**
 * Extracts public_id from a Cloudinary URL if available
 * e.g. https://res.cloudinary.com/.../upload/v12345/shopnear/avatars/xyz.webp -> shopnear/avatars/xyz
 */
export const extractPublicIdFromUrl = (url) => {
  if (!url || typeof url !== "string") return null;
  if (!url.includes("cloudinary.com")) return null;
  try {
    const matches = url.match(/\/upload\/(?:v\d+\/)?([^\.]+)/);
    return matches && matches[1] ? matches[1] : null;
  } catch (err) {
    return null;
  }
};

/**
 * Safely destroys an asset in Cloudinary by its publicId
 */
export const deleteCloudinaryImage = async (publicId) => {
  if (!publicId || typeof publicId !== "string") return null;
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (err) {
    console.warn("Failed to delete Cloudinary asset:", publicId, err.message);
    return null;
  }
};

/**
 * Uploads an avatar image with automatic face-centered crop, webp format conversion, and auto compression
 */
export const uploadProfileAvatar = async (dataURI) => {
  return await cloudinary.uploader.upload(dataURI, {
    folder: "shopnear/avatars",
    resource_type: "image",
    transformation: [
      {
        width: 400,
        height: 400,
        crop: "fill",
        gravity: "face",
        quality: "auto",
        fetch_format: "auto",
      },
    ],
  });
};

/**
 * Uploads a shop image with auto compression, dimensions limit, and modern format
 */
export const uploadShopImage = async (dataURI) => {
  return await cloudinary.uploader.upload(dataURI, {
    folder: "shopnear/shops",
    resource_type: "image",
    transformation: [
      {
        width: 800,
        height: 600,
        crop: "limit",
        quality: "auto",
        fetch_format: "auto",
      },
    ],
  });
};

export default cloudinary;
