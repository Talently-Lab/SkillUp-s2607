import {
  BadRequestError,
  ConflictError,
  NotFoundError,
} from "../../shared/errors/app-error.ts";
import {
  isForeignKeyViolation,
  isUniqueViolation,
} from "../../shared/errors/db-errors.ts";
import { coursesRepository } from "./courses.repository.ts";
import type {
  AdminCoursesQuery,
  CoursesQuery,
  CreateCourseInput,
  UpdateCourseInput,
} from "./courses.schemas.ts";

function handleWriteError(err: unknown): never {
  if (isUniqueViolation(err))
    throw new ConflictError(
      "SLUG_TAKEN",
      "A course with that slug already exists",
    );
  if (isForeignKeyViolation(err))
    throw new BadRequestError(
      "INVALID_REFERENCE",
      "categoryId or instructorId does not exist",
    );
  throw err;
}

/** Sets publishedAt when status changes to published */
type WithStatus = { status?: "draft" | "published" | undefined };

function withPublishedAt<T extends WithStatus>(
  input: T,
): Omit<T, "publishedAt"> & { publishedAt: Date | null | undefined } {
  const status = input.status;
  if (status === "published") return { ...input, publishedAt: new Date() };
  if (status === "draft") return { ...input, publishedAt: null };
  return { ...input, publishedAt: undefined };
}

export const coursesService = {
  async list(query: CoursesQuery) {
    const { data, total } = await coursesRepository.findMany(query);
    const totalPages = Math.ceil(total / query.limit);
    return {
      data,
      pagination: { page: query.page, limit: query.limit, total, totalPages },
    };
  },

  async listPublished(query: CoursesQuery) {
    const { data, total } = await coursesRepository.findManyAdmin({
      ...query,
      status: "published" as const,
    });
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
    const course = await coursesRepository.findPublishedById(id);
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
      return await coursesRepository.create(withPublishedAt(input));
    } catch (err) {
      handleWriteError(err);
    }
  },

  async update(id: string, input: UpdateCourseInput) {
    try {
      const updated = await coursesRepository.update(
        id,
        withPublishedAt(input),
      );
      if (!updated) throw new NotFoundError("Course not found");
      return updated;
    } catch (err) {
      handleWriteError(err);
    }
  },

  async remove(id: string) {
    const removed = await coursesRepository.remove(id);
    if (!removed) throw new NotFoundError("Course not found");
  },
};
