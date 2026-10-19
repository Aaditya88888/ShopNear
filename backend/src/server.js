import express from "express";
import cors from "cors";
import { ENV } from "./lib/env.js";

const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://shop-near.vercel.app",
    ],
    credentials: true,
  })
);
app.use(express.json());

console.log(ENV.PORT);

app.get("/", (req, res) => {
  res.status(200).json({ message: "Hello from the server side" });
});

app.listen(ENV.PORT, () => {
  console.log(`Server is running on port ${ENV.PORT}`);
});
