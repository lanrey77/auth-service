import app from "./app";
import { env } from "./config/env";
import { connectDatabase } from "./config/database";
import { logger } from "./infrastructure/logger/logger";

async function bootstrap(): Promise<void> {
  try {
    await connectDatabase();

    const server = app.listen(env.PORT, () => {
      logger.info(
        `Authentication service running on port ${env.PORT}`
      );
    });

    const shutdown = (signal: string): void => {
      logger.info(`${signal} received. Shutting down...`);

      server.close(async () => {
        try {
          await import("mongoose").then(
            ({ default: mongoose }) => mongoose.disconnect()
          );

          logger.info("Graceful shutdown completed");
          process.exit(0);
        } catch (error) {
          logger.error({ err: error }, "Shutdown failed");
          process.exit(1);
        }
      });
    };

    process.once("SIGTERM", () => shutdown("SIGTERM"));
    process.once("SIGINT", () => shutdown("SIGINT"));

  } catch (error) {
    logger.fatal({ err: error }, "Application startup failed");
    process.exit(1);
  }
}

void bootstrap();