import { NextResponse } from "next/server";
import { getAuditLogs, clearAuditLogs, getAdminEmailFromRequest } from "@/lib/audit-logger";

export async function GET() {
  try {
    const logs = await getAuditLogs();
    return NextResponse.json(logs);
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to fetch audit logs" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const adminEmail = await getAdminEmailFromRequest(request);
    await clearAuditLogs(adminEmail);
    const updated = await getAuditLogs();
    return NextResponse.json({
      success: true,
      message: "Audit logs purged successfully",
      logs: updated,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to clear audit logs" }, { status: 500 });
  }
}
