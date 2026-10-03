import mongoose from "mongoose";
import User from "../models/user.model.js";
import Message from "../models/message.model.js";

import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

const MAX_TEXT_LENGTH = 2000;
const DEFAULT_PAGE_SIZE = 40;
const ALLOWED_IMAGE = /^data:image\/(png|jpe?g|webp|gif);base64,/;

export const getUsersForSidebar = async (req, res) => {
  try {
    const myId = req.user._id;

    const [users, lastMessages, unread] = await Promise.all([
      User.find({ _id: { $ne: myId } }).select("-password").lean(),

      // most recent message of every conversation I am part of
      Message.aggregate([
        { $match: { $or: [{ senderId: myId }, { receiverId: myId }] } },
        { $sort: { _id: -1 } },
        {
          $group: {
            _id: { $cond: [{ $eq: ["$senderId", myId] }, "$receiverId", "$senderId"] },
            last: { $first: "$$ROOT" },
          },
        },
      ]),

      // unread messages per sender
      Message.aggregate([
        { $match: { receiverId: myId, seen: false } },
        { $group: { _id: "$senderId", count: { $sum: 1 } } },
      ]),
    ]);

    const lastMap = new Map(lastMessages.map((g) => [String(g._id), g.last]));
    const unreadMap = new Map(unread.map((g) => [String(g._id), g.count]));

    const result = users.map((user) => {
      const last = lastMap.get(String(user._id));
      return {
        ...user,
        lastMessage: last
          ? {
              text: last.text || "",
              hasImage: !!last.image,
              senderId: last.senderId,
              createdAt: last.createdAt,
            }
          : null,
        unreadCount: unreadMap.get(String(user._id)) || 0,
      };
    });

    res.status(200).json(result);
  } catch (error) {
    console.error("Error in getUsersForSidebar: ", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;

    if (!mongoose.isValidObjectId(userToChatId)) {
      return res.status(400).json({ message: "Invalid user id" });
    }

    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || DEFAULT_PAGE_SIZE, 1), 100);
    const { before } = req.query;

    if (before !== undefined && !mongoose.isValidObjectId(before)) {
      return res.status(400).json({ message: "Invalid cursor" });
    }

    const filter = {
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    };
    if (before) filter._id = { $lt: before };

    // newest first, one extra to know if there is an older page
    const docs = await Message.find(filter)
      .sort({ _id: -1 })
      .limit(limit + 1)
      .lean();

    const hasMore = docs.length > limit;
    const messages = docs.slice(0, limit).reverse();

    res.status(200).json({ messages, hasMore });
  } catch (error) {
    console.log("Error in getMessages controller: ", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body ?? {};
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    if (!mongoose.isValidObjectId(receiverId)) {
      return res.status(400).json({ message: "Invalid user id" });
    }
    if (String(receiverId) === String(senderId)) {
      return res.status(400).json({ message: "You cannot message yourself" });
    }

    const cleanText = typeof text === "string" ? text.trim() : "";

    if (!cleanText && !image) {
      return res.status(400).json({ message: "A message needs some text or an image" });
    }
    if (cleanText.length > MAX_TEXT_LENGTH) {
      return res
        .status(400)
        .json({ message: `Messages are limited to ${MAX_TEXT_LENGTH} characters` });
    }
    if (image && (typeof image !== "string" || !ALLOWED_IMAGE.test(image))) {
      return res.status(400).json({ message: "Attachment must be a PNG, JPG, WebP or GIF image" });
    }

    const receiverExists = await User.exists({ _id: receiverId });
    if (!receiverExists) {
      return res.status(404).json({ message: "User not found" });
    }

    let imageUrl;
    if (image) {
      try {
        const uploadResponse = await cloudinary.uploader.upload(image, {
          folder: "onlychat/messages",
          resource_type: "image",
          transformation: [{ width: 1600, crop: "limit", quality: "auto" }],
        });
        imageUrl = uploadResponse.secure_url;
      } catch (uploadError) {
        console.log("Cloudinary upload failed: ", uploadError.message);
        return res.status(502).json({ message: "Could not upload the image. Try again." });
      }
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      text: cleanText,
      image: imageUrl,
    });

    await newMessage.save();

    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.log("Error in sendMessage controller: ", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const markMessagesAsRead = async (req, res) => {
  try {
    const { id: senderId } = req.params;
    const myId = req.user._id;

    if (!mongoose.isValidObjectId(senderId)) {
      return res.status(400).json({ message: "Invalid user id" });
    }

    const result = await Message.updateMany(
      { senderId, receiverId: myId, seen: false },
      { $set: { seen: true, seenAt: new Date() } }
    );

    if (result.modifiedCount > 0) {
      const senderSocketId = getReceiverSocketId(senderId);
      if (senderSocketId) {
        io.to(senderSocketId).emit("messagesSeen", { by: String(myId) });
      }
    }

    res.status(200).json({ updated: result.modifiedCount });
  } catch (error) {
    console.log("Error in markMessagesAsRead: ", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};