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
import type { ActivityChanges } from "../../db/schema/index.ts";
import { activityRepository } from "../activity/activity.repository.ts";
import { createdChanges, diffChanges } from "../activity/activity.service.ts";
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
export function publishedAtFor(
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

/** A status change is logged as publish/unpublish; anything else as an update */
export function courseAction(changes: ActivityChanges) {
  const status = changes["status"]?.to;
  if (status === "published") return "course.published";
  if (status === "draft") return "course.unpublished";
  return "course.updated";
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

  async create(input: CreateCourseInput, actorId: string) {
    try {
      return await runInTransaction(async (tx) => {
        await assertTeacher(input.instructorId, tx);
        const course = await coursesRepository.create(
          { ...input, publishedAt: publishedAtFor(input.status) ?? null },
          tx,
        );
        await activityRepository.log(
          {
            courseId: course.id,
            actorId,
            action: "course.created",
            changes: createdChanges(input),
          },
          tx,
        );
        return course;
      });
    } catch (err) {
      handleWriteError(err);
    }
  },

  async update(id: string, input: UpdateCourseInput, actorId: string) {
    try {
      return await runInTransaction(async (tx) => {
        // Serialises with the teacher's edits of the same course
        await coursesRepository.lockForUpdate(id, tx);
        const current = await coursesRepository.findById(id, tx);
        if (!current) throw new NotFoundError("Course not found");
        // Only a new assignment is checked, so editing an old course keeps working
        if (input.instructorId !== current.instructorId)
          await assertTeacher(input.instructorId, tx);

        const changes = diffChanges(current, input);
        if (Object.keys(changes).length === 0) return current;

        const updated = (await coursesRepository.update(
          id,
          {
            ...input,
            publishedAt: publishedAtFor(input.status, current.status),
          },
          tx,
        ))!;
        await activityRepository.log(
          { courseId: id, actorId, action: courseAction(changes), changes },
          tx,
        );
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
