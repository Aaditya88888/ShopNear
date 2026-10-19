import dotenv from "dotenv";

dotenv.config();

export const ENV = {
  PORT: process.env.PORT || 5001,
  DB_URL: process.env.DB_URL,
};
