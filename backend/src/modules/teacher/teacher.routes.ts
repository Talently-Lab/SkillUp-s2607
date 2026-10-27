import { Router } from "express";
import {
  requireAuth,
  requireRole,
} from "../../shared/middlewares/authenticate.ts";
import {
  validateBody,
  validateParams,
} from "../../shared/middlewares/validate.ts";
import { teacherController } from "./teacher.controller.ts";
import {
  createTeacherLessonSchema,
  createTeacherModuleSchema,
  teacherCourseParamsSchema,
  teacherLessonParamsSchema,
  teacherModuleParamsSchema,
  updateTeacherLessonSchema,
  updateTeacherModuleSchema,
} from "./teacher.schemas.ts";

export const teacherRouter = Router();

// All teacher routes require authentication and the 'teacher' role
teacherRouter.use(requireAuth, requireRole("teacher"));

// ── Courses ───────────────────────────────────────────────────────────────────

teacherRouter.get("/courses", teacherController.listCourses);

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
