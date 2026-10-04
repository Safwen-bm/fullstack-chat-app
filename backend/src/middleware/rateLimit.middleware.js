import rateLimit from "express-rate-limit";

const base = { standardHeaders: true, legacyHeaders: false };

const reply = (message) => (req, res) => res.status(429).json({ message });

const userKey = (req) => String(req.user?._id ?? "anonymous");

// everything under /api, per IP
export const apiLimiter = rateLimit({
  ...base,
  windowMs: 15 * 60 * 1000,
  limit: 1000,
  handler: reply("Too many requests. Please slow down."),
});

// only failed logins count, so normal users are never affected
export const loginLimiter = rateLimit({
  ...base,
  windowMs: 15 * 60 * 1000,
  limit: 10,
  skipSuccessfulRequests: true,
  handler: reply("Too many login attempts. Try again in 15 minutes."),
});

export const signupLimiter = rateLimit({
  ...base,
  windowMs: 60 * 60 * 1000,
  limit: 10,
  handler: reply("Too many accounts created from this network. Try again later."),
});

// per logged-in user, not per IP
export const sendMessageLimiter = rateLimit({
  ...base,
  windowMs: 60 * 1000,
  limit: 40,
  keyGenerator: userKey,
  handler: reply("You are sending messages too fast. Slow down a little."),
});

export const profileLimiter = rateLimit({
  ...base,
  windowMs: 60 * 60 * 1000,
  limit: 20,
  keyGenerator: userKey,
  handler: reply("Too many profile updates. Try again later."),
});

// edit, delete and react
export const messageActionLimiter = rateLimit({
  ...base,
  windowMs: 60 * 1000,
  limit: 60,
  keyGenerator: userKey,
  handler: reply("Too many actions. Slow down a little."),
});

// change password and delete account: only wrong attempts count
export const passwordLimiter = rateLimit({
  ...base,
  windowMs: 60 * 60 * 1000,
  limit: 10,
  skipSuccessfulRequests: true,
  keyGenerator: userKey,
  handler: reply("Too many attempts. Try again in an hour."),
});