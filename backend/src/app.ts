import express from "express";
import { pinoHttp } from "pino-http";
import { notFound } from "./shared/errors/not-found.ts";
import { errorHandler } from "./shared/middlewares/error-handler.ts";
import { logger } from "./shared/logger.ts";
import { db } from "./db/client.ts";
import { sql } from "drizzle-orm";

export const app = express();
app.use(pinoHttp({ logger }));
app.use(express.json());

app.get("/health", async (req, res) => {
  try {
    await db.execute(sql`select 1`);
    res.json({ status: "ok" });
  } catch (err) {
    req.log.error({ err }, "database health check failed");
    res.status(503).json({ status: "error", db: "down" });
  }
});

app.use(notFound);
app.use(errorHandler);
