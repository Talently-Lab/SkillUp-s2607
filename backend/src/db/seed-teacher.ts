import { eq } from "drizzle-orm";
import { z } from "zod";
import { db, pool } from "./client.ts";
import { users } from "./schema/index.ts";
import { hashPassword } from "../modules/auth/password.ts";
import {
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
} from "../modules/auth/auth.schemas.ts";

// Development only: the API has no way to create teachers yet
const parsed = z
  .object({
    SEED_TEACHER_EMAIL: z.email().trim().toLowerCase(),
    SEED_TEACHER_PASSWORD: z
      .string()
      .min(PASSWORD_MIN_LENGTH)
      .max(PASSWORD_MAX_LENGTH),
    SEED_TEACHER_NAME: z.string().trim().min(2).max(60).default("Docente"),
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

const { SEED_TEACHER_EMAIL, SEED_TEACHER_PASSWORD, SEED_TEACHER_NAME } =
  parsed.data;

try {
  const existing = await db.query.users.findFirst({
    where: eq(users.email, SEED_TEACHER_EMAIL),
  });

  if (existing) {
    console.log(`User ${SEED_TEACHER_EMAIL} already exists, nothing to do.`);
  } else {
    await db.insert(users).values({
      email: SEED_TEACHER_EMAIL,
      fullName: SEED_TEACHER_NAME,
      passwordHash: await hashPassword(SEED_TEACHER_PASSWORD),
      role: "teacher",
    });
    console.log(`Teacher ${SEED_TEACHER_EMAIL} created.`);
  }
} finally {
  await pool.end();
}
