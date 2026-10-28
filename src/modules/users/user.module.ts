import { Router } from "express";

import { UserRepository } from "./repositories/user.repository";

import { UserService } from "./services/user.service";

import { UserController } from "./controllers/user.controller";

import { createUserRoutes } from "./routes/user.routes";

export function createUserModule(): Router {

  // 1. Repository
  const userRepository = new UserRepository();

  // 2. Service
  const userService = new UserService(
    userRepository
  );

  // 3. Controller
  const userController = new UserController(
    userService
  );

  // 4. Routes
  return createUserRoutes(userController);
}