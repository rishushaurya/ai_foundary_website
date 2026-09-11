import { NextResponse } from "next/server";
import { getHackathonLogs, deleteHackathonLog, clearHackathonLogs } from "@/lib/hackathon/data";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const eventId = searchParams.get("eventId") || undefined;
  const logs = await getHackathonLogs(eventId);
  return NextResponse.json({ logs });
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const clearAll = searchParams.get("all") === "true";
  const eventId = searchParams.get("eventId") || undefined;

  if (clearAll) {
    await clearHackathonLogs(eventId);
    return NextResponse.json({ success: true, message: "Audit logs cleared." });
  }

  if (id) {
    await deleteHackathonLog(id);
    return NextResponse.json({ success: true, message: "Log entry deleted." });
  }

  return NextResponse.json({ error: "id or all=true required" }, { status: 400 });
}
