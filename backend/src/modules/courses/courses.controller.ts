import type { RequestHandler } from "express";
import { coursesService } from "./courses.service.ts";
import type { CoursesQuery } from "./courses.schemas.ts";

export const COURSES_BASE_PATH = "/api/v1/courses";

export const coursesController = {
  list: (async (req, res) => {
    const result = await coursesService.listPublished(
      req.parsedQuery as CoursesQuery,
    );
    res.json(result);
  }) satisfies RequestHandler,

  getById: (async (req, res) => {
    const course = await coursesService.getPublishedById(
      req.params["id"] as string,
    );
    res.json({ course });
  }) satisfies RequestHandler,

  getBySlug: (async (req, res) => {
    const course = await coursesService.getPublishedBySlug(
      req.params["slug"] as string,
    );
    res.json({ course });
  }) satisfies RequestHandler,
};
