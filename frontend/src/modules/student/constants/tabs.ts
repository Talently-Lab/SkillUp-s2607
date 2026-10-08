export type DashboardTab = "courses" | "certificates" | "payments";

/** `param` is the `?tab=` value, the courses tab is the default */
export const dashboardTabs: {
  value: DashboardTab;
  param: string | null;
  label: string;
}[] = [
  { value: "courses", param: null, label: "Mis cursos" },
  { value: "certificates", param: "certificados", label: "Mis certificados" },
  { value: "payments", param: "pagos", label: "Mis pagos" },
];

export function tabFromParam(value: string | null): DashboardTab {
  return dashboardTabs.find((tab) => tab.param === value)?.value ?? "courses";
}

export const tabId = (tab: DashboardTab) => `dashboard-tab-${tab}`;
export const panelId = (tab: DashboardTab) => `dashboard-panel-${tab}`;
