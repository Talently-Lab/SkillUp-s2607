import { and, eq } from "drizzle-orm";
import { ConflictError, NotFoundError } from "../../shared/errors/app-error.ts";
import { isUniqueViolation } from "../../shared/errors/db-errors.ts";
import { db } from "../../db/client.ts";
import { courses } from "../../db/schema/index.ts";
import { coursesRepository } from "./courses.repository.ts";
import type {
  AdminCoursesQuery,
  CoursesQuery,
  CreateCourseInput,
  UpdateCourseInput,
} from "./courses.schemas.ts";

export const coursesService = {
  async list(query: CoursesQuery) {
    const { data, total } = await coursesRepository.findMany(query);
    const totalPages = Math.ceil(total / query.limit);
    return {
      data,
      pagination: { page: query.page, limit: query.limit, total, totalPages },
    };
  },

  async listAdmin(query: AdminCoursesQuery) {
    const { data, total } = await coursesRepository.findManyAdmin(query);
    const totalPages = Math.ceil(total / query.limit);
    return {
      data,
      pagination: { page: query.page, limit: query.limit, total, totalPages },
    };
  },

  /** Public: only returns published courses */
  async getPublishedById(id: string) {
    const course = await db.query.courses.findFirst({
      where: and(eq(courses.id, id), eq(courses.status, "published")),
    });
    if (!course) throw new NotFoundError("Course not found");
    return course;
  },

  /** Admin: returns course of any status */
  async getByIdAdmin(id: string) {
    const course = await coursesRepository.findById(id);
    if (!course) throw new NotFoundError("Course not found");
    return course;
  },

  async create(input: CreateCourseInput) {
    try {
      return await coursesRepository.create(input);
    } catch (err) {
      if (isUniqueViolation(err))
        throw new ConflictError(
          "SLUG_TAKEN",
          "A course with that slug already exists",
        );
      throw err;
    }
  },

  async update(id: string, input: UpdateCourseInput) {
    try {
      const updated = await coursesRepository.update(id, input);
      if (!updated) throw new NotFoundError("Course not found");
      return updated;
    } catch (err) {
      if (isUniqueViolation(err))
        throw new ConflictError(
          "SLUG_TAKEN",
          "A course with that slug already exists",
        );
      throw err;
    }
  },

  async remove(id: string) {
    const removed = await coursesRepository.remove(id);
    if (!removed) throw new NotFoundError("Course not found");
  },
};
