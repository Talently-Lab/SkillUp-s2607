export type CourseLevel = "Principiante" | "Intermedio" | "Avanzado";

export type CourseStatus = "published" | "draft";

export interface Course {
  id: string;
  /** Used in the course URL */
  slug: string;
  title: string;
  description: string | null;
  categoryId: number;
  category: string;
  level: CourseLevel;
  durationHours: number;
  lessons: number;
  /** null means the course is free */
  price: number | null;
  rating: number;
  students: number;
  image: string;
  /** null while the course has no teacher assigned */
  instructorId: string | null;
  instructor: string;
  featured: boolean;
  /** Missing means published */
  status?: CourseStatus;
}

/** What the admin form sends to create or edit a course */
export interface CourseInput {
  title: string;
  categoryId: number;
  instructorId: string | null;
  level: CourseLevel;
  status: CourseStatus;
  durationHours: number;
  lessons: number;
  price: number | null;
  image: string;
  featured: boolean;
}
