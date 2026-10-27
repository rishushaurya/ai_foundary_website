import { NextResponse } from "next/server";
import { getHackathonLogs, deleteHackathonLog, clearHackathonLogs } from "@/lib/hackathon/data";
import { requireRootAdmin } from "@/lib/auth";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const eventId = searchParams.get("eventId");
  if (!eventId) {
    return NextResponse.json({ error: "eventId is required." }, { status: 400 });
  }
  const logs = await getHackathonLogs(eventId);
  return NextResponse.json({ logs });
}

// Erasing audit history is a root-only action.
export async function DELETE(request: Request) {
  const root = await requireRootAdmin();
  if (root instanceof NextResponse) return root;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const clearAll = searchParams.get("all") === "true";
  const eventId = searchParams.get("eventId");

  if (!eventId) {
    return NextResponse.json({ error: "eventId is required." }, { status: 400 });
  }

  if (clearAll) {
    await clearHackathonLogs(eventId);
    return NextResponse.json({ success: true, message: "Audit logs cleared." });
  }

  if (id) {
    await deleteHackathonLog(eventId, id);
    return NextResponse.json({ success: true, message: "Log entry deleted." });
  }

  return NextResponse.json({ error: "id or all=true required" }, { status: 400 });
}
