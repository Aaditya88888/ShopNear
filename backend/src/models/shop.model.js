import mongoose from "mongoose";

const shopSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Shop name is required"],
      trim: true,
    },
    category: {
      type: String,
      required: [true, "Shop category is required"],
      trim: true,
    },
    address: {
      type: String,
      required: [true, "Shop address/location is required"],
      trim: true,
    },
    phone: {
      type: String,
      default: "+91 98000 00000",
      trim: true,
    },
    hours: {
      type: String,
      default: "9:00 AM - 9:00 PM",
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    isOpen: {
      type: Boolean,
      default: true,
    },
    image: {
      type: String,
      default: "",
    },
    imagePublicId: {
      type: String,
      default: "",
    },
    additionalImages: {
      type: [String],
      default: [],
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: undefined,
      },
    },
  },
  {
    timestamps: true,
  }
);

// 2dsphere index for geospatial proximity searches
shopSchema.index({ location: "2dsphere" });

export const Shop = mongoose.model("Shop", shopSchema);
