import { z } from "zod";

export const changePasswordSchema = z.object({

  currentPassword: z.string()
    .min(1, "Current password is required"),

  newPassword: z.string()
    .min(12, "Password must contain at least 12 characters")
    .max(128)
    .regex(/[a-z]/, "Must contain a lowercase letter")
    .regex(/[A-Z]/, "Must contain an uppercase letter")
    .regex(/[0-9]/, "Must contain a number")
    .regex(/[^a-zA-Z0-9]/, "Must contain a special character")

}).strict();

export type ChangePasswordDto = z.infer<
  typeof changePasswordSchema
>;