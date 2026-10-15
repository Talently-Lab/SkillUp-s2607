import type { CookieOptions, Request, RequestHandler, Response } from "express";
import { isProd } from "../../config/env.ts";
import { authService, type Session } from "./auth.service.ts";
import type { LoginInput, RegisterInput } from "./auth.schemas.ts";

export const REFRESH_COOKIE = "refresh_token";
export const AUTH_BASE_PATH = "/api/v1/auth";

const refreshCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: "lax",
  path: AUTH_BASE_PATH,
};

function readRefreshCookie(req: Request): string | undefined {
  const cookies = req.cookies as Record<string, unknown> | undefined;
  const value = cookies?.[REFRESH_COOKIE];

  return typeof value === "string" ? value : undefined;
}

function sendSession(res: Response, status: number, session: Session) {
  const { refreshToken, refreshTokenExpiresAt, ...body } = session;
  res
    .cookie(REFRESH_COOKIE, refreshToken, {
      ...refreshCookieOptions,
      expires: refreshTokenExpiresAt,
    })
    .set("Cache-Control", "no-store")
    .status(status)
    .json(body);
}

export const authController = {
  register: (async (req, res) => {
    sendSession(
      res,
      201,
      await authService.register(req.body as RegisterInput),
    );
  }) satisfies RequestHandler,

  login: (async (req, res) => {
    sendSession(res, 200, await authService.login(req.body as LoginInput));
  }) satisfies RequestHandler,

  refresh: (async (req, res) => {
    try {
      sendSession(res, 200, await authService.refresh(readRefreshCookie(req)));
    } catch (err) {
      res.clearCookie(REFRESH_COOKIE, refreshCookieOptions);
      throw err;
    }
  }) satisfies RequestHandler,

  logout: (async (req, res) => {
    await authService.logout(readRefreshCookie(req));
    res.clearCookie(REFRESH_COOKIE, refreshCookieOptions).status(204).end();
  }) satisfies RequestHandler,

  me: (async (req, res) => {
    const user = await authService.me(req.auth!.userId);
    res.set("Cache-Control", "no-store").json({ user });
  }) satisfies RequestHandler,
};
