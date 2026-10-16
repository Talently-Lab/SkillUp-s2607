import { createHash, randomBytes } from "node:crypto";
import { env } from "../../config/env.ts";
import type { User } from "../../db/schema/index.ts";
import {
  ConflictError,
  ForbiddenError,
  UnauthorizedError,
} from "../../shared/errors/app-error.ts";
import { signAccessToken } from "../../shared/security/jwt.ts";
import { isUniqueViolation } from "../../shared/errors/db-errors.ts";
import { authRepository } from "./auth.repository.ts";
import type { LoginInput, RegisterInput } from "./auth.schemas.ts";
import {
  hashPassword,
  verifyDummyPassword,
  verifyPassword,
} from "./password.ts";

const DAY_MS = 24 * 60 * 60 * 1000;

export interface Session {
  user: PublicUser;
  accessToken: string;
  tokenType: "Bearer";
  expiresIn: number;
  refreshToken: string;
  refreshTokenExpiresAt: Date;
}

export type PublicUser = ReturnType<typeof toPublicUser>;

/** The only user fields that ever leave the API */
export function toPublicUser(user: User) {
  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    role: user.role,
    status: user.status,
    createdAt: user.createdAt,
  };
}

function hashRefreshToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

const invalidCredentials = () =>
  new UnauthorizedError("INVALID_CREDENTIALS", "Invalid email or password");
const invalidSession = () =>
  new UnauthorizedError("INVALID_SESSION", "Session is invalid or has expired");
const accountSuspended = () =>
  new ForbiddenError("ACCOUNT_SUSPENDED", "This account is suspended");

async function createSession(user: User): Promise<Session> {
  const refreshToken = randomBytes(32).toString("base64url");
  const refreshTokenExpiresAt = new Date(
    Date.now() + env.REFRESH_TOKEN_TTL_DAYS * DAY_MS,
  );

  await authRepository.createRefreshToken({
    userId: user.id,
    tokenHash: hashRefreshToken(refreshToken),
    expiresAt: refreshTokenExpiresAt,
  });

  return {
    user: toPublicUser(user),
    accessToken: await signAccessToken({ userId: user.id, role: user.role }),
    tokenType: "Bearer",
    expiresIn: env.JWT_ACCESS_TTL_SECONDS,
    refreshToken,
    refreshTokenExpiresAt,
  };
}

export const authService = {
  async register({ fullName, email, password }: RegisterInput) {
    if (await authRepository.findUserByEmail(email)) {
      throw new ConflictError("EMAIL_TAKEN", "Email is already registered");
    }

    try {
      const user = await authRepository.createUser({
        fullName,
        email,
        passwordHash: await hashPassword(password),
        role: "student",
      });
      return await createSession(user);
    } catch (err) {
      if (isUniqueViolation(err)) {
        throw new ConflictError("EMAIL_TAKEN", "Email is already registered");
      }
      throw err;
    }
  },

  async login({ email, password }: LoginInput) {
    const user = await authRepository.findUserByEmail(email);
    const valid = user
      ? await verifyPassword(user.passwordHash, password)
      : await verifyDummyPassword(password);

    if (!user || !valid) throw invalidCredentials();
    // Only revealed after a correct password, so it doesn't leak which emails exist
    if (user.status === "suspended") throw accountSuspended();

    return createSession(user);
  },

  /** Rotates the refresh token: the one received is revoked and a new one is issued */
  async refresh(refreshToken: string | undefined) {
    if (!refreshToken) throw invalidSession();

    const tokenHash = hashRefreshToken(refreshToken);
    const stored = await authRepository.findRefreshToken(tokenHash);
    if (!stored) throw invalidSession();

    if (stored.revokedAt) {
      // A revoked token was reused: it may have been stolen, so close every session of the user
      await authRepository.revokeAllRefreshTokens(stored.userId);
      throw invalidSession();
    }

    if (!(await authRepository.revokeRefreshToken(tokenHash))) {
      throw invalidSession();
    }
    if (stored.expiresAt <= new Date()) throw invalidSession();

    const user = await authRepository.findUserById(stored.userId);
    if (!user) throw invalidSession();
    if (user.status === "suspended") {
      await authRepository.revokeAllRefreshTokens(user.id);
      throw accountSuspended();
    }

    return createSession(user);
  },

  async logout(refreshToken: string | undefined) {
    if (refreshToken) {
      await authRepository.revokeRefreshToken(hashRefreshToken(refreshToken));
    }
  },

  async me(userId: string) {
    const user = await authRepository.findUserById(userId);
    if (!user) throw invalidSession();
    if (user.status === "suspended") throw accountSuspended();
    return toPublicUser(user);
  },
};
