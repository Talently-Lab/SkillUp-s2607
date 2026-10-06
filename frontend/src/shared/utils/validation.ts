// This regex checks for the presence of an "@" symbol, ensures that there are no spaces, and verifies that there is a domain with a valid extension.
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(value: string): boolean {
  return EMAIL_REGEX.test(value.trim());
}

export type PasswordStrength = 0 | 1 | 2 | 3;

const DECIMAL = /\d/;
const UPPERCASE = /[A-Z]/;
const CASE_AND_NUMBERS = /[^A-Za-z0-9]/;

/** 0 = empty, 1 = weak, 2 = fair, 3 = strong */
export function getPasswordStrength(value: string): PasswordStrength {
  if (!value) return 0;
  let score = 0;

  if (value.length >= 8) score += 1;
  if (DECIMAL.test(value)) score += 1;
  if (UPPERCASE.test(value) || CASE_AND_NUMBERS.test(value)) score += 1;

  return Math.max(1, score) as PasswordStrength;
}
