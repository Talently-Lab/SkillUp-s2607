import { ApiError } from "@/shared/api/http";
import { AccountTypeMismatchError } from "@/shared/stores/authStore";
import type { AccountType } from "@/shared/types/account";

const accountTypeName: Record<AccountType, string> = {
  student: "alumno",
  teacher: "docente",
  admin: "administrador",
};

const DEFAULT_MESSAGE = "Algo salió mal. Inténtalo de nuevo.";

// Decided by the error code, never by the API message
const messages: Record<string, string> = {
  INVALID_CREDENTIALS: "El email o la contraseña no son correctos.",
  ACCOUNT_SUSPENDED:
    "Tu cuenta está suspendida. Escríbenos a soporte para reactivarla.",
  EMAIL_TAKEN: "Ya existe una cuenta con ese email. Inicia sesión.",
  TOO_MANY_REQUESTS:
    "Hiciste demasiados intentos. Espera unos minutos y vuelve a intentarlo.",
  VALIDATION_ERROR: "Revisa los datos del formulario.",
  NETWORK_ERROR:
    "No pudimos conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.",
  INTERNAL_ERROR: "Tuvimos un problema en el servidor. Inténtalo más tarde.",
};

export function authErrorMessage(error: unknown): string {
  if (error instanceof AccountTypeMismatchError)
    return `Esta cuenta no es de ${accountTypeName[error.role]}. Cambia el tipo de cuenta para entrar.`;

  if (error instanceof ApiError) return messages[error.code] ?? DEFAULT_MESSAGE;

  return DEFAULT_MESSAGE;
}
