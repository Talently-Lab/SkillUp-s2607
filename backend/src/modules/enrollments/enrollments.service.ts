import { ConflictError, NotFoundError } from "../../shared/errors/app-error.ts";
import { coursesRepository } from "../courses/courses.repository.ts";
import { enrollmentsRepository } from "./enrollments.repository.ts";
import type { EnrollInput } from "./enrollments.schemas.ts";

export const enrollmentsService = {
  async enroll(userId: string, { courseId }: EnrollInput) {
    // Verify the course exists and is published
    const course = await coursesRepository.findById(courseId);
    if (!course || course.status !== "published") {
      throw new NotFoundError("Course not found");
    }

    // Prevent duplicate enrollment — enforced in DB too via unique index
    const existing = await enrollmentsRepository.findByUserAndCourse(
      userId,
      courseId,
    );
    if (existing) {
      throw new ConflictError(
        "ALREADY_ENROLLED",
        "You are already enrolled in this course",
      );
    }

    return enrollmentsRepository.create({ userId, courseId });
  },

  async getMyEnrollments(userId: string) {
    return enrollmentsRepository.findManyByUser(userId);
  },
};
