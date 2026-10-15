import { Router } from "express";
import { validateQuery } from "../../shared/middlewares/validate.ts";
import { coursesController } from "./courses.controller.ts";
import { coursesQuerySchema } from "./courses.schemas.ts";

export const coursesRouter = Router();

coursesRouter.get("/", validateQuery(coursesQuerySchema), coursesController.list);
coursesRouter.get("/:id", coursesController.getById);
