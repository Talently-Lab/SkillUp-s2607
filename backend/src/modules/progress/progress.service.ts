import { ConflictError, NotFoundError } from "../../shared/errors/app-error.ts";
import { runInTransaction } from "../../db/client.ts";
import { modulesRepository } from "../modules/modules.repository.ts";
import { enrollmentsRepository } from "../enrollments/enrollments.repository.ts";
import { progressRepository } from "./progress.repository.ts";

async function findEnrollmentForUser(userId: string, enrollmentId: string) {
  const found = await enrollmentsRepository.findByIdForUser(
    userId,
    enrollmentId,
  );
  if (!found) throw new NotFoundError("Enrollment not found");
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
    // Both statements run in the same transaction so that recalcEnrollmentProgress
    // sees the new lesson_progress row. Under READ COMMITTED, a standalone UPDATE
    // would use the pre-insert snapshot if it had to wait for a lock held by a
    // concurrent admin recalculation, producing a stale percent.
    const { completedAt, progressPercent } = await runInTransaction(
      async (tx) => {
        const inserted = await progressRepository.markComplete(
          enrollmentId,
          lessonId,
          tx,
        );
        if (inserted.length === 0)
          throw new ConflictError(
            "ALREADY_COMPLETED",
            "Lesson already completed",
          );
        const completedAt = inserted[0]!.completedAt;
        const progressPercent =
          await progressRepository.recalcEnrollmentProgress(
            enrollmentId,
            enrollment.courseId,
            tx,
          );
        return { completedAt, progressPercent };
      },
    );
    return { lessonId, completedAt, progressPercent };
  },
  async getProgress(userId: string, enrollmentId: string) {
    const enrollment = await findEnrollmentForUser(userId, enrollmentId);
    const completed = await progressRepository.findCompleted(
      enrollmentId,
      enrollment.courseId,
    );
    const total = await progressRepository.countLessons(enrollment.courseId);
    return {
      enrollmentId,
      progressPercent: enrollment.progressPercent,
      status: enrollment.status,
      total,
      completedLessons: completed,
    };
  },
};
