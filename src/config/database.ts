import mongoose from "mongoose";

import { env } from "./env";

import { logger } from "../infrastructure/logger/logger";

export async function connectDatabase(): Promise<void> {

  try {
    // await mongoose.connect(env.MONGODB_URI, {
    //   autoIndex: env.NODE_ENV !== "production"
    // });

    await mongoose.connect(env.MONGODB_URI, {

      autoIndex: false,

      autoCreate: false,

      serverSelectionTimeoutMS: 5000,

      maxPoolSize: 20,

      minPoolSize: 2

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