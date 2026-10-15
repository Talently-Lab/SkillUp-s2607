import { ipKeyGenerator, rateLimit, type Options } from "express-rate-limit";
import { TooManyRequestsError } from "../errors/app-error.ts";

const MINUTE = 60 * 1000;

// In-memory store: fine for a single instance. With several instances use a shared store (e.g. Redis)
function limiter(options: Partial<Options>) {
  return rateLimit({
    standardHeaders: "draft-8",
    legacyHeaders: false,
    handler: () => {
      throw new TooManyRequestsError();
    },
    ...options,
  });
}

/** Every /auth request from one IP */
export const authLimiter = limiter({ windowMs: 15 * MINUTE, limit: 100 });

/** New accounts from one IP */
export const registerLimiter = limiter({ windowMs: 60 * MINUTE, limit: 5 });

/** Failed logins from one IP, whatever the account */
export const loginIpLimiter = limiter({
  windowMs: 15 * MINUTE,
  limit: 20,
  skipSuccessfulRequests: true,
});

/** Failed logins against one account from one IP */
export const loginAccountLimiter = limiter({
  windowMs: 15 * MINUTE,
  limit: 5,
  skipSuccessfulRequests: true,
  keyGenerator: (req) => {
    const body: unknown = req.body;
    const email =
      typeof body === "object" &&
      body !== null &&
      "email" in body &&
      typeof body.email === "string"
        ? body.email.trim().toLowerCase()
        : "";
    return `${ipKeyGenerator(req.ip ?? "unknown")}:${email}`;
  },
});
