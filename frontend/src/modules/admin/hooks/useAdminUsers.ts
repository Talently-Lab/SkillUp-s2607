import { useState } from "react";

import { useAuthStore } from "@/shared/stores/authStore";
import { adminUsers } from "@/shared/mocks/adminUsers";
import { courses } from "@/shared/mocks/courses";
import type { AccountType } from "@/shared/types/account";
import type { AdminUser, UserStatus } from "@/shared/types/adminUser";
import { normalizeText } from "@/shared/utils/format";

export type RoleFilter = "all" | AccountType;
export type UserStatusFilter = "all" | UserStatus;

export type UserRow = AdminUser & {
  /** Assigned courses for teachers, enrollments for students */
  courseCount: number;
};

function courseCount(user: AdminUser): number {
  if (user.role === "teacher")
    return courses.filter((course) => course.instructor === user.name).length;
  return user.role === "student" ? user.enrolledCourses : 0;
}

export function useAdminUsers() {
  const session = useAuthStore((state) => state.user);
  const [users, setUsers] = useState<AdminUser[]>(adminUsers);
  const [query, setQuery] = useState("");
  const [role, setRole] = useState<RoleFilter>("all");
  const [status, setStatus] = useState<UserStatusFilter>("all");

  // The signed-in admin can't change their own role or suspend themselves
  const selfId =
    users.find(
      (user) => user.email.toLowerCase() === session?.email.toLowerCase(),
    )?.id ?? null;

  const roleCounts: Record<RoleFilter, number> = {
    all: users.length,
    student: users.filter((user) => user.role === "student").length,
    teacher: users.filter((user) => user.role === "teacher").length,
    admin: users.filter((user) => user.role === "admin").length,
  };

  const search = normalizeText(query.trim());
  const rows: UserRow[] = users
    .filter((user) => {
      if (
        search &&
        !normalizeText(`${user.name} ${user.email}`).includes(search)
      )
        return false;
      if (role !== "all" && user.role !== role) return false;
      if (status !== "all" && user.status !== status) return false;
      return true;
    })
    .sort((a, b) => b.lastActiveAt.localeCompare(a.lastActiveAt))
    .map((user) => ({ ...user, courseCount: courseCount(user) }));

  const resetFilters = () => {
    setQuery("");
    setRole("all");
    setStatus("all");
  };

  const changeRole = (id: string, newRole: AccountType) =>
    setUsers((prev) =>
      prev.map((user) => (user.id === id ? { ...user, role: newRole } : user)),
    );

  const changeStatus = (id: string, newStatus: UserStatus) =>
    setUsers((prev) =>
      prev.map((user) =>
        user.id === id ? { ...user, status: newStatus } : user,
      ),
    );

  return {
    users,
    rows,
    roleCounts,
    selfId,
    query,
    setQuery,
    role,
    setRole,
    status,
    setStatus,
    resetFilters,
    changeRole,
    changeStatus,
  };
}
