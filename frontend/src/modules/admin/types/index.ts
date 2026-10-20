import type { CourseLevel, CourseStatus } from "@/shared/types/course";

export type FormState = {
  title: string;
  categoryId: string;
  /** Empty when the course has no teacher */
  instructorId: string;
  level: CourseLevel;
  status: CourseStatus;
  durationHours: string;
  lessons: string;
  price: string;
  isFree: boolean;
  image: string;
  featured: boolean;
};

export type FormErrors = Partial<
  Record<"title" | "categoryId" | "durationHours" | "lessons" | "price", string>
>;
