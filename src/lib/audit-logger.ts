import { readData, writeData } from "@/lib/local-db";

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  adminEmail: string;
  ip: string;
  action: string;
  target?: string;
  details?: string;
  status: "success" | "warning" | "error";
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
