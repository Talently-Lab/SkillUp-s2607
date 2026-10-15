import { z } from "zod";

export const safeSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  PORT: z.coerce.number().int().positive().default(3000),
  LOG_LEVEL: z
    .enum(["fatal", "error", "warn", "info", "debug", "trace"])
    .default("info"),
  DATABASE_URL: z.url(),
  // Comma separated list of origins allowed to call the API with credentials
  CORS_ORIGIN: z.string().min(1).default("http://localhost:5173"),
  // Number of proxies in front of the API (0 locally). Needed so rate limiting sees the real client IP
  TRUST_PROXY: z.coerce.number().int().min(0).default(0),
  JWT_ACCESS_SECRET: z.string().min(32, "must be at least 32 characters long"),
  JWT_ACCESS_TTL_SECONDS: z.coerce.number().int().positive().default(900),
  REFRESH_TOKEN_TTL_DAYS: z.coerce.number().int().positive().default(7),
  // Swagger UI at /docs. Defaults to on outside production
  DOCS_ENABLED: z.stringbool().optional(),
});

const parsed = safeSchema.safeParse(process.env);

if (!parsed.success) {
  // eslint-disable-next-line no-console -- the logger depends on env, so it isn't available yet
  console.error(
    "Invalid environment variables",
    z.flattenError(parsed.error).fieldErrors,
  );
  process.exit(1);
}

export const env = parsed.data;
export const isProd = env.NODE_ENV === "production";
export const docsEnabled = env.DOCS_ENABLED ?? !isProd;
export const corsOrigins = env.CORS_ORIGIN.split(",").map((origin) =>
  origin.trim(),
);
