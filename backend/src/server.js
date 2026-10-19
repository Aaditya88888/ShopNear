import express from "express";
import { ENV } from "./lib/env.js";

const app = express();

console.log(ENV.PORT);

app.get("/", (req, res) => {
  res.status(200).json({ message: "Hello from the server side" });
});

app.listen(ENV.PORT, () => {
  console.log(`Server is running on port ${ENV.PORT}`);
});
