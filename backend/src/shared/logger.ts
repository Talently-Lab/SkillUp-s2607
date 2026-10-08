import { pino } from "pino";
import { env, isProd } from "../config/env.ts";

export const logger = pino({
  level: env.LOG_LEVEL,
  redact: [
    "req.headers.authorization",
    "req.headers.cookie",
    'res.headers["set-cooke"]',
  ],
  ...(isProd
    ? {}
    : { transport: { target: "pino-pretty", options: { colorize: true } } }),
});
