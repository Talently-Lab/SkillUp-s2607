import type { DashboardNavItem } from "@/layouts/DashboardLayout";
import BookOpenIcon from "@/assets/icons/book-open.svg";
import LayoutDashboardIcon from "@/assets/icons/layout-dashboard.svg";

export const adminNav: DashboardNavItem[] = [
  { to: "/admin", label: "Panel de control", icon: LayoutDashboardIcon },
  { to: "/admin/courses", label: "Cursos", icon: BookOpenIcon },
];
