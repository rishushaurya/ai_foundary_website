import { NextResponse } from "next/server";
import {
  getAuditLogs,
  clearAuditLogs,
  deleteAuditLog,
  getAdminEmailFromRequest,
  logAdminAction,
} from "@/lib/audit-logger";

function sanitizeCSV(field: any): string {
  if (field === null || field === undefined) return '""';
  let str = String(field).replace(/"/g, '""');
  // If field starts with =, +, -, @, prepend quote to prevent formula execution in Excel
  if (/^[=+\-@]/.test(str)) {
    str = `'${str}`;
  }
  return `"${str}"`;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const exportFormat = searchParams.get("export");

    const logs = await getAuditLogs();

    // Export to Excel / CSV format (Accessible by any authorized admin)
    if (exportFormat === "excel" || exportFormat === "csv") {
      const adminEmail = await getAdminEmailFromRequest(request);
      const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";

      const headers = [
        "Log ID",
        "Timestamp (ISO UTC)",
        "Local Date & Time",
        "Administrator Email",
        "Action Performed",
        "Target Scope",
        "Details",
        "Status",
        "IP Address",
      ];

      const rows = logs.map((log) => [
        sanitizeCSV(log.id),
        sanitizeCSV(log.timestamp),
        sanitizeCSV(new Date(log.timestamp).toLocaleString()),
        sanitizeCSV(log.adminEmail),
        sanitizeCSV(log.action),
        sanitizeCSV(log.target || ""),
        sanitizeCSV(log.details || ""),
        sanitizeCSV(log.status),
        sanitizeCSV(log.ip || ""),
      ]);

      // Prepend UTF-8 BOM (\uFEFF) so Excel opens UTF-8 text and symbols properly
      const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");

      await logAdminAction({
        adminEmail,
        ip,
        action: "Exported Audit Logs",
        details: `Downloaded ${logs.length} audit trail records in Excel format`,
        status: "success",
      });

      const dateStr = new Date().toISOString().split("T")[0];
      return new NextResponse(csvContent, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="aifoundry-audit-logs-${dateStr}.csv"`,
        },
      });
    }

    return NextResponse.json(logs);
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to fetch audit logs" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const adminEmail = await getAdminEmailFromRequest(request);
    const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";
    const ROOT_ADMIN = "priyanshushaurya9431@gmail.com";

    // Strictly enforce Root Administrator authority for deleting audit records
    if (adminEmail.toLowerCase() !== ROOT_ADMIN.toLowerCase()) {
      await logAdminAction({
        adminEmail,
        ip,
        action: "Unauthorized Delete Attempt",
        details: `Access Denied: User '${adminEmail}' attempted to delete audit logs without root authority.`,
        status: "error",
      });

      return NextResponse.json(
        {
          error: `Access Denied: Only the root administrator (${ROOT_ADMIN}) is authorized to delete or purge audit records.`,
        },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const logId = searchParams.get("id");

    // Case 1: Delete a single audit log entry by ID
    if (logId) {
      const success = await deleteAuditLog(logId);
      if (!success) {
        throw new Error("Failed to delete log entry");
      }

      await logAdminAction({
        adminEmail,
        ip,
        action: "Deleted Single Audit Record",
        details: `Root Admin deleted log entry '${logId}'`,
        status: "success",
      });

      const updated = await getAuditLogs();
      return NextResponse.json({
        success: true,
        message: `Audit log record '${logId}' deleted successfully.`,
        logs: updated,
      });
    }

    // Case 2: Purge entire historical audit trail
    await clearAuditLogs(adminEmail);
    const updated = await getAuditLogs();
    return NextResponse.json({
      success: true,
      message: "Historical audit trail purged and initialized successfully.",
      logs: updated,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to delete audit logs" }, { status: 500 });
  }
}
