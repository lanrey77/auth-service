import { z } from "zod";

export const registerUserSchema = z.object({
  firstName: z.string()
    .trim()
    .min(2, "First name must contain at least 2 characters")
    .max(50),

  lastName: z.string()
    .trim()
    .min(2, "Last name must contain at least 2 characters")
    .max(50),

  email: z.string()
    .trim()
    .email("Invalid email address")
    .max(254)
    .transform(value => value.toLowerCase()),

  password: z.string()
    .min(12, "Password must contain at least 12 characters")
    .max(128, "Password is too long")
    .regex(/[a-z]/, "Password must contain a lowercase letter")
    .regex(/[A-Z]/, "Password must contain an uppercase letter")
    .regex(/[0-9]/, "Password must contain a number")
});

export type RegisterUserDto = z.infer<
  typeof registerUserSchema
>;