import "dotenv/config";
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";

import { connectDB } from "./lib/db.js";
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import { app, server, CLIENT_ORIGINS } from "./lib/socket.js";

const PORT = process.env.PORT || 5001;
const rootDir = path.resolve();

// 10mb is enough for base64 images; the client compresses them well below that
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

app.use(cookieParser());
app.use(
  cors({
    origin: CLIENT_ORIGINS,
    credentials: true,
  })
);

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(rootDir, "../frontend/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(rootDir, "../frontend", "dist", "index.html"));
  });
}

// JSON errors instead of Express's default HTML page
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (err.type === "entity.too.large") {
    return res.status(413).json({ message: "That file is too large." });
  }
  console.error("Unhandled error:", err.message);
  res.status(err.status || 500).json({ message: "Internal Server Error" });
});

server.listen(PORT, () => {
  console.log("Server is running on PORT:" + PORT);
  connectDB();
});