import type { RequestHandler } from "express";
import { statsService } from "./stats.service.ts";

export const STATS_BASE_PATH = "/api/v1/admin/stats";

export const statsController = {
  getPlatformStats: (async (_req, res) => {
    const stats = await statsService.getPlatformStats();
    res.json(stats);
  }) satisfies RequestHandler,
};
