import mongoose from "mongoose";
import dns from "dns";

import { ENV } from "./env.js";

// Use public DNS to prevent querySrv ECONNREFUSED issues on local ISP/network DNS
dns.setServers(["8.8.8.8", "8.8.4.4"]);

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(ENV.DB_URL, {
      dbName: "shopnear",
    });
    console.log(`✅ Connected to MongoDB (${conn.connection.name}): ${conn.connection.host}`);
  } catch (error) {
    console.log("❌ Error connecting to MongoDb", error);
    process.exit(1);
  }
};
