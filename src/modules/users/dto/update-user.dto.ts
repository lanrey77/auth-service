import { z } from "zod";

export const updateUserSchema = z.object({
  firstName: z.string()
    .trim()
    .min(2)
    .max(50)
    .optional(),

  lastName: z.string()
    .trim()
    .min(2)
    .max(50)
    .optional()
}).strict().refine(
  data => Object.keys(data).length > 0,
  {
    message: "At least one field must be supplied"
  }
);

export type UpdateUserDto = z.infer<
  typeof updateUserSchema
>;