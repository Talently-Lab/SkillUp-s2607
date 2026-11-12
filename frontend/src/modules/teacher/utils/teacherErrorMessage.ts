import { toast } from "sonner";

import { ApiError } from "@/shared/api/http";
import { useAuthStore } from "@/shared/stores/authStore";

const DEFAULT_MESSAGE = "Algo salió mal. Probá de nuevo.";
const SESSION_EXPIRED = "Tu sesión expiró. Vuelve a iniciar sesión.";

const messages: Record<string, string> = {
  COURSE_EMPTY: "Agrega al menos una lección antes de publicar el curso.",
  POSITION_TAKEN:
    "El temario cambió en otra pestaña. Lo actualizamos, probá de nuevo.",
  INVALID_ORDER:
    "El temario cambió en otra pestaña. Lo actualizamos, probá de nuevo.",
  INVALID_REFERENCE: "La categoría elegida ya no existe. Recarga la página.",
  NOT_FOUND: "Este contenido ya no existe o el curso ya no está asignado a ti.",
  VALIDATION_ERROR: "Revisá los datos y probá de nuevo.",
  TOKEN_EXPIRED: SESSION_EXPIRED,
  INVALID_TOKEN: SESSION_EXPIRED,
  UNAUTHORIZED: SESSION_EXPIRED,
  FORBIDDEN: "Tu cuenta ya no tiene acceso al panel docente.",
  NETWORK_ERROR:
    "No pudimos conectar con el servidor. Revisá tu conexión y probá de nuevo.",
  INTERNAL_ERROR: "Tuvimos un problema en el servidor. Probá más tarde.",
};

export function teacherErrorMessage(error: unknown): string {
  if (error instanceof ApiError) return messages[error.code] ?? DEFAULT_MESSAGE;
  return DEFAULT_MESSAGE;
}

/**
 * Shows the error in a toast. A 403 means the role changed while the access
 * token was still valid, so the session is renewed and the guard redirects.
 */
export function showTeacherError(error: unknown) {
  toast.error(teacherErrorMessage(error));
  if (error instanceof ApiError && error.code === "FORBIDDEN")
    void useAuthStore.getState().restoreSession();
}
