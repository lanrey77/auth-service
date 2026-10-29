import { createClient } from "redis";

import { env } from "../../config/env";

import { logger } from "../logger/logger";

export const redisClient = createClient({
  url: env.REDIS_URL,

  socket: {
    reconnectStrategy(retries) {

      if (retries > 10) {
        return new Error(
          "Redis connection retry limit exceeded"
        );
      }

      return Math.min(
        retries * 100,
        3000
      );
    }
  }
});

redisClient.on("error", error => {
  logger.error(
    { err: error },
    "Redis connection error"
  );
});

redisClient.on("ready", () => {
  logger.info("Redis connected successfully");
});

export async function connectRedis(): Promise<void> {

  if (!redisClient.isOpen) {
    await redisClient.connect();
  }
}