import { Router } from "express";

import { UserController } from "../controllers/user.controller";

import {
  registrationLimiter,
  verificationResendLimiter
} from "../../../common/middleware/rate-limiters";

export function createUserRoutes(
  userController: UserController
): Router {

  const router = Router();

  router.post(
    "/register",
    registrationLimiter,
    userController.register
  );

  router.get(
    "/:id",
    userController.getById
  );

  router.patch(
    "/:id",
    userController.updateProfile
  );

  router.post(
    "/verify-email",
    userController.verifyEmail
  );

  router.post(
    "/resend-verification",
    verificationResendLimiter,
    userController.resendVerification
  );

  router.post(
    "/change-password",
    // authenticate,
    userController.changePassword
  );

  return router;
}