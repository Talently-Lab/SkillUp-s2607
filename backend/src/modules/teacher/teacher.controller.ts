import type { RequestHandler } from "express";
import { teacherService } from "./teacher.service.ts";
import type {
  CreateTeacherLessonInput,
  CreateTeacherModuleInput,
  UpdateTeacherLessonInput,
  UpdateTeacherModuleInput,
} from "./teacher.schemas.ts";

export const TEACHER_BASE_PATH = "/api/v1/teacher";

export const teacherController = {
  // ── Courses ───────────────────────────────────────────────────────────────

  listCourses: (async (req, res) => {
    const courses = await teacherService.listCourses(req.auth!.userId);
    res.json({ courses });
  }) satisfies RequestHandler,

  // ── Modules ───────────────────────────────────────────────────────────────

  listModules: (async (req, res) => {
    const courseId = req.params["courseId"] as string;
    const modules = await teacherService.listModules(courseId, req.auth!.userId);
    res.json({ modules });
  }) satisfies RequestHandler,

  createModule: (async (req, res) => {
    const courseId = req.params["courseId"] as string;
    const module = await teacherService.createModule(
      courseId,
      req.auth!.userId,
      req.body as CreateTeacherModuleInput,
    );
    res.status(201).json({ module });
  }) satisfies RequestHandler,

  updateModule: (async (req, res) => {
    const moduleId = req.params["moduleId"] as string;
    const module = await teacherService.updateModule(
      moduleId,
      req.auth!.userId,
      req.body as UpdateTeacherModuleInput,
    );
    res.json({ module });
  }) satisfies RequestHandler,

  deleteModule: (async (req, res) => {
    const moduleId = req.params["moduleId"] as string;
    await teacherService.deleteModule(moduleId, req.auth!.userId);
    res.status(204).end();
  }) satisfies RequestHandler,

  // ── Lessons ───────────────────────────────────────────────────────────────

  listLessons: (async (req, res) => {
    const moduleId = req.params["moduleId"] as string;
    const lessons = await teacherService.listLessons(moduleId, req.auth!.userId);
    res.json({ lessons });
  }) satisfies RequestHandler,

  createLesson: (async (req, res) => {
    const moduleId = req.params["moduleId"] as string;
    const lesson = await teacherService.createLesson(
      moduleId,
      req.auth!.userId,
      req.body as CreateTeacherLessonInput,
    );
    res.status(201).json({ lesson });
  }) satisfies RequestHandler,

  updateLesson: (async (req, res) => {
    const lessonId = req.params["lessonId"] as string;
    const lesson = await teacherService.updateLesson(
      lessonId,
      req.auth!.userId,
      req.body as UpdateTeacherLessonInput,
    );
    res.json({ lesson });
  }) satisfies RequestHandler,

  deleteLesson: (async (req, res) => {
    const lessonId = req.params["lessonId"] as string;
    await teacherService.deleteLesson(lessonId, req.auth!.userId);
    res.status(204).end();
  }) satisfies RequestHandler,
};
