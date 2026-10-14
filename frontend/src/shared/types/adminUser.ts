import type { AccountType } from "./account";

export type UserStatus = "active" | "suspended";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: AccountType;
  status: UserStatus;
  joinedAt: string;
  lastActiveAt: string;
  /** Enrollments for students (teachers' courses are counted from the catalog) */
  enrolledCourses: number;
}
