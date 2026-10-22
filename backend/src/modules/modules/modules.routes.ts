import { Router } from "express";
import { optionalAuth } from "../../shared/middlewares/authenticate.ts";
import { validateParams } from "../../shared/middlewares/validate.ts";
import { modulesController } from "./modules.controller.ts";
import { courseParamsSchema } from "./modules.schemas.ts";

// Public: list modules (with lessons) for a published course
export const modulesRouter = Router({ mergeParams: true });
modulesRouter.get(
  "/",
  optionalAuth,
  validateParams(courseParamsSchema),
  modulesController.list,
);
