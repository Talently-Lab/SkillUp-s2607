/** Returns true if the error is a PostgreSQL unique-constraint violation (code 23505) */
export function isUniqueViolation(err: unknown): boolean {
  const cause =
    err instanceof Error && err.cause !== undefined ? err.cause : err;
  return (
    typeof cause === "object" &&
    cause !== null &&
    "code" in cause &&
    (cause as Record<string, unknown>).code === "23505"
  );
}
