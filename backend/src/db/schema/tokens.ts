import { index, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { users } from "./users.ts";

// Only the SHA-256 hash of each refresh token is stored, never the token itself
export const refreshTokens = pgTable(
  "refresh_tokens",
  {
    id: uuid().primaryKey().defaultRandom(),
    userId: uuid()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    tokenHash: text().notNull().unique("refresh_tokens_token_hash_unique"),
    expiresAt: timestamp({ withTimezone: true }).notNull(),
    revokedAt: timestamp({ withTimezone: true }),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index().on(table.userId)],
);

export type RefreshToken = typeof refreshTokens.$inferSelect;
