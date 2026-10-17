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
import { COURSES_ADMIN_BASE_PATH } from "./modules/courses/courses-admin.controller.ts";
import { coursesAdminRouter } from "./modules/courses/courses-admin.routes.ts";
import { ENROLLMENTS_BASE_PATH } from "./modules/enrollments/enrollments.controller.ts";
import { enrollmentsRouter } from "./modules/enrollments/enrollments.routes.ts";
import { progressRouter } from "./modules/enrollments/progress.routes.ts";
import { USERS_ADMIN_BASE_PATH } from "./modules/users/users-admin.controller.ts";
import { usersAdminRouter } from "./modules/users/users-admin.routes.ts";
import { statsRouter } from "./modules/users/stats.routes.ts";
import { modulesRouter } from "./modules/modules/modules.routes.ts";
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
app.use(COURSES_BASE_PATH, coursesRouter);
app.use(COURSES_ADMIN_BASE_PATH, coursesAdminRouter);
app.use(ENROLLMENTS_BASE_PATH, enrollmentsRouter);
// Progress routes: /api/v1/enrollments/:enrollmentId/progress
app.use(`${ENROLLMENTS_BASE_PATH}/:enrollmentId/progress`, progressRouter);
app.use(USERS_ADMIN_BASE_PATH, usersAdminRouter);
app.use("/api/v1/admin/stats", statsRouter);
// Modules & lessons: /api/v1/courses/:courseId/modules
app.use(`${COURSES_BASE_PATH}/:courseId/modules`, modulesRouter);

app.use(notFound);
app.use(errorHandler);
