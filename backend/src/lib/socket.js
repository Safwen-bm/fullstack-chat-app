import { Server } from "socket.io";
import http from "http";
import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

const app = express();
const server = http.createServer(app);

export const CLIENT_ORIGINS = [process.env.CLIENT_URL, "http://localhost:5173"].filter(Boolean);

const io = new Server(server, {
  cors: {
    origin: CLIENT_ORIGINS,
    credentials: true,
  },
});

const parseCookies = (header = "") => {
  const cookies = {};
  for (const part of header.split(";")) {
    const index = part.indexOf("=");
    if (index < 0) continue;
    const key = part.slice(0, index).trim();
    let value = part.slice(index + 1).trim();
    try {
      value = decodeURIComponent(value);
    } catch {
      // keep the raw value
    }
    if (key) cookies[key] = value;
  }
  return cookies;
};

// Authenticate every socket with the same jwt cookie used by the REST API.
// The user id comes from the verified token, never from the client.
io.use(async (socket, next) => {
  try {
    const token = parseCookies(socket.handshake.headers.cookie).jwt;
    if (!token) return next(new Error("Unauthorized"));

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const exists = await User.exists({ _id: decoded.userId });
    if (!exists) return next(new Error("Unauthorized"));

    socket.data.userId = String(decoded.userId);
    next();
  } catch {
    next(new Error("Unauthorized"));
  }
});

// userId -> set of socket ids (one user can have several tabs or devices)
const userSockets = new Map();

// Every socket joins a room named after its userId, so this returns the userId
// itself: io.to(getReceiverSocketId(id)) reaches all of that user's tabs.
export function getReceiverSocketId(userId) {
  const id = String(userId);
  return userSockets.has(id) ? id : undefined;
}

const emitOnlineUsers = () => {
  io.emit("getOnlineUsers", [...userSockets.keys()]);
};

io.on("connection", (socket) => {
  const { userId } = socket.data;

  socket.join(userId);
  const sockets = userSockets.get(userId) ?? new Set();
  sockets.add(socket.id);
  userSockets.set(userId, sockets);

  // the new client needs the current list even if the user was already online
  emitOnlineUsers();

   // typing indicator: forward to the other user's room (throttled)
  let lastTypingAt = 0;
  socket.on("typing", ({ to, isTyping } = {}) => {
    if (typeof to !== "string" || !/^[a-f0-9]{24}$/i.test(to)) return;

    if (isTyping) {
      const now = Date.now();
      if (now - lastTypingAt < 300) return;
      lastTypingAt = now;
    }

    socket.to(to).emit("typing", { from: userId, isTyping: Boolean(isTyping) });
  });

  socket.on("disconnect", () => {
    const current = userSockets.get(userId);
    if (!current) return;

    current.delete(socket.id);
    if (current.size === 0) {
      userSockets.delete(userId);
      emitOnlineUsers();
    }
  });
});

export { io, app, server };