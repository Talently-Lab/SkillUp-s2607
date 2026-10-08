import type { RequestHandler } from "express";
import { NotFoundError } from "./app-error.ts";

export const notFound: RequestHandler = (req) => {
  throw new NotFoundError(`Route ${req.method} ${req.originalUrl} not found`);
};
