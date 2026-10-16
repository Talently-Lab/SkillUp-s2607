import type { AccountType } from "../../../shared/types/account";

// Teachers are out of the MVP, so `?tipo=docente` falls back to student
export function accountTypeFromParam(param: string | null): AccountType {
  return param === "admin" ? "admin" : "student";
}
