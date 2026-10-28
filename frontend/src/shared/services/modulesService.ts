import { request } from "@/shared/api/http";
import type { CourseModule, Lesson } from "@/shared/types/lesson";

type ApiModule = Omit<CourseModule, "lessons"> & { lessons?: Lesson[] };

export const modulesService = {
  /**
   * Sends the token when there is one, so an enrolled student or the admin
   * gets every video. Without it only the free preview comes unlocked.
   */
  async listByCourse(courseId: string): Promise<CourseModule[]> {
    const { modules } = await request<{ modules: ApiModule[] }>(
      `/courses/${courseId}/modules`,
      { auth: true },
    );
    return modules.map(({ id, title, position, lessons = [] }) => ({
      id,
      title,
      position,
      lessons: lessons.map(
        ({
          id,
          moduleId,
          title,
          position,
          videoUrl,
          durationSeconds,
          locked,
        }) => ({
          id,
          moduleId,
          title,
          position,
          videoUrl,
          durationSeconds,
          locked,
        }),
      ),
    }));
  },
};
