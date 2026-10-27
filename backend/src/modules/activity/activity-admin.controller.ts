import type { RequestHandler } from "express";
import { activityService } from "./activity.service.ts";
import type { ActivityQuery } from "./activity.schemas.ts";

export const ACTIVITY_ADMIN_BASE_PATH = "/api/v1/admin/activity";

export const activityAdminController = {
  list: (async (req, res) => {
    const result = await activityService.list(req.parsedQuery as ActivityQuery);
    res.json(result);
  }) satisfies RequestHandler,
};
