import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const protectRoute = async (req, res, next) => {
  try {
    const token = req.cookies?.jwt;

    if (!token) {
      return res.status(401).json({ message: "Unauthorized - No Token Provided" });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      // expired, malformed or tampered token
      return res.status(401).json({ message: "Unauthorized - Invalid Token" });
    }

    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(401).json({ message: "Unauthorized - User Not Found" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Error in protectRoute middleware: ", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// like protectRoute, but a missing or invalid session is not an error
export const optionalAuth = async (req, res, next) => {
  try {
    const token = req.cookies?.jwt;
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.userId).select("-password");
    }
  } catch {
    // expired or invalid token: treat the visitor as logged out
  }
  next();
};