import { NextResponse } from "next/server";
import { getAuditLogs } from "@/lib/audit-logger";

export async function GET() {
  try {
    const logs = await getAuditLogs();
    return NextResponse.json(logs);
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to fetch audit logs" }, { status: 500 });
  }
}
