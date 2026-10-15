import { and, eq, isNull } from "drizzle-orm";
import { db } from "../../db/client.ts";
import { refreshTokens, users, type NewUser } from "../../db/schema/index.ts";

export const authRepository = {
  async findUserByEmail(email: string) {
    return db.query.users.findFirst({ where: eq(users.email, email) });
  },

  async findUserById(id: string) {
    return db.query.users.findFirst({ where: eq(users.id, id) });
  },

  async createUser(data: NewUser) {
    const [user] = await db.insert(users).values(data).returning();
    return user!;
  },

  async createRefreshToken(data: {
    userId: string;
    tokenHash: string;
    expiresAt: Date;
  }) {
    await db.insert(refreshTokens).values(data);
  },

  async findRefreshToken(tokenHash: string) {
    return db.query.refreshTokens.findFirst({
      where: eq(refreshTokens.tokenHash, tokenHash),
    });
  },

  /** Revokes the token only if it was still active, so two concurrent calls can't both use it */
  async revokeRefreshToken(tokenHash: string) {
    const revoked = await db
      .update(refreshTokens)
      .set({ revokedAt: new Date() })
      .where(
        and(
          eq(refreshTokens.tokenHash, tokenHash),
          isNull(refreshTokens.revokedAt),
        ),
      )
      .returning({ id: refreshTokens.id });
    return revoked.length > 0;
  },

  async revokeAllRefreshTokens(userId: string) {
    await db
      .update(refreshTokens)
      .set({ revokedAt: new Date() })
      .where(
        and(eq(refreshTokens.userId, userId), isNull(refreshTokens.revokedAt)),
      );
  },
};
