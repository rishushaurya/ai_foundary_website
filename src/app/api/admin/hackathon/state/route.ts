import { NextResponse } from "next/server";
import {
  getHackathonEventById,
  saveHackathonEvent,
  getHackathonRoundById,
  saveHackathonRound,
  logHackathonActivity,
} from "@/lib/hackathon/data";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { eventId, status, isVotingOpen, activeRoundId, roundStatus, roundId, isPublished } = body;

    if (!eventId) {
      return NextResponse.json({ error: "eventId is required." }, { status: 400 });
    }

    const event = await getHackathonEventById(eventId);
    if (!event) {
      return NextResponse.json({ error: "Event not found." }, { status: 404 });
    }

    const updates: string[] = [];

    if (status && ["draft", "live", "completed", "archived"].includes(status)) {
      event.status = status;
      updates.push(`Event status -> ${status}`);
    }

    if (typeof isVotingOpen === "boolean") {
      event.isVotingOpen = isVotingOpen;
      updates.push(`Voting ${isVotingOpen ? "Opened" : "Closed"}`);
    }

    if (activeRoundId !== undefined) {
      event.activeRoundId = activeRoundId;
      updates.push(`Active round -> ${activeRoundId}`);
    }

    // Optional round status / publishing update in the same call
    if (roundId) {
      const round = await getHackathonRoundById(roundId);
      if (round && round.eventId === eventId) {
        if (roundStatus && ["pending", "active", "scoring", "completed"].includes(roundStatus)) {
          round.status = roundStatus;
          updates.push(`Round ${round.name} status -> ${roundStatus}`);
        }
        if (typeof isPublished === "boolean") {
          round.isPublished = isPublished;
          updates.push(`Round ${round.name} scores ${isPublished ? "Published Live" : "Unpublished"}`);
        }
        await saveHackathonRound(round);
      }
    }

    const ok = await saveHackathonEvent(event);
    if (!ok) {
      return NextResponse.json({ error: "Failed to persist event state." }, { status: 500 });
    }

    await logHackathonActivity({
      eventId,
      action: "Event State Modified",
      actorType: "admin",
      actorId: "admin",
      details: { updates },
    });

    return NextResponse.json({ success: true, event, updates });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to update state." }, { status: 500 });
  }
}
