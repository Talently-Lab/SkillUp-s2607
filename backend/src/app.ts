import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import { pinoHttp } from "pino-http";
import { sql } from "drizzle-orm";
import { corsOrigins, docsEnabled, env } from "./config/env.ts";
import { db } from "./db/client.ts";
import { docsRouter } from "./docs/docs.routes.ts";
import { AUTH_BASE_PATH } from "./modules/auth/auth.controller.ts";
import { authRouter } from "./modules/auth/auth.routes.ts";
import { COURSES_BASE_PATH } from "./modules/courses/courses.controller.ts";
import { coursesRouter } from "./modules/courses/courses.routes.ts";
import { CATEGORIES_BASE_PATH } from "./modules/categories/categories.controller.ts";
import { categoriesRouter } from "./modules/categories/categories.routes.ts";
import { COURSES_ADMIN_BASE_PATH } from "./modules/courses/courses-admin.controller.ts";
import { coursesAdminRouter } from "./modules/courses/courses-admin.routes.ts";
import { ENROLLMENTS_BASE_PATH } from "./modules/enrollments/enrollments.controller.ts";
import { enrollmentsRouter } from "./modules/enrollments/enrollments.routes.ts";
import { USERS_ADMIN_BASE_PATH } from "./modules/users/users-admin.controller.ts";
import { usersAdminRouter } from "./modules/users/users-admin.routes.ts";
import { PROGRESS_BASE_PATH } from "./modules/progress/progress.controller.ts";
import { progressRouter } from "./modules/progress/progress.routes.ts";
import { STATS_BASE_PATH } from "./modules/stats/stats.controller.ts";
import { statsRouter } from "./modules/stats/stats.routes.ts";
import { MODULES_BASE_PATH } from "./modules/modules/modules.controller.ts";
import { modulesRouter } from "./modules/modules/modules.routes.ts";
import { MODULES_ADMIN_BASE_PATH } from "./modules/modules/modules-admin.controller.ts";
import { modulesAdminRouter } from "./modules/modules/modules-admin.routes.ts";
import { notFound } from "./shared/errors/not-found.ts";
import { logger } from "./shared/logger.ts";
import { errorHandler } from "./shared/middlewares/error-handler.ts";

export const app = express();
app.set("trust proxy", env.TRUST_PROXY);
app.disable("x-powered-by");

app.use(pinoHttp({ logger }));
if (docsEnabled) app.use("/docs", docsRouter);
app.use(helmet());
app.use(cors({ origin: corsOrigins, credentials: true }));
app.use(express.json({ limit: "10kb" }));
app.use(cookieParser());

app.get("/health", async (req, res) => {
  try {
    await db.execute(sql`select 1`);
    res.json({ status: "ok" });
  } catch (err) {
    req.log.error({ err }, "database health check failed");
    res.status(503).json({ status: "error", db: "down" });
  }
});

app.use(AUTH_BASE_PATH, authRouter);
app.use(CATEGORIES_BASE_PATH, categoriesRouter);
app.use(COURSES_BASE_PATH, coursesRouter);
app.use(COURSES_ADMIN_BASE_PATH, coursesAdminRouter);
app.use(ENROLLMENTS_BASE_PATH, enrollmentsRouter);
app.use(USERS_ADMIN_BASE_PATH, usersAdminRouter);
app.use(PROGRESS_BASE_PATH, progressRouter);
// Admin platform stats
app.use(STATS_BASE_PATH, statsRouter);
// Public: list modules (with lessons) for a published course
app.use(MODULES_BASE_PATH, modulesRouter);
// Admin: manage modules and lessons of a course
app.use(MODULES_ADMIN_BASE_PATH, modulesAdminRouter);

app.use(notFound);
app.use(errorHandler);
