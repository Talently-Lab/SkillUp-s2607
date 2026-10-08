import type { AuthUser } from "../types/auth";

type MockUser = AuthUser & { password: string };

/** Demo accounts until the auth API is ready. */
export const mockUsers: MockUser[] = [
  {
    id: "u-student-01",
    name: "Valentina Ruiz",
    email: "valentina.ruiz@gmail.com",
    role: "student",
    password: "skillup123",
  },
  {
    id: "u-teacher-01",
    name: "Lucía Fernández",
    email: "lucia.fernandez@skillup.edu",
    role: "teacher",
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

export const mockGoogleUserId = "u-student-01";
