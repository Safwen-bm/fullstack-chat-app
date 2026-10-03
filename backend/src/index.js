import "dotenv/config";
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import path from "path";

import { connectDB } from "./lib/db.js";
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import { app, server, CLIENT_ORIGINS } from "./lib/socket.js";
import { apiLimiter } from "./middleware/rateLimit.middleware.js";

// fail fast instead of running half broken
const REQUIRED_ENV = [
  "MONGODB_URI",
  "JWT_SECRET",
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
];
const missing = REQUIRED_ENV.filter((key) => !process.env[key]);
if (missing.length > 0) {
  console.error("Missing environment variables:", missing.join(", "));
  process.exit(1);
}

const PORT = process.env.PORT || 5001;
const isProduction = process.env.NODE_ENV === "production";
const rootDir = path.resolve();

// Render sits behind a proxy: needed to see the real client IP (rate limiting)
app.set("trust proxy", 1);

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "blob:", "https://res.cloudinary.com"],
        connectSrc: ["'self'", "wss:"],
        fontSrc: ["'self'", "data:"],
        objectSrc: ["'none'"],
        frameAncestors: ["'none'"],
        baseUri: ["'self'"],
        formAction: ["'self'"],
        upgradeInsecureRequests: isProduction ? [] : null,
      },
    },
  })
);

app.use(compression());

app.use(
  cors({
    origin: CLIENT_ORIGINS,
    credentials: true,
  })
);

app.use(cookieParser());

// credentials endpoints never need more than a few bytes
app.use(["/api/auth/login", "/api/auth/signup"], express.json({ limit: "10kb" }));
// images are compressed by the client, 6mb is a generous ceiling
app.use(express.json({ limit: "6mb" }));

app.get("/api/health", (req, res) => res.status(200).json({ status: "ok" }));

app.use("/api", apiLimiter);
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

// unknown API routes must not fall through to the frontend
app.use("/api", (req, res) => res.status(404).json({ message: "Not found" }));

if (isProduction) {
  const distPath = path.join(rootDir, "../frontend/dist");

  app.use(
    express.static(distPath, {
      setHeaders: (res, filePath) => {
        if (filePath.endsWith("index.html")) {
          res.setHeader("Cache-Control", "no-cache");
        } else if (filePath.includes(`${path.sep}assets${path.sep}`)) {
          // hashed file names: safe to cache for a year
          res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
        }
      },
    })
  );

  app.get("*", (req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}

// JSON errors instead of Express's default HTML page
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (err.type === "entity.too.large") {
    return res.status(413).json({ message: "That file is too large." });
  }
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ message: "Invalid request body." });
  }
  console.error("Unhandled error:", err.message);
  res.status(err.status || 500).json({ message: "Internal Server Error" });
});

server.listen(PORT, () => {
  console.log("Server is running on PORT:" + PORT);
  connectDB();
});

// Render sends SIGTERM on every deploy: close cleanly
process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down");
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(0), 5000).unref();
});