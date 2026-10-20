import express from "express";
import cors from "cors";
import { ENV } from "./lib/env.js";
import { connectDB } from "./lib/db.js";

const app = express();

app.use(
  cors({
    origin: ["http://localhost:5173", "https://shop-near.vercel.app"],
    credentials: true,
  }),
);
app.use(express.json());

console.log(ENV.PORT);

app.get("/", (req, res) => {
  res.status(200).json({ message: "Hello from the server side" });
});

const startServer = async () => {
  try {
    await connectDB();
    app.listen(ENV.PORT, () => {
      console.log(`Server is running on port ${ENV.PORT}`);
    });
  } catch (error) {
    console.log("Error starting the server", error);
  }
};

startServer();
