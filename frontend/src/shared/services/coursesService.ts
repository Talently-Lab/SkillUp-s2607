import { request, requestAllPages, type Page } from "@/shared/api/http";
import { defaultCover } from "@/shared/constants/course";
import type { Category } from "@/shared/types/category";
import type {
  Course,
  CourseInput,
  CourseLevel,
  CourseStatus,
} from "@/shared/types/course";
import { toSlug } from "@/shared/utils/format";

type ApiLevel = "beginner" | "intermediate" | "advanced";

export type ApiCourse = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  coverUrl: string | null;
  level: ApiLevel;
  priceCents: number;
  status: CourseStatus;
  featured: boolean;
  lessonsCount: number;
  durationMinutes: number;
  studentsCount: number;
  ratingAvg: string | null;
  category: Category;
  instructor: { id: string; fullName: string } | null;
};

/** Shown while a course has no teacher assigned */
export const NO_INSTRUCTOR = "Equipo SkillUp";

const levelLabels: Record<ApiLevel, CourseLevel> = {
  beginner: "Principiante",
  intermediate: "Intermedio",
  advanced: "Avanzado",
};

export const apiLevels: Record<CourseLevel, ApiLevel> = {
  Principiante: "beginner",
  Intermedio: "intermediate",
  Avanzado: "advanced",
};

export function toCourse(course: ApiCourse): Course {
  return {
    id: course.id,
    slug: course.slug,
    title: course.title,
    description: course.description,
    categoryId: course.category.id,
    category: course.category.name,
    level: levelLabels[course.level],
    // One decimal, so 90 minutes reads as 1.5 h
    durationHours: Math.round(course.durationMinutes / 6) / 10,
    lessons: course.lessonsCount,
    price: course.priceCents > 0 ? course.priceCents / 100 : null,
    rating: course.ratingAvg === null ? 0 : Number(course.ratingAvg),
    students: course.studentsCount,
    image: course.coverUrl ?? defaultCover(course.category.slug),
    instructorId: course.instructor?.id ?? null,
    instructor: course.instructor?.fullName ?? NO_INSTRUCTOR,
    featured: course.featured,
    status: course.status,
  };
}

function toApiBody(input: CourseInput) {
  return {
    title: input.title,
    categoryId: input.categoryId,
    instructorId: input.instructorId,
    level: apiLevels[input.level],
    status: input.status,
    featured: input.featured,
    durationMinutes: Math.round(input.durationHours * 60),
    // lessonsCount is not sent, the API counts the course's lessons itself
    priceCents: input.price === null ? 0 : Math.round(input.price * 100),
    coverUrl: toCoverUrl(input.image),
  };
}

export async function listAll(path: string, auth = false): Promise<Course[]> {
  const courses = await requestAllPages<ApiCourse>(path, { auth });
  return courses.map(toCourse);
}

/** The API only takes absolute URLs, covers are paths in /public */
export const toCoverUrl = (image: string) =>
  new URL(image, window.location.origin).href;

export const coursesService = {
  list(): Promise<Course[]> {
    return listAll("/courses");
  },

  async listFeatured(limit: number): Promise<Course[]> {
    const { data } = await request<Page<ApiCourse>>(
      `/courses?featured=true&limit=${limit}`,
    );
    return data.map(toCourse);
  },

  async getBySlug(slug: string): Promise<Course> {
    const { course } = await request<{ course: ApiCourse }>(
      `/courses/slug/${encodeURIComponent(slug)}`,
    );
    return toCourse(course);
  },
};

export const adminCoursesService = {
  list(): Promise<Course[]> {
    return listAll("/admin/courses", true);
  },

  async create(input: CourseInput): Promise<Course> {
    const { course } = await request<{ course: ApiCourse }>("/admin/courses", {
      method: "POST",
      body: { ...toApiBody(input), slug: toSlug(input.title) },
      auth: true,
    });
    return toCourse(course);
  },

  async update(id: string, input: CourseInput): Promise<Course> {
    const { course } = await request<{ course: ApiCourse }>(
      `/admin/courses/${id}`,
      { method: "PUT", body: toApiBody(input), auth: true },
    );
    return toCourse(course);
  },

  async setStatus(id: string, status: CourseStatus): Promise<Course> {
    const { course } = await request<{ course: ApiCourse }>(
      `/admin/courses/${id}`,
      { method: "PUT", body: { status }, auth: true },
    );
    return toCourse(course);
  },

  async remove(id: string): Promise<void> {
    await request<void>(`/admin/courses/${id}`, {
      method: "DELETE",
      auth: true,
    });
  },
};
