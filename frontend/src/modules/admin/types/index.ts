import type { CourseLevel, CourseStatus } from "@/shared/types/course";

export type FormState = {
  title: string;
  category: string;
  instructor: string;
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
  Record<"title" | "instructor" | "durationHours" | "lessons" | "price", string>
>;
