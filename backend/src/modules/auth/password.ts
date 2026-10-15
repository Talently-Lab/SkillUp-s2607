import { hash, verify } from "@node-rs/argon2";

// @node-rs/argon2 defaults to argon2id with the parameters OWASP recommends
export function hashPassword(password: string) {
  return hash(password);
}

export async function verifyPassword(passwordHash: string, password: string) {
  try {
    return await verify(passwordHash, password);
  } catch {
    return false;
  }
}

// Compared against when the email doesn't exist, so both cases take the same time
const dummyHash = await hash("timing-attack-dummy-password");

export async function verifyDummyPassword(password: string) {
  await verifyPassword(dummyHash, password);
  return false;
}
