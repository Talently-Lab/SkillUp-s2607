import type { AppNotification } from "../types/notification";

function hoursAgo(hours: number): string {
  return new Date(Date.now() - hours * 3_600_000).toISOString();
}

/** Inbox by user id, until the notifications API is ready. */
export const notificationsByUser: Record<string, AppNotification[]> = {
  "u-student-01": [
    {
      id: "ntf-cert",
      type: "certificate",
      title: "Certificado disponible",
      body: "Marketing Digital Estratégico · Ya puedes descargarlo y compartirlo.",
      href: "/student?tab=certificados",
      createdAt: hoursAgo(5),
      read: false,
    },
    {
      id: "ntf-quiz",
      type: "quiz",
      title: "Quiz del Módulo 2 aprobado",
      body: "Python desde cero para automatizar tareas · Obtuviste 75%. El módulo quedó completado.",
      href: "/student",
      createdAt: hoursAgo(26),
      read: false,
    },
    {
      id: "ntf-payment",
      type: "payment",
      title: "¡Pago confirmado!",
      body: "Fundamentos de Diseño UX/UI ya está activo en tu panel.",
      href: "/student?tab=pagos",
      createdAt: "2026-09-02T09:48:00.000Z",
      read: true,
    },
  ],
};
