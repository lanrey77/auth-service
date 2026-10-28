import {
  Request,
  Response,
  NextFunction
} from "express";

import mongoose from "mongoose";
import { ZodError } from "zod";

import { AppError } from "./app-error";
import { logger } from "../../infrastructure/logger/logger";
import { env } from "../../config/env";

export function errorHandler(
  error: unknown,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (res.headersSent) {
    next(error);
    return;
  }

  let statusCode = 500;
  let message = "Internal server error";

  if (error instanceof AppError) {
    statusCode = error.statusCode;
    message = error.message;
  } else if (error instanceof ZodError) {
    statusCode = 400;
    message = "Validation failed";
  } else if (error instanceof mongoose.Error.ValidationError) {
    statusCode = 400;
    message = "Invalid data";
  } else if (error instanceof mongoose.Error.CastError) {
    statusCode = 400;
    message = "Invalid resource identifier";
  }

  logger.error(
    {
      err: error,
      method: req.method,
      path: req.path,
      statusCode
    },
    "Request failed"
  );

  res.status(statusCode).json({
    success: false,
    message,
    ...(error instanceof ZodError && env.NODE_ENV !== "production"
      ? { errors: error.flatten() }
      : {}),
    ...(env.NODE_ENV !== "production"
      ? { stack: error instanceof Error ? error.stack : undefined }
      : {})
  });
}