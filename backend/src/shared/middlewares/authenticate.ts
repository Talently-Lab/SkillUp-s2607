import type { RequestHandler } from "express";
import type { UserRole } from "../../db/schema/index.ts";
import { ForbiddenError, UnauthorizedError } from "../errors/app-error.ts";
import { verifyAccessToken, type AccessTokenClaims } from "../security/jwt.ts";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace -- the way to extend Express' Request type
  namespace Express {
    interface Request {
      auth?: AccessTokenClaims;
    }
  }
}

/**
 * Attempts to verify a raw `Authorization: Bearer <token>` header value.
 * Returns the claims on success, or `undefined` if the header is absent,
 * malformed, invalid, or expired — without throwing.
 * Used by optionalAuth; requireAuth wraps this and throws on failure.
 */
async function tryVerifyToken(
  authorizationHeader: string | undefined,
): Promise<AccessTokenClaims | undefined> {
  const [scheme, token] = authorizationHeader?.split(" ") ?? [];
  if (scheme !== "Bearer" || !token) return undefined;
  try {
    return await verifyAccessToken(token);
  } catch {
    return undefined;
  }
}

/** Requires a valid `Authorization: Bearer <access token>` header.
 *  Throws exactly the same errors as before: 401 UNAUTHORIZED (missing/malformed),
 *  401 INVALID_TOKEN, or 401 TOKEN_EXPIRED. */
export const requireAuth: RequestHandler = async (req, _res, next) => {
  const [scheme, token] = req.headers.authorization?.split(" ") ?? [];
  if (scheme !== "Bearer" || !token) throw new UnauthorizedError();

  req.auth = await verifyAccessToken(token);
  next();
};

/** Use after requireAuth to restrict a route to some roles */
export function requireRole(...roles: UserRole[]): RequestHandler {
  return (req, _res, next) => {
    if (!req.auth || !roles.includes(req.auth.role)) throw new ForbiddenError();
    next();
  };
}

/**
 * Optional authentication: if a valid Bearer token is present, populates
 * `req.auth` like requireAuth does. If the header is absent, invalid, or
 * expired, treats the request as anonymous (no error thrown, req.auth stays
 * undefined). Safe to use on public endpoints that also serve logged-in users.
 */
export const optionalAuth: RequestHandler = async (req, _res, next) => {
  const claims = await tryVerifyToken(req.headers.authorization);
  if (claims) req.auth = claims;
  next();
};
