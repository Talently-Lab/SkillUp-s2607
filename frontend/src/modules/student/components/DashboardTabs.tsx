import type { KeyboardEvent } from "react";

import {
  dashboardTabs,
  panelId,
  tabId,
  type DashboardTab,
} from "../constants/tabs";
import "./DashboardTabs.css";

type DashboardTabsProps = {
  value: DashboardTab;
  counts: Partial<Record<DashboardTab, number>>;
  onChange: (tab: DashboardTab) => void;
};

export function DashboardTabs({ value, counts, onChange }: DashboardTabsProps) {
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const step =
      event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
    if (!step) return;
    const index = dashboardTabs.findIndex((tab) => tab.value === value);
    const next =
      dashboardTabs[
        (index + step + dashboardTabs.length) % dashboardTabs.length
      ];
    onChange(next.value);
    document.getElementById(tabId(next.value))?.focus();
  };

  return (
    <div
      className="dashboard-tabs"
      role="tablist"
      aria-label="Secciones del panel"
      onKeyDown={handleKeyDown}
    >
      {dashboardTabs.map((tab) => {
        const selected = tab.value === value;
        const count = counts[tab.value];

        return (
          <button
            key={tab.value}
            id={tabId(tab.value)}
            type="button"
            role="tab"
            aria-selected={selected}
            aria-controls={panelId(tab.value)}
            tabIndex={selected ? 0 : -1}
            className={
              selected
                ? "dashboard-tabs__tab dashboard-tabs__tab--active"
                : "dashboard-tabs__tab"
            }
            onClick={() => onChange(tab.value)}
          >
            {tab.label}
            {count !== undefined && (
              <span className="dashboard-tabs__count">{count}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
