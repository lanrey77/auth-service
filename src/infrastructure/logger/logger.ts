import pino from "pino";
import { env } from "../../config/env";

export const logger = pino({
  level: env.NODE_ENV === "production"
    ? "info"
    : "debug",

  redact: {
    paths: [
      "req.headers.authorization",
      "req.headers.cookie",
      "req.body.password",
      "req.body.refreshToken",
      "res.headers.set-cookie"
    ],
    censor: "[REDACTED]"
  },

  transport:
    env.NODE_ENV === "development"
      ? {
          target: "pino-pretty",
          options: {
            colorize: true
          }
        }
      : undefined
});