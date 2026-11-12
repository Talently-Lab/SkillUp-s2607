import { ApiError } from "@/shared/api/http";
import { AccountTypeMismatchError } from "@/shared/stores/authStore";

const DEFAULT_MESSAGE = "Algo salió mal. Probá de nuevo.";

// Decided by the error code, never by the API message
const messages: Record<string, string> = {
  INVALID_CREDENTIALS: "El email o la contraseña no son correctos.",
  ACCOUNT_SUSPENDED:
    "Tu cuenta está suspendida. Escribinos a soporte para reactivarla.",
  EMAIL_TAKEN: "Ya existe una cuenta con ese email. Iniciá sesión.",
  TOO_MANY_REQUESTS:
    "Hiciste demasiados intentos. Esperá unos minutos y probá de nuevo.",
  VALIDATION_ERROR: "Revisá los datos del formulario.",
  NETWORK_ERROR:
    "No pudimos conectar con el servidor. Revisá tu conexión y probá de nuevo.",
  INTERNAL_ERROR: "Tuvimos un problema en el servidor. Probá más tarde.",
};

export function authErrorMessage(error: unknown): string {
  if (error instanceof AccountTypeMismatchError)
    return error.allowed.includes("admin")
      ? "Esta cuenta no tiene acceso de administrador. Si sos alumno o docente, entrá desde el acceso general."
      : "Esta cuenta es de administración y entra por su propio acceso.";

  if (error instanceof ApiError) return messages[error.code] ?? DEFAULT_MESSAGE;

  return DEFAULT_MESSAGE;
}
