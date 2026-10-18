import type { RequestHandler } from "express";
import { coursesService } from "./courses.service.ts";
import type {
  AdminCoursesQuery,
  CreateCourseInput,
  UpdateCourseInput,
} from "./courses.schemas.ts";

export const COURSES_ADMIN_BASE_PATH = "/api/v1/admin/courses";

export const coursesAdminController = {
  list: (async (req, res) => {
    const result = await coursesService.listAdmin(
      req.parsedQuery as AdminCoursesQuery,
    );
    res.json(result);
  }) satisfies RequestHandler,

  getById: (async (req, res) => {
    const course = await coursesService.getByIdAdmin(
      req.params["id"] as string,
    );
    res.json({ course });
  }) satisfies RequestHandler,

  create: (async (req, res) => {
    const course = await coursesService.create(req.body as CreateCourseInput);
    res.status(201).json({ course });
  }) satisfies RequestHandler,

  update: (async (req, res) => {
    const course = await coursesService.update(
      req.params["id"] as string,
      req.body as UpdateCourseInput,
    );
    res.json({ course });
  }) satisfies RequestHandler,

  remove: (async (req, res) => {
    await coursesService.remove(req.params["id"] as string);
    res.status(204).end();
  }) satisfies RequestHandler,
};
