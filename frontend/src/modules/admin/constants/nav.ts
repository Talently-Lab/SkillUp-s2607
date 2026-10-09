import type { DashboardNavItem } from "@/layouts/DashboardLayout";
import LayoutDashboardIcon from "@/assets/icons/layout-dashboard.svg";

export const adminNav: DashboardNavItem[] = [
  { to: "/admin", label: "Panel de control", icon: LayoutDashboardIcon },
];
