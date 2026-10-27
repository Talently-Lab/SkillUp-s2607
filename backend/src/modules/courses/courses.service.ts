import {
  BadRequestError,
  ConflictError,
  NotFoundError,
} from "../../shared/errors/app-error.ts";
import {
  isForeignKeyViolation,
  isUniqueViolation,
} from "../../shared/errors/db-errors.ts";
import { runInTransaction, type DbOrTx } from "../../db/client.ts";
import { usersAdminRepository } from "../users/users-admin.repository.ts";
import { coursesRepository } from "./courses.repository.ts";
import type {
  AdminCoursesQuery,
  CoursesQuery,
  CreateCourseInput,
  UpdateCourseInput,
} from "./courses.schemas.ts";

type Status = "draft" | "published";

/** publishedAt only changes with the status: now on publish, null on unpublish */
function publishedAtFor(
  next: Status | undefined,
  current?: Status,
): Date | null | undefined {
  if (next === undefined || next === current) return undefined;
  return next === "published" ? new Date() : null;
}

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

/**
 * Only a teacher can be assigned as the instructor: other roles never see the
 * teacher panel. Locks the user until the tx ends so the role can't change
 * before the course is saved (see usersAdminService.updateRole).
 */
async function assertTeacher(
  instructorId: string | null | undefined,
  tx: DbOrTx,
) {
  if (!instructorId) return;
  if (!(await usersAdminRepository.lockIfTeacher(instructorId, tx)))
    throw new BadRequestError(
      "INVALID_INSTRUCTOR",
      "instructorId must belong to a user with the teacher role",
    );
}

export const coursesService = {
  /** Public catalog: status is always forced to published */
  async listPublished(query: CoursesQuery) {
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
    const course = await coursesRepository.findPublishedById(id);
    if (!course) throw new NotFoundError("Course not found");
    return course;
  },

  /** Public: find published course by slug */
  async getPublishedBySlug(slug: string) {
    const course = await coursesRepository.findPublishedBySlug(slug);
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
      return await runInTransaction(async (tx) => {
        await assertTeacher(input.instructorId, tx);
        return coursesRepository.create(
          { ...input, publishedAt: publishedAtFor(input.status) ?? null },
          tx,
        );
      });
    } catch (err) {
      handleWriteError(err);
    }
  },

  async update(id: string, input: UpdateCourseInput) {
    try {
      return await runInTransaction(async (tx) => {
        const current = await coursesRepository.findById(id, tx);
        if (!current) throw new NotFoundError("Course not found");
        // Only a new assignment is checked, so editing an old course keeps working
        if (input.instructorId !== current.instructorId)
          await assertTeacher(input.instructorId, tx);

        const updated = await coursesRepository.update(
          id,
          {
            ...input,
            publishedAt: publishedAtFor(input.status, current.status),
          },
          tx,
        );
        if (!updated) throw new NotFoundError("Course not found");
        return updated;
      });
    } catch (err) {
      handleWriteError(err);
    }
  },

  async remove(id: string) {
    try {
      const removed = await coursesRepository.remove(id);
      if (!removed) throw new NotFoundError("Course not found");
    } catch (err) {
      if (isForeignKeyViolation(err))
        throw new ConflictError(
          "COURSE_HAS_ENROLLMENTS",
          "Cannot delete a course that has enrolled students",
        );
      throw err;
    }
  },
};
