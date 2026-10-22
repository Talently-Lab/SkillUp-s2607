import { ApiError } from "@/shared/api/http";

const DEFAULT_MESSAGE = "No pudimos inscribirte. Inténtalo de nuevo.";
const SESSION_EXPIRED = "Tu sesión expiró. Vuelve a iniciar sesión.";

// Decided by the error code, never by the API message
const messages: Record<string, string> = {
  COURSE_NOT_FREE: "Este curso es pago, todavía no se puede inscribir.",
  NOT_FOUND: "Este curso ya no está disponible.",
  FORBIDDEN: "Solo las cuentas de alumno pueden inscribirse.",
  TOKEN_EXPIRED: SESSION_EXPIRED,
  INVALID_TOKEN: SESSION_EXPIRED,
  UNAUTHORIZED: SESSION_EXPIRED,
  NETWORK_ERROR:
    "No pudimos conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.",
  INTERNAL_ERROR: "Tuvimos un problema en el servidor. Inténtalo más tarde.",
};

export function enrollErrorMessage(error: unknown): string {
  if (error instanceof ApiError) return messages[error.code] ?? DEFAULT_MESSAGE;
  return DEFAULT_MESSAGE;
}
