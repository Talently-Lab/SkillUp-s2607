import type { RequestHandler } from "express";
import type { UserRole } from "../../db/schema/index.ts";
import { ForbiddenError, UnauthorizedError } from "../errors/app-error.ts";
import { verifyAccessToken, type AccessTokenClaims } from "../security/jwt.ts";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace -- the way to extend Express' Request type
  namespace Express {
    interface Request {
      auth?: AccessTokenClaims;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- generic parsed query storage
      parsedQuery?: any;
    }
  }
}

/** Requires a valid `Authorization: Bearer <access token>` header */
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
