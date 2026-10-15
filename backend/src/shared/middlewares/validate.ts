import type { RequestHandler } from "express";
import { z } from "zod";
import { ValidationError } from "../errors/app-error.ts";

/** Validates req.body and replaces it with the parsed (trimmed, normalized) data */
export function validateBody(schema: z.ZodType): RequestHandler {
  return (req, _res, next) => {
    const result = schema.safeParse(req.body ?? {});

    if (!result.success) {
      const { formErrors, fieldErrors } = z.flattenError(result.error);
      const details: Record<string, string[]> = { ...fieldErrors };

      if (formErrors.length > 0) details._ = formErrors;
      throw new ValidationError(details);
    }
    req.body = result.data;
    next();
  };
}

/** Validates req.query and attaches the parsed (coerced, normalized) data as req.parsedQuery */
export function validateQuery(schema: z.ZodType): RequestHandler {
  return (req, _res, next) => {
    const result = schema.safeParse(req.query ?? {});

    if (!result.success) {
      const { formErrors, fieldErrors } = z.flattenError(result.error);
      const details: Record<string, string[]> = { ...fieldErrors };

      if (formErrors.length > 0) details._ = formErrors;
      throw new ValidationError(details);
    }
    req.parsedQuery = result.data;
    next();
  };
}
