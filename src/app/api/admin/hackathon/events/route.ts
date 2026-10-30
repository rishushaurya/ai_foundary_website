import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import {
  getHackathonEvents,
  getHackathonEventById,
  saveHackathonEvent,
  deleteHackathonEvent,
  logHackathonActivity,
} from "@/lib/hackathon/data";
import { sanitizeString } from "@/lib/hackathon/validators";
import { EventStatus, HackathonEvent } from "@/lib/hackathon/constants";
import { getAdminEmailFromRequest, logAdminAction } from "@/lib/audit-logger";
import { clientIp, requireRootAdmin, requireAdmin } from "@/lib/auth";

const EVENT_STATUSES: EventStatus[] = ["draft", "live", "completed", "archived"];

export async function GET() {
  const gate = await requireAdmin();
  if (gate instanceof NextResponse) return gate;
  const events = await getHackathonEvents();
  return NextResponse.json({ events });
}

export async function POST(request: Request) {
  const gate = await requireAdmin();
  if (gate instanceof NextResponse) return gate;
  try {
    const adminEmail = await getAdminEmailFromRequest(request);
    const body = await request.json();
    const { id, title, description, theme, status, isVotingOpen, activeRoundId, currentRoundNumber } = body;

    if (!title || typeof title !== "string" || !sanitizeString(title)) {
      return NextResponse.json({ error: "Title is required." }, { status: 400 });
    }
    if (status !== undefined && !EVENT_STATUSES.includes(status)) {
      return NextResponse.json({ error: `Status must be one of: ${EVENT_STATUSES.join(", ")}.` }, { status: 400 });
    }

    // Client-supplied ids are only accepted for editing an existing event.
    const existing = id ? await getHackathonEventById(id) : null;
    if (id && !existing) {
      return NextResponse.json({ error: "Event not found." }, { status: 404 });
    }
    const eventId = existing?.id || `event-${randomUUID()}`;

    const event: HackathonEvent = {
      id: eventId,
      title: sanitizeString(title),
      description: sanitizeString(description || ""),
      theme: sanitizeString(theme || "AI Innovation"),
      status: status || existing?.status || "draft",
      currentRoundNumber:
        Number.isInteger(currentRoundNumber) && currentRoundNumber > 0
          ? currentRoundNumber
          : existing?.currentRoundNumber || 1,
      isVotingOpen: typeof isVotingOpen === "boolean" ? isVotingOpen : existing?.isVotingOpen || false,
      activeRoundId: activeRoundId !== undefined ? activeRoundId : existing?.activeRoundId,
      createdAt: existing?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const ok = await saveHackathonEvent(event);
    if (!ok) {
      return NextResponse.json({ error: "Failed to persist event." }, { status: 500 });
    }

    await logHackathonActivity({
      eventId: event.id,
      action: existing ? "Event Updated" : "Event Created",
      actorType: "admin",
      actorId: adminEmail,
      details: { title: event.title, status: event.status },
    });

    return NextResponse.json({ success: true, event });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to process event." }, { status: 500 });
  }
}

// Cascading purge of every round, team, score and vote: root admins only.
export async function DELETE(request: Request) {
  const root = await requireRootAdmin();
  if (root instanceof NextResponse) return root;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Event id parameter is required." }, { status: 400 });
  }

  const ok = await deleteHackathonEvent(id);
  if (!ok) {
    return NextResponse.json({ error: "Failed to delete event." }, { status: 500 });
  }

  // The event's own activity log is purged with it, so record the deletion in the site audit trail.
  await logAdminAction({
    adminEmail: root.email,
    ip: clientIp(request),
    action: "Deleted Hackathon Event",
    target: id,
    details: "Cascading purge of rounds, criteria, teams, judges, scores, votes and logs",
    status: "warning",
  });
  return NextResponse.json({ success: true, message: "Event deleted." });
}
