import { Router } from "express";
import {
  requireAuth,
  requireRole,
} from "../../shared/middlewares/authenticate.ts";
import {
  validateBody,
  validateQuery,
} from "../../shared/middlewares/validate.ts";
import { coursesAdminController } from "./courses-admin.controller.ts";
import {
  adminCoursesQuerySchema,
  createCourseSchema,
  updateCourseSchema,
} from "./courses.schemas.ts";

export const coursesAdminRouter = Router();

// All admin course routes require authentication and admin role
coursesAdminRouter.use(requireAuth, requireRole("admin"));

coursesAdminRouter.get(
  "/",
  validateQuery(adminCoursesQuerySchema),
  coursesAdminController.list,
);
coursesAdminRouter.get("/:id", coursesAdminController.getById);
coursesAdminRouter.post(
  "/",
  validateBody(createCourseSchema),
  coursesAdminController.create,
);
coursesAdminRouter.put(
  "/:id",
  validateBody(updateCourseSchema),
  coursesAdminController.update,
);
coursesAdminRouter.delete("/:id", coursesAdminController.remove);
