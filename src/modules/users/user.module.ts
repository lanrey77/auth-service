import { Router } from "express";

import { UserRepository } from "./repositories/user.repository";
import { UserService } from "./services/user.service";
import { UserController } from "./controllers/user.controller";
import { createUserRoutes } from "./routes/user.routes";

import { EmailVerificationRepository } from "../email-verification/repositories/email-verification.repository";
import { EmailVerificationService } from "../email-verification/services/email-verification.service";

import { SmtpEmailService } from "../../infrastructure/email/smtp-email.service";

export function createUserModule(): Router {

  const userRepository = new UserRepository();

  const verificationRepository =
    new EmailVerificationRepository();

  const emailService = new SmtpEmailService();

  const verificationService =
    new EmailVerificationService(
      userRepository,
      verificationRepository,
      emailService
    );

  const userService = new UserService(
    userRepository,
    verificationService
  );

  const userController = new UserController(
    userService
  );

  return createUserRoutes(userController);
}