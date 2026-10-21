import { eq } from "drizzle-orm";
import { db } from "../../db/client.ts";
import { enrollments } from "../../db/schema/index.ts";
import { ConflictError, NotFoundError } from "../../shared/errors/app-error.ts";
import { modulesRepository } from "../modules/modules.repository.ts";
import { progressRepository } from "./progress.repository.ts";

async function findEnrollmentForUser(userId: string, enrollmentId: string) {
  const found = await db.query.enrollments.findFirst({
    where: eq(enrollments.id, enrollmentId),
  });
  if (!found) throw new NotFoundError("Enrollment not found");
  // Object-level auth: never trust a client-supplied id; scope by user
  if (found.userId !== userId) throw new NotFoundError("Enrollment not found");
  return found;
}

export const progressService = {
  async completeLesson(userId: string, enrollmentId: string, lessonId: string) {
    const enrollment = await findEnrollmentForUser(userId, enrollmentId);
    // The lesson must belong to the course of this enrollment
    const lesson = await modulesRepository.findLessonById(lessonId);
    if (!lesson) throw new NotFoundError("Lesson not found");
    const courseModule = await modulesRepository.findModuleInCourse(
      enrollment.courseId,
      lesson.moduleId,
    );
    if (!courseModule) throw new NotFoundError("Lesson not found");
    // Atomic: insert ... on conflict do nothing ... returning. No row => already completed.
    const inserted = await progressRepository.markComplete(
      enrollmentId,
      lessonId,
    );
    if (inserted.length === 0)
      throw new ConflictError("ALREADY_COMPLETED", "Lesson already completed");
    const completedAt = inserted[0]!.completedAt;
    const { total, completed } = await progressRepository.getProgress(
      enrollmentId,
      enrollment.courseId,
    );
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    await progressRepository.updateProgressPercent(enrollmentId, percent);
    return { lessonId, completedAt, progressPercent: percent };
  },
  async getProgress(userId: string, enrollmentId: string) {
    const enrollment = await findEnrollmentForUser(userId, enrollmentId);
    const completed = await progressRepository.findCompleted(
      enrollmentId,
      enrollment.courseId,
    );
    const { total } = await progressRepository.getProgress(
      enrollmentId,
      enrollment.courseId,
    );
    return {
      enrollmentId,
      progressPercent: enrollment.progressPercent,
      status: enrollment.status,
      total,
      completedLessons: completed,
    };
  },
};
