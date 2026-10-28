import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum([
    "development",
    "production",
    "test"
  ]).default("development"),

  PORT: z.coerce.number().int().positive().default(5000),

  MONGODB_URI: z.string().min(1),

  JWT_ACCESS_SECRET: z.string().min(64),

  JWT_ACCESS_EXPIRES_IN: z.string().default("10m"),

  REFRESH_TOKEN_EXPIRES_DAYS:
    z.coerce.number().int().positive().default(7),

  COOKIE_DOMAIN: z.string().optional(),

  COOKIE_SECURE: z.enum(["true", "false"])
    .default("false")
    .transform(value => value === "true"),

  COOKIE_SAME_SITE: z.enum([
    "strict",
    "lax",
    "none"
  ]).default("lax"),

  FRONTEND_URL: z.string().url(),


  SMTP_HOST: z.string().min(1),
  SMTP_PORT: z.coerce.number().int().positive(),
  SMTP_SECURE: z.enum(["true", "false"])
    .default("false")
    .transform(value => value === "true"),
  SMTP_USER: z.string().min(1),
  SMTP_PASSWORD: z.string().min(1),
  EMAIL_FROM: z.string().email(),

  EMAIL_VERIFICATION_URL: z.string().url(),
  EMAIL_VERIFICATION_EXPIRES_MINUTES:
    z.coerce.number().int().positive().default(30),
});

const result = envSchema.safeParse(process.env);

if (!result.success) {
  console.error(
    "Invalid environment configuration:",
    result.error.flatten().fieldErrors
  );

  process.exit(1);
}

export const env = result.data;