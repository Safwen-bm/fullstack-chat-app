import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    // exit so the host restarts the service instead of leaving a broken server up
    console.error("MongoDB connection error:", error.message);
    process.exit(1);
  }
};