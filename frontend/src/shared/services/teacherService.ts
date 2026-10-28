import { request, requestAllPages } from "@/shared/api/http";
import {
  apiLevels,
  listAll,
  toCourse,
  toCoverUrl,
  type ApiCourse,
} from "@/shared/services/coursesService";
import type { Course, CourseLevel, CourseStatus } from "@/shared/types/course";
import type { EnrollmentStatus } from "@/shared/types/enrollment";
import type {
  TeacherEnrollment,
  TeacherLesson,
  TeacherModule,
} from "@/shared/types/teacher";

type ApiLesson = {
  id: string;
  moduleId: string;
  title: string;
  position: number;
  videoUrl: string | null;
  durationSeconds: number | null;
};

type ApiModule = {
  id: string;
  courseId: string;
  title: string;
  position: number;
  lessons?: ApiLesson[];
};

type ApiTeacherEnrollment = {
  id: string;
  status: EnrollmentStatus;
  progressPercent: number;
  enrolledAt: string;
  completedAt: string | null;
  lastActivityAt: string | null;
  student: { id: string; fullName: string; email: string };
};

/** The course data the teacher can change; price and the rest stay admin-only */
export type TeacherCourseInput = {
  title: string;
  description: string | null;
  image: string;
  categoryId: number;
  level: CourseLevel;
  status: CourseStatus;
};

export type LessonInput = {
  title: string;
  videoUrl: string | null;
  durationSeconds: number | null;
};

function toLesson({
  id,
  title,
  position,
  videoUrl,
  durationSeconds,
}: ApiLesson): TeacherLesson {
  return { id, title, position, videoUrl, durationSeconds };
}

function toModule({
  id,
  title,
  position,
  lessons = [],
}: ApiModule): TeacherModule {
  return { id, title, position, lessons: lessons.map(toLesson) };
}

function toEnrollment({
  student,
  ...enrollment
}: ApiTeacherEnrollment): TeacherEnrollment {
  return {
    ...enrollment,
    student: { id: student.id, name: student.fullName, email: student.email },
  };
}

function toApiCourseBody({
  image,
  level,
  ...input
}: Partial<TeacherCourseInput>) {
  return {
    ...input,
    ...(level && { level: apiLevels[level] }),
    ...(image && { coverUrl: toCoverUrl(image) }),
  };
}

export const teacherService = {
  listCourses(): Promise<Course[]> {
    return listAll("/teacher/courses", true);
  },

  /** Only the fields that changed, the API answers 400 to an empty body */
  async updateCourse(
    id: string,
    input: Partial<TeacherCourseInput>,
  ): Promise<Course> {
    const { course } = await request<{ course: ApiCourse }>(
      `/teacher/courses/${id}`,
      { method: "PATCH", body: toApiCourseBody(input), auth: true },
    );
    return toCourse(course);
  },

  async listEnrollments(courseId: string): Promise<TeacherEnrollment[]> {
    const enrollments = await requestAllPages<ApiTeacherEnrollment>(
      `/teacher/courses/${courseId}/enrollments`,
      { auth: true },
    );
    return enrollments.map(toEnrollment);
  },

  async listModules(courseId: string): Promise<TeacherModule[]> {
    const { modules } = await request<{ modules: ApiModule[] }>(
      `/teacher/courses/${courseId}/modules`,
      { auth: true },
    );
    return modules.map(toModule);
  },

  async createModule(
    courseId: string,
    input: { title: string; position: number },
  ): Promise<TeacherModule> {
    const { module } = await request<{ module: ApiModule }>(
      `/teacher/courses/${courseId}/modules`,
      { method: "POST", body: input, auth: true },
    );
    return toModule(module);
  },

  async renameModule(id: string, title: string): Promise<void> {
    await request(`/teacher/modules/${id}`, {
      method: "PATCH",
      body: { title },
      auth: true,
    });
  },

  async deleteModule(id: string): Promise<void> {
    await request<void>(`/teacher/modules/${id}`, {
      method: "DELETE",
      auth: true,
    });
  },

  /** `ids` must hold every module of the course, in the new order */
  async reorderModules(courseId: string, ids: string[]): Promise<void> {
    await request(`/teacher/courses/${courseId}/modules/order`, {
      method: "PUT",
      body: { ids },
      auth: true,
    });
  },

  async createLesson(
    moduleId: string,
    input: LessonInput & { position: number },
  ): Promise<TeacherLesson> {
    const { lesson } = await request<{ lesson: ApiLesson }>(
      `/teacher/modules/${moduleId}/lessons`,
      { method: "POST", body: input, auth: true },
    );
    return toLesson(lesson);
  },

  async updateLesson(
    id: string,
    input: Partial<LessonInput>,
  ): Promise<TeacherLesson> {
    const { lesson } = await request<{ lesson: ApiLesson }>(
      `/teacher/lessons/${id}`,
      { method: "PATCH", body: input, auth: true },
    );
    return toLesson(lesson);
  },

  async deleteLesson(id: string): Promise<void> {
    await request<void>(`/teacher/lessons/${id}`, {
      method: "DELETE",
      auth: true,
    });
  },

  /** `ids` must hold every lesson of the module, in the new order */
  async reorderLessons(moduleId: string, ids: string[]): Promise<void> {
    await request(`/teacher/modules/${moduleId}/lessons/order`, {
      method: "PUT",
      body: { ids },
      auth: true,
    });
  },
};
