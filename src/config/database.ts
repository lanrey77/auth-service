import mongoose from "mongoose";
import { env } from "./env";
import { logger } from "../infrastructure/logger/logger";

export async function connectDatabase(): Promise<void> {
  try {
    await mongoose.connect(env.MONGODB_URI, {
      autoIndex: env.NODE_ENV !== "production"
    });

    logger.info("MongoDB connected successfully");
  } catch (error) {
    logger.fatal(
      { err: error },
      "MongoDB connection failed"
    );

    throw error;
  }
}