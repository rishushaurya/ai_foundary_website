import { NextResponse } from "next/server";
import { getAuditLogs, clearAuditLogs, getAdminEmailFromRequest, logAdminAction } from "@/lib/audit-logger";

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
    const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";
    const ROOT_ADMIN = "priyanshushaurya9431@gmail.com";

    if (adminEmail.toLowerCase() !== ROOT_ADMIN.toLowerCase()) {
      await logAdminAction({
        adminEmail,
        ip,
        action: "Unauthorized Purge Attempt",
        details: `Access Denied: User '${adminEmail}' attempted to purge audit trail without root authority.`,
        status: "error",
      });

      return NextResponse.json(
        {
          error: `Access Denied: Only the root administrator (${ROOT_ADMIN}) is authorized to purge audit logs.`,
        },
        { status: 403 }
      );
    }

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
