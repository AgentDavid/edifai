import mongoose from "mongoose";
import { env } from "./env";

export const connectDB = async (): Promise<void> => {
  try {
    const mongoURI = env.MONGODB_URI;

    await mongoose.connect(mongoURI, {
      dbName: "condominium_management",
    });

    console.log("MongoDB Connected to condominium_management");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1);
  }
};
