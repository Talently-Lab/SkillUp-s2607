import { Router } from "express";
import {
  requireAuth,
  requireRole,
} from "../../shared/middlewares/authenticate.ts";
import {
  validateBody,
  validateParams,
  validateQuery,
} from "../../shared/middlewares/validate.ts";
import { teacherController } from "./teacher.controller.ts";
import {
  createTeacherLessonSchema,
  createTeacherModuleSchema,
  reorderSchema,
  teacherCourseParamsSchema,
  teacherLessonParamsSchema,
  teacherModuleParamsSchema,
  teacherPageQuerySchema,
  updateTeacherCourseSchema,
  updateTeacherLessonSchema,
  updateTeacherModuleSchema,
} from "./teacher.schemas.ts";

export const teacherRouter = Router();

// All teacher routes require authentication and the 'teacher' role
teacherRouter.use(requireAuth, requireRole("teacher"));

// ── Courses ───────────────────────────────────────────────────────────────────

teacherRouter.get(
  "/courses",
  validateQuery(teacherPageQuerySchema),
  teacherController.listCourses,
);

teacherRouter.get(
  "/courses/:courseId",
  validateParams(teacherCourseParamsSchema),
  teacherController.getCourse,
);

teacherRouter.patch(
  "/courses/:courseId",
  validateParams(teacherCourseParamsSchema),
  validateBody(updateTeacherCourseSchema),
  teacherController.updateCourse,
);

teacherRouter.get(
  "/courses/:courseId/enrollments",
  validateParams(teacherCourseParamsSchema),
  validateQuery(teacherPageQuerySchema),
  teacherController.listEnrollments,
);

// ── Modules ───────────────────────────────────────────────────────────────────

teacherRouter.get(
  "/courses/:courseId/modules",
  validateParams(teacherCourseParamsSchema),
  teacherController.listModules,
);

teacherRouter.post(
  "/courses/:courseId/modules",
  validateParams(teacherCourseParamsSchema),
  validateBody(createTeacherModuleSchema),
  teacherController.createModule,
);

teacherRouter.put(
  "/courses/:courseId/modules/order",
  validateParams(teacherCourseParamsSchema),
  validateBody(reorderSchema),
  teacherController.reorderModules,
);

teacherRouter.patch(
  "/modules/:moduleId",
  validateParams(teacherModuleParamsSchema),
  validateBody(updateTeacherModuleSchema),
  teacherController.updateModule,
);

teacherRouter.delete(
  "/modules/:moduleId",
  validateParams(teacherModuleParamsSchema),
  teacherController.deleteModule,
);

// ── Lessons ───────────────────────────────────────────────────────────────────

teacherRouter.get(
  "/modules/:moduleId/lessons",
  validateParams(teacherModuleParamsSchema),
  teacherController.listLessons,
);

teacherRouter.post(
  "/modules/:moduleId/lessons",
  validateParams(teacherModuleParamsSchema),
  validateBody(createTeacherLessonSchema),
  teacherController.createLesson,
);

teacherRouter.put(
  "/modules/:moduleId/lessons/order",
  validateParams(teacherModuleParamsSchema),
  validateBody(reorderSchema),
  teacherController.reorderLessons,
);

teacherRouter.patch(
  "/lessons/:lessonId",
  validateParams(teacherLessonParamsSchema),
  validateBody(updateTeacherLessonSchema),
  teacherController.updateLesson,
);

teacherRouter.delete(
  "/lessons/:lessonId",
  validateParams(teacherLessonParamsSchema),
  teacherController.deleteLesson,
);
