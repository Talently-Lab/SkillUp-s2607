import { Router } from "express";
import {
  requireAuth,
  requireRole,
} from "../../shared/middlewares/authenticate.ts";
import { statsController } from "./stats.controller.ts";

export const statsRouter = Router();
statsRouter.get(
  "/",
  requireAuth,
  requireRole("admin"),
  statsController.getPlatformStats,
);
