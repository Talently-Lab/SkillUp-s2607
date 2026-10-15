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

app.use(notFound);
app.use(errorHandler);
