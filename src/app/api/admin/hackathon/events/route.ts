import { NextResponse } from "next/server";
import {
  getHackathonEvents,
  getHackathonEventById,
  saveHackathonEvent,
  deleteHackathonEvent,
  logHackathonActivity,
} from "@/lib/hackathon/data";
import { sanitizeString } from "@/lib/hackathon/validators";
import { HackathonEvent } from "@/lib/hackathon/constants";

export async function GET() {
  const events = await getHackathonEvents();
  return NextResponse.json({ events });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, title, description, theme, status, isVotingOpen, activeRoundId, currentRoundNumber } = body;

    if (!title || typeof title !== "string") {
      return NextResponse.json({ error: "Title is required." }, { status: 400 });
    }

    const eventId = id || `event-${Date.now()}`;
    const existing = await getHackathonEventById(eventId);

    const event: HackathonEvent = {
      id: eventId,
      title: sanitizeString(title),
      description: sanitizeString(description || ""),
      theme: sanitizeString(theme || "AI Innovation"),
      status: status || existing?.status || "draft",
      currentRoundNumber: typeof currentRoundNumber === "number" ? currentRoundNumber : (existing?.currentRoundNumber || 1),
      isVotingOpen: typeof isVotingOpen === "boolean" ? isVotingOpen : (existing?.isVotingOpen || false),
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
      actorId: "admin",
      details: { title: event.title, status: event.status },
    });

    return NextResponse.json({ success: true, event });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to process event." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Event id parameter is required." }, { status: 400 });
  }

  const ok = await deleteHackathonEvent(id);
  if (!ok) {
    return NextResponse.json({ error: "Failed to delete event." }, { status: 500 });
  }

  await logHackathonActivity({
    eventId: id,
    action: "Event Deleted",
    actorType: "admin",
    actorId: "admin",
    details: { id },
  });

  return NextResponse.json({ success: true, message: "Event deleted." });
}
