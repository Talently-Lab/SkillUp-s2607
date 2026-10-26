export type CourseTab = "syllabus" | "students";

export const courseTabId = (tab: CourseTab) => `course-tab-${tab}`;
export const coursePanelId = (tab: CourseTab) => `course-panel-${tab}`;
