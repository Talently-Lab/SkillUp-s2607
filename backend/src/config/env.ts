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
});

const parsed = safeSchema.safeParse(process.env);

if (!parsed.success) {
  // eslint-disable-next-line no-console -- the logger depens on env, so it isn't available yet
  console.error(
    "Invalid environment variables",
    z.flattenError(parsed.error).fieldErrors,
  );
  process.exit(1);
}

export const env = parsed.data;
export const isProd = env.NODE_ENV === "production";
