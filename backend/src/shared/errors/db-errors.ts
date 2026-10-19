/** Returns true if the error is a PostgreSQL unique-constraint violation (code 23505) */
export function isUniqueViolation(err: unknown): boolean {
  return isPgError(err, "23505");
}

/**
 * Returns true if the error is a PostgreSQL foreign-key violation (code 23503).
 * Raised on INSERT/UPDATE with a missing reference, and also on DELETE of a row
 * that still has dependents under ON DELETE RESTRICT.
 */
export function isForeignKeyViolation(err: unknown): boolean {
  return isPgError(err, "23503");
}

function isPgError(err: unknown, code: string): boolean {
  const cause =
    err instanceof Error && err.cause !== undefined ? err.cause : err;
  return (
    typeof cause === "object" &&
    cause !== null &&
    "code" in cause &&
    (cause as Record<string, unknown>).code === code
  );
}
