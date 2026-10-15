import type { RequestHandler } from "express";
import { coursesService } from "./courses.service.ts";
import type { CoursesQuery } from "./courses.schemas.ts";

export const COURSES_BASE_PATH = "/api/v1/courses";

export const coursesController = {
  list: (async (req, res) => {
    // req.parsedQuery is set by validateQuery with the coerced CoursesQuery
    const result = await coursesService.list(req.parsedQuery as CoursesQuery);
    res.json(result);
  }) satisfies RequestHandler,

  getById: (async (req, res) => {
    const course = await coursesService.getById(req.params["id"] as string);
    res.json({ course });
  }) satisfies RequestHandler,
};
