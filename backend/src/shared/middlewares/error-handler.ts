import type { ErrorRequestHandler } from "express";
import { AppError } from "../errors/app-error.ts";

function bodyParserError(err: unknown) {
  if (typeof err !== "object" || err === null || !("type" in err)) return null;

  if (err.type === "entity.parse.failed")
    return new AppError(400, "INVALID_JSON", "Request body is not valid JSON");

  if (err.type === "entity.too.large")
    return new AppError(413, "PAYLOAD_TOO_LARGE", "Request body is too large");

  return null;
}

export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  const appError = err instanceof AppError ? err : bodyParserError(err);

  if (appError) {
    res.status(appError.statusCode).json({
      error: {
        code: appError.code,
        message: appError.message,
        ...(appError.details && { details: appError.details }),
      },
    });
    return;
  }

  req.log.error({ err }, "unhandled error");
  res.status(500).json({
    error: {
      code: "INTERNAL_ERROR",
      message: "Internal server error",
    },
  });
};
