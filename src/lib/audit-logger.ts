import { readData, writeData } from "@/lib/local-db";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "ai-foundry-dev-jwt-secret-key-2026"
);

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  adminEmail: string;
  ip?: string;
  action: string;
  target?: string;
  details?: string;
  status: "success" | "warning" | "error";
}

/**
 * Extracts authenticated admin email from request session cookie
 */
export async function getAdminEmailFromRequest(request: Request): Promise<string> {
  try {
    const cookieHeader = request.headers.get("cookie") || "";
    const match = cookieHeader.match(/admin-token=([^;]+)/);
    if (match && match[1]) {
      const { payload } = await jwtVerify(match[1], JWT_SECRET);
      if (payload.email && typeof payload.email === "string") {
        return payload.email;
      }
    }
  } catch {}
  return "admin@aifoundry.club";
}

/**
 * Appends an entry to the persistent Audit Log trail
 */
export async function logAdminAction(entry: Omit<AuditLogEntry, "id" | "timestamp">): Promise<void> {
  try {
    const existingLogs = await readData<AuditLogEntry[]>("audit-logs.json", []);
    const newLog: AuditLogEntry = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
      ...entry,
    };

    // Keep last 500 audit log entries to manage storage efficiently
    const updated = [newLog, ...existingLogs].slice(0, 500);
    await writeData("audit-logs.json", updated);
  } catch (error) {
    console.error("[AuditLogger] Failed to write audit log entry:", error);
  }
}

/**
 * Retrieves all audit log entries
 */
export async function getAuditLogs(): Promise<AuditLogEntry[]> {
  return readData<AuditLogEntry[]>("audit-logs.json", []);
}
