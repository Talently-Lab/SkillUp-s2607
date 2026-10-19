import type { RequestHandler } from "express";
import { db } from "../../db/client.ts";
import { categories } from "../../db/schema/index.ts";
import { asc } from "drizzle-orm";

export const CATEGORIES_BASE_PATH = "/api/v1/categories";

export const categoriesController = {
  list: (async (_req, res) => {
    const data = await db
      .select()
      .from(categories)
      .orderBy(asc(categories.name));
    res.json({ categories: data });
  }) satisfies RequestHandler,
};
