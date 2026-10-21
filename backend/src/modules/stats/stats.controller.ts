import type { RequestHandler } from "express";
import { statsRepository } from "./stats.repository.ts";

export const STATS_BASE_PATH = "/api/v1/admin/stats";

export const statsController = {
  getPlatformStats: (async (_req, res) => {
    const stats = await statsRepository.getPlatformStats();
    res.json(stats);
  }) satisfies RequestHandler,
};
