import { errors, jwtVerify, SignJWT } from "jose";
import { env } from "../../config/env.ts";
import type { UserRole } from "../../db/schema/index.ts";
import { UnauthorizedError } from "../errors/app-error.ts";

const ISSUER = "skillup-api";
const AUDIENCE = "skillup-web";
const ALGORITHM = "HS256";
const secret = new TextEncoder().encode(env.JWT_ACCESS_SECRET);

export interface AccessTokenClaims {
  userId: string;
  role: UserRole;
}

export function signAccessToken({ userId, role }: AccessTokenClaims) {
  return new SignJWT({ role })
    .setProtectedHeader({ alg: ALGORITHM })
    .setSubject(userId)
    .setIssuer(ISSUER)
    .setAudience(AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(`${env.JWT_ACCESS_TTL_SECONDS}s`)
    .sign(secret);
}

export async function verifyAccessToken(
  token: string,
): Promise<AccessTokenClaims> {
  try {
    const { payload } = await jwtVerify<{ role: UserRole }>(token, secret, {
      issuer: ISSUER,
      audience: AUDIENCE,
      algorithms: [ALGORITHM],
    });
    if (!payload.sub || typeof payload.role !== "string") {
      throw new UnauthorizedError("INVALID_TOKEN", "Invalid access token");
    }
    return { userId: payload.sub, role: payload.role };
  } catch (err) {
    if (err instanceof errors.JWTExpired) {
      throw new UnauthorizedError("TOKEN_EXPIRED", "Access token has expired");
    }
    throw new UnauthorizedError("INVALID_TOKEN", "Invalid access token");
  }
}
