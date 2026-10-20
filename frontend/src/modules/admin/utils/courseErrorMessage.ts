import { ApiError } from "@/shared/api/http";

const DEFAULT_MESSAGE = "Algo salió mal. Inténtalo de nuevo.";
const SESSION_EXPIRED = "Tu sesión expiró. Vuelve a iniciar sesión.";

// Decided by the error code, never by the API message
const messages: Record<string, string> = {
  SLUG_TAKEN: "Ya existe un curso con este título o uno muy parecido.",
  COURSE_HAS_ENROLLMENTS:
    "No se puede eliminar porque tiene estudiantes inscritos. Pásalo a borrador para quitarlo del catálogo.",
  INVALID_REFERENCE:
    "La categoría o el docente elegido ya no existe. Recarga la página.",
  NOT_FOUND: "Este curso ya no existe. Recarga la página.",
  VALIDATION_ERROR: "Revisa los datos del formulario.",
  TOKEN_EXPIRED: SESSION_EXPIRED,
  INVALID_TOKEN: SESSION_EXPIRED,
  UNAUTHORIZED: SESSION_EXPIRED,
  FORBIDDEN: "Tu cuenta no tiene permisos para gestionar cursos.",
  NETWORK_ERROR:
    "No pudimos conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.",
  INTERNAL_ERROR: "Tuvimos un problema en el servidor. Inténtalo más tarde.",
};

export function courseErrorMessage(error: unknown): string {
  if (error instanceof ApiError) return messages[error.code] ?? DEFAULT_MESSAGE;
  return DEFAULT_MESSAGE;
}
