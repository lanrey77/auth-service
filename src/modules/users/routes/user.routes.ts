import { Router } from "express";

import { UserController } from "../controllers/user.controller";

export function createUserRoutes(
  userController: UserController
): Router {

  const router = Router();

  router.post(
    "/register",
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

  return router;
}