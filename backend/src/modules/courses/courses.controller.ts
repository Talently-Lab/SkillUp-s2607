import type { RequestHandler } from "express";
import { z } from "zod";
import { ValidationError } from "../../shared/errors/app-error.ts";
import { coursesService } from "./courses.service.ts";
import type { CoursesQuery } from "./courses.schemas.ts";

export const COURSES_BASE_PATH = "/api/v1/courses";

export const coursesController = {
  list: (async (req, res) => {
    const query = req.parsedQuery as CoursesQuery;
    // Public catalog always shows only published courses regardless of query param
    const result = await coursesService.list({ ...query, status: "published" });
    res.json(result);
  }) satisfies RequestHandler,

  getById: (async (req, res) => {
    const id = req.params["id"] as string;

    // Validate UUID format before hitting the DB to avoid a misleading 500
    const parsed = z.uuid().safeParse(id);
    if (!parsed.success) {
      throw new ValidationError({ id: ["Must be a valid UUID"] });
    }

    const course = await coursesService.getPublishedById(id);
    res.json({ course });
  }) satisfies RequestHandler,
};
