import mongoose from "mongoose";

export const connectDB = async (db: string) => {
  try {
    await mongoose.connect(db);
    console.log("✅ MongoDB connected");
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error);
    process.exit(1);
  }
};
