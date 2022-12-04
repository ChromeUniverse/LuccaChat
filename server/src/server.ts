// Packages
import express from "express";
import cors from "cors";
import * as dotenv from "dotenv";
import cookieParser from "cookie-parser";
dotenv.config({ path: __dirname + "/.env" });

// Express routers
import api from "./routers/api";
import auth from "./routers/auth";

// Express config
const app = express();
app.use(cookieParser());
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:4173"],
    credentials: true,
  })
);

// Mount routers
app.use("/api", api);
app.use("/auth", auth);

// Profile picture static files
app.use("/avatars", express.static("avatars"));

// Start server
app.listen(process.env.HTTP_PORT, () => {
  console.log(
    `REST API listening on http://localhost:${process.env.HTTP_PORT}`
  );
});
