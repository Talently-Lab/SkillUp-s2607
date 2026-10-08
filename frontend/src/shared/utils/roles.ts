import type { AccountType } from "../types/account";

/** Where each role lands after signing in. The teacher panel is out of the MVP. */
export const roleHome: Record<AccountType, string> = {
  student: "/student",
  teacher: "/",
  admin: "/admin",
};

export const rolePanelLabel: Partial<Record<AccountType, string>> = {
  student: "Mi panel",
  admin: "Administración",
};

const roleParam: Record<AccountType, string> = {
  student: "alumno",
  teacher: "docente",
  admin: "admin",
};

export function roleFromParam(value: string | null): AccountType {
  const match = Object.entries(roleParam).find(([, param]) => param === value);
  return (match?.[0] as AccountType | undefined) ?? "student";
}

export function loginPath(role: AccountType, redirect?: string): string {
  const params = new URLSearchParams();
  if (role !== "student") params.set("tipo", roleParam[role]);
  if (redirect) params.set("redirect", redirect);

  const query = params.toString();
  return query ? `/login?${query}` : "/login";
}
