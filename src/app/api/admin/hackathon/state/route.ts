import { NextResponse } from "next/server";
import {
  getHackathonEventById,
  saveHackathonEvent,
  getHackathonRounds,
  saveHackathonRound,
  logHackathonActivity,
} from "@/lib/hackathon/data";
import { getAdminEmailFromRequest } from "@/lib/audit-logger";
import { roundStartBlocker } from "@/lib/hackathon/scoring";

export async function POST(request: Request) {
  try {
    const adminEmail = await getAdminEmailFromRequest(request);
    const body = await request.json();
    const { eventId, status, isVotingOpen, activeRoundId, roundStatus, roundId, isPublished } = body;

    if (!eventId) {
      return NextResponse.json({ error: "eventId is required." }, { status: 400 });
    }

    const event = await getHackathonEventById(eventId);
    if (!event) {
      return NextResponse.json({ error: "Event not found." }, { status: 404 });
    }
    const rounds = await getHackathonRounds(eventId);

    const updates: string[] = [];

    if (status && ["draft", "live", "completed", "archived"].includes(status)) {
      event.status = status;
      updates.push(`Event status -> ${status}`);
    }

    if (typeof isVotingOpen === "boolean") {
      const finalRound = rounds.find((r) => r.type === "final");
      if (isVotingOpen && !finalRound) {
        return NextResponse.json(
          { error: "Add a Final round before opening audience voting." },
          { status: 400 }
        );
      }
      if (isVotingOpen && (finalRound?.status === "completed" || event.status === "completed")) {
        return NextResponse.json(
          { error: "The final is completed; re-opening voting would change locked results." },
          { status: 409 }
        );
      }
      event.isVotingOpen = isVotingOpen;
      updates.push(`Voting ${isVotingOpen ? "Opened" : "Closed"}`);
    }

    if (activeRoundId !== undefined) {
      const target = rounds.find((r) => r.id === activeRoundId);
      if (activeRoundId && !target) {
        return NextResponse.json({ error: "Round does not belong to this event." }, { status: 400 });
      }
      event.activeRoundId = activeRoundId || undefined;
      if (target) event.currentRoundNumber = target.roundNumber;
      updates.push(`Active round -> ${target?.name || "none"}`);
    }

    // Optional round status / publishing update in the same call
    if (roundId) {
      const round = rounds.find((r) => r.id === roundId);
      if (!round) {
        return NextResponse.json({ error: "Round not found in this event." }, { status: 404 });
      }
      if (roundStatus && ["pending", "active", "scoring", "completed"].includes(roundStatus)) {
        const goingLive = roundStatus === "active" || roundStatus === "scoring";
        const wasLive = round.status === "active" || round.status === "scoring";
        if (goingLive && !wasLive) {
          const blocker = roundStartBlocker(round, rounds);
          if (blocker) return NextResponse.json({ error: blocker }, { status: 400 });
        }
        round.status = roundStatus;
        updates.push(`Round ${round.name} status -> ${roundStatus}`);
        if (goingLive) {
          // Judges and the public board follow the live round automatically.
          event.activeRoundId = round.id;
          event.currentRoundNumber = round.roundNumber;
        }
      }
      if (typeof isPublished === "boolean") {
        round.isPublished = isPublished;
        updates.push(`Round ${round.name} scores ${isPublished ? "Published Live" : "Unpublished"}`);
      }
      await saveHackathonRound(round);
    }

    const ok = await saveHackathonEvent(event);
    if (!ok) {
      return NextResponse.json({ error: "Failed to persist event state." }, { status: 500 });
    }

    await logHackathonActivity({
      eventId,
      action: "Event State Modified",
      actorType: "admin",
      actorId: adminEmail,
      details: { updates },
    });

    return NextResponse.json({ success: true, event, updates });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to update state." }, { status: 500 });
  }
}
