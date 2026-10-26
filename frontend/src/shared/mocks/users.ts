import type { AuthUser } from "@/shared/types/auth";

type MockUser = AuthUser & { password: string };

/**
 * Demo accounts shown in the login only to try the UI. They don't exist in the
 * API: sign up as a student, or use the admin from `pnpm db:seed:admin`.
 * Teachers have none: create one with `pnpm db:seed:teacher`.
 * TODO: remove them once the courses endpoints work.
 */
export const mockUsers: MockUser[] = [
  {
    id: "u-student-01",
    name: "Valentina Ruiz",
    email: "valentina.ruiz@gmail.com",
    role: "student",
    password: "skillup123",
  },
  {
    id: "u-admin-01",
    name: "Ricardo Suárez",
    email: "ricardo.suarez@skillup.edu",
    role: "admin",
    password: "skillup123",
  },
];
