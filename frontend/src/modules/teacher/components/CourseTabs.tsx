import type { KeyboardEvent } from "react";

import {
  courseTabId,
  coursePanelId,
  type CourseTab,
} from "@/modules/teacher/constants/tabs";
import "./CourseTabs.css";

type CourseTabsProps = {
  value: CourseTab;
  studentCount: number;
  onChange: (tab: CourseTab) => void;
};

export function CourseTabs({ value, studentCount, onChange }: CourseTabsProps) {
  const tabs: { value: CourseTab; label: string; count?: number }[] = [
    { value: "syllabus", label: "Temario" },
    { value: "students", label: "Alumnos inscritos", count: studentCount },
  ];

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const step =
      event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
    if (!step) return;
    const index = tabs.findIndex((tab) => tab.value === value);
    const next = tabs[(index + step + tabs.length) % tabs.length];

    onChange(next.value);
    document.getElementById(courseTabId(next.value))?.focus();
  };

  return (
    <div
      className="course-tabs"
      role="tablist"
      aria-label="Gestión del curso"
      onKeyDown={handleKeyDown}
    >
      {tabs.map((tab) => {
        const selected = tab.value === value;
        return (
          <button
            key={tab.value}
            id={courseTabId(tab.value)}
            type="button"
            role="tab"
            aria-selected={selected}
            aria-controls={coursePanelId(tab.value)}
            tabIndex={selected ? 0 : -1}
            className={
              selected
                ? "course-tabs__tab course-tabs__tab--active"
                : "course-tabs__tab"
            }
            onClick={() => onChange(tab.value)}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span className="course-tabs__count">{tab.count}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
