import mongoose from "mongoose";
import dns from "dns";
import { ENV } from "./env.js";

// Safely configure public DNS fallback to prevent querySrv ECONNREFUSED issues on local ISP/network DNS
try {
  dns.setServers(["8.8.8.8", "8.8.4.4"]);
} catch (dnsErr) {
  // In environments where custom DNS override is restricted, default system resolver will be used
}

export const connectDB = async () => {
  const dbUri = (ENV.DB_URL || "").trim();

  if (!dbUri) {
    console.error(
      "❌ MongoDB Configuration Error: No database connection string found.\n" +
      "👉 Please configure an environment variable named 'DB_URL' (or 'MONGODB_URI' / 'MONGO_URI') in your Render Dashboard (Environment tab)."
    );
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(dbUri, {
      dbName: "shopnear",
    });
    console.log(`✅ Connected to MongoDB (${conn.connection.name}): ${conn.connection.host}`);
  } catch (error) {
    console.error("❌ Error connecting to MongoDB:", error.message || error);
    process.exit(1);
  }
};
