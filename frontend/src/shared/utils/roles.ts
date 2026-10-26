import type { AccountType } from "@/shared/types/account";

export const roleName: Record<AccountType, string> = {
  student: "Alumno",
  teacher: "Docente",
  admin: "Admin",
};

/** Where each role lands after signing in */
export const roleHome: Record<AccountType, string> = {
  student: "/student",
  teacher: "/teacher",
  admin: "/admin",
};

export const rolePanelLabel: Partial<Record<AccountType, string>> = {
  student: "Mi panel",
  teacher: "Panel docente",
  admin: "Administración",
};

const roleParam: Record<AccountType, string> = {
  student: "alumno",
  teacher: "docente",
  admin: "admin",
};

export function loginPath(role: AccountType, redirect?: string): string {
  const params = new URLSearchParams();
  if (role !== "student") params.set("tipo", roleParam[role]);
  if (redirect) params.set("redirect", redirect);

  const query = params.toString();
  return query ? `/login?${query}` : "/login";
}
