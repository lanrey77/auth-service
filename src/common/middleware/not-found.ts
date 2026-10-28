import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/app-error";

export function notFound(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  next(
    new AppError(
      `Route ${req.method} ${req.originalUrl} not found`,
      404
    )
  );
}