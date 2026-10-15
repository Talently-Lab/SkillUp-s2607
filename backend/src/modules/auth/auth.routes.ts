import { Router } from "express";
import { requireAuth } from "../../shared/middlewares/authenticate.ts";
import {
  authLimiter,
  loginAccountLimiter,
  loginIpLimiter,
  registerLimiter,
} from "../../shared/middlewares/rate-limit.ts";
import { validateBody } from "../../shared/middlewares/validate.ts";
import { authController } from "./auth.controller.ts";
import { loginSchema, registerSchema } from "./auth.schemas.ts";

export const authRouter = Router();

authRouter.use(authLimiter);

authRouter.post(
  "/register",
  registerLimiter,
  validateBody(registerSchema),
  authController.register,
);
authRouter.post(
  "/login",
  loginIpLimiter,
  loginAccountLimiter,
  validateBody(loginSchema),
  authController.login,
);
authRouter.post("/refresh", authController.refresh);
authRouter.post("/logout", authController.logout);
authRouter.get("/me", requireAuth, authController.me);
