import { jwtVerify, type JWTPayload } from "jose";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getSettings } from "@/lib/data";

// Values that have appeared in this repo or its docs: anyone can forge tokens signed with them.
const PUBLIC_SECRETS = new Set([
  "ai-foundry-dev-jwt-secret-key-2026",
  "ai-foundry-production-jwt-secret-key-2026",
  "dsu-ai-foundry-secure-jwt-key-2026",
]);

let cachedSecret: Uint8Array | null = null;

/** Single source of the JWT signing key. Fails closed in production on a missing or public secret. */
export function getJwtSecret(): Uint8Array {
  if (cachedSecret) return cachedSecret;
  const raw = (process.env.JWT_SECRET || "").trim();
  const weak = raw.length < 32 || PUBLIC_SECRETS.has(raw);
  if (weak && process.env.NODE_ENV === "production") {
    throw new Error(
      "[auth] JWT_SECRET is missing, shorter than 32 chars, or a publicly known default. " +
        "Set a random value (e.g. `openssl rand -base64 48`) in the deployment environment."
    );
  }
  if (weak) console.warn("[auth] Weak JWT_SECRET in development. Set a random one before deploying.");
  cachedSecret = new TextEncoder().encode(raw || "ai-foundry-dev-jwt-secret-key-2026");
  return cachedSecret;
}

export type TokenRole = "admin" | "judge" | "participant";

/** Verifies signature, expiry and role. A judge or participant token never passes as admin. */
export async function verifyRoleToken(token: string | undefined, role: TokenRole): Promise<JWTPayload | null> {
  if (!token) return null;
  const secret = getJwtSecret(); // outside try: a misconfigured secret must surface, not look like "logged out"
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload.role === role ? payload : null;
  } catch {
    return null;
  }
}

export interface AdminSession {
  email: string;
  isRoot: boolean;
}

// The whitelist is re-checked on every admin call (proxy and route). A few seconds of per-instance
// cache keeps a dashboard refreshing 8 endpoints from costing 16 Redis reads each time.
const WHITELIST_TTL_MS = 5000;
const globalForAuth = globalThis as unknown as {
  __aifAdminWhitelist?: { at: number; roots: string[]; admins: string[] };
};

async function adminWhitelist(): Promise<{ roots: string[]; admins: string[] }> {
  const cached = globalForAuth.__aifAdminWhitelist;
  if (cached && Date.now() - cached.at < WHITELIST_TTL_MS) return cached;
  const settings = await getSettings();
  const fresh = {
    at: Date.now(),
    roots: (settings.rootAdminEmails || []).map((e) => e.trim().toLowerCase()),
    admins: (settings.adminEmails || []).map((e) => e.trim().toLowerCase()),
  };
  globalForAuth.__aifAdminWhitelist = fresh;
  return fresh;
}

/** Call after saving settings so a removed admin loses access on this instance immediately. */
export function invalidateAdminWhitelist(): void {
  globalForAuth.__aifAdminWhitelist = undefined;
}

/** Admin token must be valid AND the email must still be whitelisted (re-checked within seconds of removal). */
export async function getAdminSessionFromToken(token: string | undefined): Promise<AdminSession | null> {
  const payload = await verifyRoleToken(token, "admin");
  const email = typeof payload?.email === "string" ? payload.email.trim().toLowerCase() : "";
  if (!email) return null;

  const { roots, admins } = await adminWhitelist();
  if (!roots.includes(email) && !admins.includes(email)) return null;
  return { email, isRoot: roots.includes(email) };
}

/** Admin session of the current request (route handlers / server components). */
export async function getAdminSession(): Promise<AdminSession | null> {
  const cookieStore = await cookies();
  return getAdminSessionFromToken(cookieStore.get("admin-token")?.value);
}

/**
 * Route-level admin gate. The proxy is the first gate; this second one means a proxy bypass
 * (Next.js has shipped several) can never expose the admin API. Returns the session or a 401.
 */
export async function requireAdmin(): Promise<AdminSession | NextResponse> {
  const admin = await getAdminSession();
  if (admin) return admin;
  return NextResponse.json({ error: "Unauthorized access: Administrator session required" }, { status: 401 });
}

/** Returns the root admin session, or a 403 response to return as-is. */
export async function requireRootAdmin(): Promise<AdminSession | NextResponse> {
  const admin = await getAdminSession();
  if (admin?.isRoot) return admin;
  return NextResponse.json({ error: "Only a Root Administrator can perform this action." }, { status: 403 });
}

/** First hop of x-forwarded-for (the header can be a comma-separated chain). */
export function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "127.0.0.1";
}
