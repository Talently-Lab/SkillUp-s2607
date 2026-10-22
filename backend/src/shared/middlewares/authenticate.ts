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

/** Returns the token of an `Authorization: Bearer <token>` header, or undefined if absent or malformed */
function parseBearer(header: string | undefined) {
  const [scheme, token] = header?.split(" ") ?? [];
  return scheme === "Bearer" && token ? token : undefined;
}

/** Requires a valid `Authorization: Bearer <access token>` header */
export const requireAuth: RequestHandler = async (req, _res, next) => {
  const token = parseBearer(req.headers.authorization);
  if (!token) throw new UnauthorizedError();

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
 * Optional authentication: populates `req.auth` when a valid Bearer token is
 * present. A missing, invalid or expired token is treated as anonymous.
 */
export const optionalAuth: RequestHandler = async (req, _res, next) => {
  const token = parseBearer(req.headers.authorization);
  if (token) {
    try {
      req.auth = await verifyAccessToken(token);
    } catch {
      // invalid or expired: continue as anonymous
    }
  }
  next();
};
