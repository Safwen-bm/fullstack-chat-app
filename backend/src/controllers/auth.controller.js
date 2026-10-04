import bcrypt from "bcrypt";
import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import { generateToken } from "../lib/utils.js";
import { destroyImageByUrl } from "../lib/images.js";
import { io } from "../lib/socket.js";
import cloudinary from "../lib/cloudinary.js";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ALLOWED_IMAGE = /^data:image\/(png|jpe?g|webp|gif);base64,/;
const MAX_NAME_LENGTH = 50;
const MAX_PASSWORD_BYTES = 72; // bcrypt ignores everything after 72 bytes

// compared against when the email does not exist, so both cases take the same time
const DUMMY_HASH = bcrypt.hashSync("onlychat-dummy-password", 10);

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
    if (Buffer.byteLength(password) > MAX_PASSWORD_BYTES) {
      return res.status(400).json({ message: "Password is too long (72 characters max)" });
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

    // never run bcrypt on absurdly long input
    if (Buffer.byteLength(password) > MAX_PASSWORD_BYTES) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const typedEmail = email.trim();
    const cleanEmail = typedEmail.toLowerCase();

    let user = await User.findOne({ email: cleanEmail });
    // accounts created before emails were lowercased
    if (!user && cleanEmail !== typedEmail) {
      user = await User.findOne({ email: typedEmail });
    }

    // always run one bcrypt comparison, whether or not the user exists
    const isPasswordCorrect = await bcrypt.compare(
      password,
      user ? user.password : DUMMY_HASH
    );

    if (!user || !isPasswordCorrect) {
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
    res.clearCookie("jwt", {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV !== "development",
    });
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
      // only real image uploads (no SVG, no remote URLs)
      if (typeof profilePic !== "string" || !ALLOWED_IMAGE.test(profilePic)) {
        return res.status(400).json({ message: "Profile picture must be a PNG, JPG, WebP or GIF image" });
      }
      const uploadResponse = await cloudinary.uploader.upload(profilePic, {
        folder: "onlychat/avatars",
        resource_type: "image",
        transformation: [{ width: 512, height: 512, crop: "fill", gravity: "auto" }],
      });
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
    // null means "not logged in" and is a normal answer, not an error
    res.status(200).json(req.user ?? null);
  } catch (error) {
    console.log("Error in checkAuth controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body ?? {};

    if (typeof currentPassword !== "string" || !currentPassword || typeof newPassword !== "string") {
      return res.status(400).json({ message: "Current and new password are required" });
    }
    if (Buffer.byteLength(currentPassword) > MAX_PASSWORD_BYTES) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }
    if (Buffer.byteLength(newPassword) > MAX_PASSWORD_BYTES) {
      return res.status(400).json({ message: "Password is too long (72 characters max)" });
    }

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const isCorrect = await bcrypt.compare(currentPassword, user.password);
    if (!isCorrect) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }
    if (currentPassword === newPassword) {
      return res.status(400).json({ message: "The new password must be different" });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.status(200).json({ message: "Password updated" });
  } catch (error) {
    console.log("Error in changePassword controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const deleteAccount = async (req, res) => {
  try {
    const { password } = req.body ?? {};

    if (typeof password !== "string" || !password) {
      return res.status(400).json({ message: "Password is required" });
    }
    if (Buffer.byteLength(password) > MAX_PASSWORD_BYTES) {
      return res.status(400).json({ message: "Incorrect password" });
    }

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const isCorrect = await bcrypt.compare(password, user.password);
    if (!isCorrect) {
      return res.status(400).json({ message: "Incorrect password" });
    }

    // collect images first, delete the rows, then clean Cloudinary after answering
    const withImages = await Message.find({
      senderId: user._id,
      image: { $exists: true, $ne: null },
    })
      .select("image")
      .lean();

    await Message.deleteMany({ $or: [{ senderId: user._id }, { receiverId: user._id }] });
    await User.findByIdAndDelete(user._id);

    // close every open tab of this user
    io.in(String(user._id)).disconnectSockets(true);

    res.clearCookie("jwt", {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV !== "development",
    });
    res.status(200).json({ message: "Account deleted" });

    [user.profilePic, ...withImages.map((m) => m.image)]
      .filter(Boolean)
      .forEach((url) => destroyImageByUrl(url));
  } catch (error) {
    console.log("Error in deleteAccount controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};