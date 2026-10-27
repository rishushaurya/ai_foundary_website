import { pushLog, readLog, clearLog, removeFromLog, type LogSpec } from "@/lib/local-db";
import { randomUUID } from "crypto";
import { cookies } from "next/headers";
import { verifyRoleToken } from "@/lib/auth";

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
 * Extracts the authenticated admin email from the admin-token cookie.
 * Never falls back to a privileged identity: unverifiable callers are "unknown".
 */
export async function getAdminEmailFromRequest(_request?: Request): Promise<string> {
  const cookieStore = await cookies();
  const payload = await verifyRoleToken(cookieStore.get("admin-token")?.value, "admin");
  return typeof payload?.email === "string" ? payload.email.toLowerCase() : "unknown";
}

// Append-only capped list: concurrent writers can't drop each other's entries.
const AUDIT_LOG: LogSpec<AuditLogEntry> = { name: "audit-logs.json", max: 500 };

/**
 * Appends an entry to the persistent Audit Log trail
 */
export async function logAdminAction(entry: Omit<AuditLogEntry, "id" | "timestamp">): Promise<void> {
  try {
    await pushLog(AUDIT_LOG, {
      id: `log-${randomUUID()}`,
      timestamp: new Date().toISOString(),
      ...entry,
    });
  } catch (error) {
    console.error("[AuditLogger] Failed to write audit log entry:", error);
  }
}

/**
 * Retrieves all audit log entries (newest first)
 */
export async function getAuditLogs(): Promise<AuditLogEntry[]> {
  return readLog(AUDIT_LOG);
}

/**
 * Purges all historical audit logs and writes an initial reset entry
 */
export async function clearAuditLogs(adminEmail: string): Promise<boolean> {
  await clearLog(AUDIT_LOG);
  await pushLog(AUDIT_LOG, {
    id: `log-${randomUUID()}`,
    timestamp: new Date().toISOString(),
    adminEmail,
    action: "Audit Trail Cleared & Initialized",
    details: "Historical logs purged by administrator. Fresh audit logging active.",
    status: "success",
  });
  return true;
}

/**
 * Deletes a single audit log entry by ID (Root Admin only)
 */
export async function deleteAuditLog(id: string): Promise<boolean> {
  try {
    await removeFromLog(AUDIT_LOG, (log) => log.id === id);
    return true;
  } catch (error) {
    console.error("[AuditLogger] Failed to delete audit log entry:", error);
    return false;
  }
}
