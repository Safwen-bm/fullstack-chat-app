import { generateToken } from "../lib/utils.js";
import User from "../models/user.model.js";
import bcrypt from "bcrypt";
import cloudinary from "../lib/cloudinary.js";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_NAME_LENGTH = 50;

const isNonEmptyString = (value) =>
  typeof value === "string" && value.trim().length > 0;

export const signup = async (req, res) => {
  const { fullName, email, password } = req.body ?? {};

  try {
    if (
      !isNonEmptyString(fullName) ||
      !isNonEmptyString(email) ||
      typeof password !== "string" ||
      !password
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const cleanName = fullName.trim();
    const typedEmail = email.trim();
    const cleanEmail = typedEmail.toLowerCase();

    if (cleanName.length > MAX_NAME_LENGTH) {
      return res
        .status(400)
        .json({ message: `Name must be under ${MAX_NAME_LENGTH} characters` });
    }

    if (!EMAIL_PATTERN.test(cleanEmail)) {
      return res.status(400).json({ message: "Please enter a valid email address" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    // also check the typed case, for accounts created before emails were lowercased
    const existing = await User.findOne({ email: { $in: [cleanEmail, typedEmail] } });
    if (existing) return res.status(400).json({ message: "Email already exists" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      fullName: cleanName,
      email: cleanEmail,
      password: hashedPassword,
    });

    await newUser.save();
    generateToken(newUser._id, res);

    res.status(201).json({
      _id: newUser._id,
      fullName: newUser.fullName,
      email: newUser.email,
      profilePic: newUser.profilePic,
      createdAt: newUser.createdAt,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "Email already exists" });
    }
    console.log("Error in signup controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body ?? {};

  try {
    if (!isNonEmptyString(email) || typeof password !== "string" || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const typedEmail = email.trim();
    const cleanEmail = typedEmail.toLowerCase();

    let user = await User.findOne({ email: cleanEmail });
    // accounts created before emails were lowercased
    if (!user && cleanEmail !== typedEmail) {
      user = await User.findOne({ email: typedEmail });
    }

    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    generateToken(user._id, res);

    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic,
      createdAt: user.createdAt,
    });
  } catch (error) {
    console.log("Error in login controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const logout = (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.log("Error in logout controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { profilePic, fullName } = req.body ?? {};
    const userId = req.user._id;
    const update = {};

    if (fullName !== undefined) {
      if (!isNonEmptyString(fullName)) {
        return res.status(400).json({ message: "Full name is required" });
      }
      if (fullName.trim().length > MAX_NAME_LENGTH) {
        return res
          .status(400)
          .json({ message: `Name must be under ${MAX_NAME_LENGTH} characters` });
      }
      update.fullName = fullName.trim();
    }

    if (profilePic !== undefined) {
      // only accept an uploaded image (base64 data URL), never a remote URL
      if (typeof profilePic !== "string" || !profilePic.startsWith("data:image/")) {
        return res.status(400).json({ message: "Profile picture must be an image" });
      }
      const uploadResponse = await cloudinary.uploader.upload(profilePic);
      update.profilePic = uploadResponse.secure_url;
    }

    if (Object.keys(update).length === 0) {
      return res.status(400).json({ message: "Nothing to update" });
    }

    const updatedUser = await User.findByIdAndUpdate(userId, update, {
      new: true,
    }).select("-password");

    res.status(200).json(updatedUser);
  } catch (error) {
    console.log("Error in update profile controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const checkAuth = (req, res) => {
  try {
    res.status(200).json(req.user);
  } catch (error) {
    console.log("Error in checkAuth controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};