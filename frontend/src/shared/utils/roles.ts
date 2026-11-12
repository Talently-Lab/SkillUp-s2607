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

/** One access for students and teachers; admins have their own route (design doc §6) */
export const GENERAL_ROLES: AccountType[] = ["student", "teacher"];
export const ADMIN_LOGIN_PATH = "/admin/login";

export function loginPath(role: AccountType, redirect?: string): string {
  const base = role === "admin" ? ADMIN_LOGIN_PATH : "/login";
  return redirect ? `${base}?redirect=${encodeURIComponent(redirect)}` : base;
}
