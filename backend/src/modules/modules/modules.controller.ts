import type { RequestHandler } from "express";
import { modulesService } from "./modules.service.ts";

export const MODULES_BASE_PATH = "/api/v1/courses/:courseId/modules";

export const modulesController = {
  list: (async (req, res) => {
    const courseId = req.params["courseId"] as string;
    // Vary: Authorization so caches serve the right version per auth state
    res.setHeader("Vary", "Authorization");
    const modules = await modulesService.listByCourse(courseId, req.auth);
    res.json({ modules });
  }) satisfies RequestHandler,
};
