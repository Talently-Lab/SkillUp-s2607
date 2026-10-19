import type { RequestHandler } from "express";
import { categoriesService } from "./categories.service.ts";

export const CATEGORIES_BASE_PATH = "/api/v1/categories";

export const categoriesController = {
  list: (async (_req, res) => {
    const categories = await categoriesService.list();
    res.json({ categories });
  }) satisfies RequestHandler,
};
