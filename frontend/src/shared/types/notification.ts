export type NotificationType = "payment" | "quiz" | "certificate" | "welcome";

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  href?: string;
  createdAt: string;
  read: boolean;
}
