import { eq } from "drizzle-orm";
import { z } from "zod";
import { db, pool } from "./client.ts";
import { users } from "./schema/index.ts";
import { hashPassword } from "../modules/auth/password.ts";
import {
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
} from "../modules/auth/auth.schemas.ts";

const parsed = z
  .object({
    SEED_ADMIN_EMAIL: z.email().trim().toLowerCase(),
    SEED_ADMIN_PASSWORD: z
      .string()
      .min(PASSWORD_MIN_LENGTH)
      .max(PASSWORD_MAX_LENGTH),
    SEED_ADMIN_NAME: z.string().trim().min(2).max(60).default("Admin"),
  })
  .safeParse(process.env);

/* eslint-disable no-console -- CLI script output */
if (!parsed.success) {
  console.error(
    "Invalid seed variables",
    z.flattenError(parsed.error).fieldErrors,
  );
  process.exit(1);
}

const { SEED_ADMIN_EMAIL, SEED_ADMIN_PASSWORD, SEED_ADMIN_NAME } = parsed.data;

try {
  const existing = await db.query.users.findFirst({
    where: eq(users.email, SEED_ADMIN_EMAIL),
  });

  if (existing) {
    console.log(`User ${SEED_ADMIN_EMAIL} already exists, nothing to do.`);
  } else {
    await db.insert(users).values({
      email: SEED_ADMIN_EMAIL,
      fullName: SEED_ADMIN_NAME,
      passwordHash: await hashPassword(SEED_ADMIN_PASSWORD),
      role: "admin",
    });
    console.log(`Admin ${SEED_ADMIN_EMAIL} created.`);
  }
} finally {
  await pool.end();
}
