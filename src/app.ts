import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import compression from "compression";

import { env } from "./config/env";
import { errorHandler } from "./common/errors/error-handler";
import { notFound } from "./common/middleware/not-found";

import { createUserModule } from "./modules/users/user.module";

const app = express();

app.disable("x-powered-by");

app.use(helmet());

app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true,
    methods: [
      "GET",
      "POST",
      "PUT",
      "PATCH",
      "DELETE",
      "OPTIONS"
    ],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-CSRF-Token"
    ]
  })
);

app.use(express.json({ limit: "10kb" }));

app.use(express.urlencoded({
  extended: true,
  limit: "10kb"
}));

app.use(cookieParser());

app.use(compression());

app.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Authentication service is running"
  });
});

// Feature routes will be registered here.
app.use(
  "/api/v1/users",
  createUserModule()
);

app.use(notFound);

app.use(errorHandler);

export default app;