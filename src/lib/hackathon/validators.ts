import bcrypt from "bcryptjs";
import { randomBytes, randomInt, scrypt, timingSafeEqual, type ScryptOptions } from "crypto";
import { promisify } from "util";
import type { HackathonCriteria } from "./constants";

// ---- String sanitization ----
export function sanitizeString(input: unknown): string {
  if (typeof input !== "string") return "";
  return input.trim().replace(/[<>]/g, ""); // basic XSS prevention
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ---- Secret generation (no 0/O/1/I/L so codes read back cleanly from paper or a projector) ----
const CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

export function generateSecretCode(length = 8): string {
  let code = "";
  for (let i = 0; i < length; i++) code += CODE_ALPHABET[randomInt(CODE_ALPHABET.length)];
  return code;
}

// ---- Score validation: every criterion present, numeric, within 0..maxMarks ----
export function validateCriterionScores(
  input: Record<string, unknown>,
  criteria: HackathonCriteria[]
): { scores: Record<string, number> } | { error: string } {
  if (criteria.length === 0) return { error: "No scoring criteria configured for this round." };
  const scores: Record<string, number> = {};
  for (const crit of criteria) {
    const raw = input[crit.id];
    const val = typeof raw === "number" ? raw : parseFloat(String(raw));
    if (!Number.isFinite(val) || val < 0 || val > crit.maxMarks) {
      return { error: `Invalid score for '${crit.name}'. Must be between 0 and ${crit.maxMarks}.` };
    }
    scores[crit.id] = val;
  }
  return { scores };
}

// ---- Passkey / Access code hashing ----
// Native scrypt runs on libuv's thread pool, so a burst of 600 logins never blocks the event loop
// (bcryptjs is pure JS on the main thread: 50 parallel checks took ~2.7s). Old bcrypt hashes still verify.
const scryptAsync = promisify(scrypt) as (password: string, salt: Buffer, keylen: number, options: ScryptOptions) => Promise<Buffer>;
// seniordev: N=4096 (~7ms, 4MB) suits random admin-issued codes that are rate-limited per team and
// stored retrievably anyway; raise it (hashes carry their own N) if passkeys ever become user passwords.
const SCRYPT_N = 4096;
const SCRYPT_KEYLEN = 32;

export async function hashSecret(secret: string): Promise<string> {
  const salt = randomBytes(16);
  const hash = await scryptAsync(secret, salt, SCRYPT_KEYLEN, { N: SCRYPT_N });
  return `scrypt$${SCRYPT_N}$${salt.toString("base64")}$${hash.toString("base64")}`;
}

export async function compareSecret(secret: string, hashed: string): Promise<boolean> {
  try {
    if (hashed.startsWith("scrypt$")) {
      const [, n, salt, expected] = hashed.split("$");
      const want = Buffer.from(expected, "base64");
      const got = await scryptAsync(secret, Buffer.from(salt, "base64"), want.length, { N: Number(n) });
      return timingSafeEqual(got, want);
    }
    return await bcrypt.compare(secret, hashed);
  } catch {
    return false;
  }
}
