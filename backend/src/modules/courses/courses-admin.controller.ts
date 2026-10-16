import type { RequestHandler } from "express";
import { z } from "zod";
import { ValidationError } from "../../shared/errors/app-error.ts";
import { coursesService } from "./courses.service.ts";
import type {
  AdminCoursesQuery,
  CreateCourseInput,
  UpdateCourseInput,
} from "./courses.schemas.ts";

export const COURSES_ADMIN_BASE_PATH = "/api/v1/admin/courses";

function validateUuid(id: string) {
  if (!z.uuid().safeParse(id).success) {
    throw new ValidationError({ id: ["Must be a valid UUID"] });
  }
}

export const coursesAdminController = {
  list: (async (req, res) => {
    const result = await coursesService.listAdmin(
      req.parsedQuery as AdminCoursesQuery,
    );
    res.json(result);
  }) satisfies RequestHandler,

  getById: (async (req, res) => {
    const id = req.params["id"] as string;
    validateUuid(id);
    const course = await coursesService.getByIdAdmin(id);
    res.json({ course });
  }) satisfies RequestHandler,

  create: (async (req, res) => {
    const course = await coursesService.create(req.body as CreateCourseInput);
    res.status(201).json({ course });
  }) satisfies RequestHandler,

  update: (async (req, res) => {
    const id = req.params["id"] as string;
    validateUuid(id);
    const course = await coursesService.update(
      id,
      req.body as UpdateCourseInput,
    );
    res.json({ course });
  }) satisfies RequestHandler,

  remove: (async (req, res) => {
    const id = req.params["id"] as string;
    validateUuid(id);
    await coursesService.remove(id);
    res.status(204).end();
  }) satisfies RequestHandler,
};
