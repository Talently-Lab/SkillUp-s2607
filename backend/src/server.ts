import { env } from "./config/env.ts";
import { app } from "./app.ts";
import { logger } from "./shared/logger.ts";
import { pool } from "./db/client.ts";

const server = app.listen(env.PORT, () => {
  logger.info(`API listening on http://localhost:${env.PORT}`);
});

function shutdown(signal: string) {
  logger.info(`Received ${signal}, shutting down...`);
  server.close(() => {
    void pool.end().finally(() => process.exit(0));
  });
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
