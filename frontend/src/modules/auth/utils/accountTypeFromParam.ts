import type { AccountType } from "../../../shared/types/account";

export function accountTypeFromParam(param: string | null): AccountType {
  if (param === "admin") return "admin";
  if (param === "docente") return "teacher";
  return "student";
}
