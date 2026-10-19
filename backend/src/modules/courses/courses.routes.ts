import { z } from "zod";
import { Router } from "express";
import {
  validateParams,
  validateQuery,
} from "../../shared/middlewares/validate.ts";
import { coursesController } from "./courses.controller.ts";
import { coursesQuerySchema } from "./courses.schemas.ts";

export const coursesRouter = Router();

const uuidParams = validateParams(z.object({ id: z.uuid() }));

coursesRouter.get(
  "/",
  validateQuery(coursesQuerySchema),
  coursesController.list,
);
// slug route before :id to avoid capturing "slug" as a UUID
coursesRouter.get("/slug/:slug", coursesController.getBySlug);
coursesRouter.get("/:id", uuidParams, coursesController.getById);
