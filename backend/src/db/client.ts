import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { env } from "../config/env.ts";
import * as schema from "./schema/index.ts";

export const pool = new Pool({ connectionString: env.DATABASE_URL });
export const db = drizzle({ client: pool, schema, casing: "snake_case" });

/**
 * Represents either the main db instance or a transaction object.
 * Defined here (where `db` is built) so it doesn't depend on driver-specific
 * generics from other files.
 */
export type DbOrTx =
  typeof db | Parameters<Parameters<typeof db.transaction>[0]>[0];

/** Run `fn` inside a Postgres transaction; returns its result. */
export async function runInTransaction<T>(
  fn: (tx: DbOrTx) => Promise<T>,
): Promise<T> {
  return db.transaction(fn);
}
