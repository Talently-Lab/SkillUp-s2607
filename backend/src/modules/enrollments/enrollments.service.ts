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
    const rows = await enrollmentsRepository.findManyByUser(userId);
    // Reshape the flat select into the nested { course: { ..., category, instructor } } shape
    return rows.map(
      ({
        courseSlug,
        courseTitle,
        courseCoverUrl,
        courseLevel,
        coursePriceCents,
        courseCurrency,
        courseLessonsCount,
        courseDurationMinutes,
        category,
        instructor,
        ...enrollment
      }) => ({
        ...enrollment,
        course: {
          id: enrollment.courseId,
          slug: courseSlug,
          title: courseTitle,
          coverUrl: courseCoverUrl,
          level: courseLevel,
          priceCents: coursePriceCents,
          currency: courseCurrency,
          lessonsCount: courseLessonsCount,
          durationMinutes: courseDurationMinutes,
          category,
          instructor,
        },
      }),
    );
  },
};
