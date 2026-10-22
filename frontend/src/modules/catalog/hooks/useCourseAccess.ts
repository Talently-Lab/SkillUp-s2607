import { useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { toast } from "sonner";

import { ApiError } from "@/shared/api/http";
import { useFetch } from "@/shared/hooks/useFetch";
import { enrollmentsService } from "@/shared/services/enrollmentsService";
import { modulesService } from "@/shared/services/modulesService";
import { useAuthStore } from "@/shared/stores/authStore";
import type { Course } from "@/shared/types/course";
import { enrollErrorMessage } from "@/modules/catalog/utils/enrollErrorMessage";
import { learnPath } from "@/shared/utils/paths";
import { loginPath } from "@/shared/utils/roles";

/**
 * What the visitor can do with a course: its modules (locked or not for them),
 * whether they are already enrolled, and the action to enroll.
 */
export function useCourseAccess(course: Course) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const user = useAuthStore((state) => state.user);
  const isStudent = user?.role === "student";
  const [enrolling, setEnrolling] = useState(false);

  const { data, error, isLoading, retry } = useFetch(
    `course-access-${course.id}-${user?.id ?? "guest"}`,
    async () => {
      // Asked first because it renews an expired session, so the modules
      // below come unlocked for an enrolled student
      const enrollments = isStudent ? await enrollmentsService.listMine() : [];
      const modules = await modulesService.listByCourse(course.id);
      return {
        enrolled: enrollments.some((item) => item.courseId === course.id),
        modules,
      };
    },
  );

  const enroll = async () => {
    if (!user) {
      navigate(loginPath("student", pathname));
      return;
    }
    if (enrolling) return;

    setEnrolling(true);
    try {
      await enrollmentsService.enroll(course.id);
      toast.success("¡Listo! Ya estás inscrito en el curso.");
      navigate(learnPath(course.slug));
    } catch (err) {
      if (err instanceof ApiError && err.code === "ALREADY_ENROLLED") {
        navigate(learnPath(course.slug));
        return;
      }
      toast.error(enrollErrorMessage(err));
      setEnrolling(false);
    }
  };

  return {
    modules: data?.modules ?? [],
    enrolled: data?.enrolled ?? false,
    isLoading,
    error,
    retry,
    // Guests can press it too, it takes them to the login first
    canEnroll: !user || isStudent,
    enrolling,
    enroll,
  };
}
