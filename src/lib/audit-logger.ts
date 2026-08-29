import { readData, writeData } from "@/lib/local-db";
import { jwtVerify } from "jose";
import { cookies } from "next/headers";

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
export async function getAdminEmailFromRequest(request?: Request): Promise<string> {
  try {
    // 1. Try Next.js App Router cookies()
    try {
      const cookieStore = await cookies();
      const token = cookieStore.get("admin-token")?.value;
      if (token) {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        if (payload.email && typeof payload.email === "string") {
          return payload.email;
        }
      }
    } catch {}

    // 2. Try Request Headers cookie
    if (request) {
      const cookieHeader = request.headers.get("cookie") || "";
      const match = cookieHeader.match(/(?:^|;\s*)admin-token=([^;]+)/);
      if (match && match[1]) {
        const { payload } = await jwtVerify(match[1].trim(), JWT_SECRET);
        if (payload.email && typeof payload.email === "string") {
          return payload.email;
        }
      }
    }
  } catch {}
  return "priyanshushaurya9431@gmail.com";
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

/**
 * Purges all historical audit logs and writes an initial reset entry
 */
export async function clearAuditLogs(adminEmail: string = "priyanshushaurya9431@gmail.com"): Promise<boolean> {
  const initialLog: AuditLogEntry = {
    id: `log-${Date.now()}-init`,
    timestamp: new Date().toISOString(),
    adminEmail,
    action: "Audit Trail Cleared & Initialized",
    details: "Historical logs purged by administrator. Fresh audit logging active.",
    status: "success",
  };
  return writeData("audit-logs.json", [initialLog]);
}

/**
 * Deletes a single audit log entry by ID (Root Admin only)
 */
export async function deleteAuditLog(id: string): Promise<boolean> {
  try {
    const existingLogs = await readData<AuditLogEntry[]>("audit-logs.json", []);
    const updated = existingLogs.filter((log) => log.id !== id);
    return writeData("audit-logs.json", updated);
  } catch (error) {
    console.error("[AuditLogger] Failed to delete audit log entry:", error);
    return false;
  }
}
