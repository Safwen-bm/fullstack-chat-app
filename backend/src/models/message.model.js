import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
    },
    image: {
      type: String,
    },
    seen: {
      type: Boolean,
      default: false,
    },
    seenAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

// conversation lookups and pagination
messageSchema.index({ senderId: 1, receiverId: 1, _id: -1 });
// unread counts
messageSchema.index({ receiverId: 1, seen: 1 });

const Message = mongoose.model("Message", messageSchema);

export default Message;