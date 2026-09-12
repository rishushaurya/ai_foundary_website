import { NextResponse } from "next/server";
import { getAdminEmailFromRequest } from "@/lib/audit-logger";
import {
  getHackathonRounds,
  getHackathonRoundById,
  saveHackathonRound,
  deleteHackathonRound,
  logHackathonActivity,
} from "@/lib/hackathon/data";
import { sanitizeString } from "@/lib/hackathon/validators";
import { HackathonRound } from "@/lib/hackathon/constants";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const eventId = searchParams.get("eventId") || undefined;
  const rounds = await getHackathonRounds(eventId);
  return NextResponse.json({ rounds });
}

export async function POST(request: Request) {
  try {
    const adminEmail = await getAdminEmailFromRequest(request);
    const body = await request.json();
    const { id, eventId, roundNumber, name, type, status, cutoffRank, isElimination, isPublished, description } = body;

    if (!eventId || !name || roundNumber === undefined) {
      return NextResponse.json({ error: "eventId, name, and roundNumber are required." }, { status: 400 });
    }

    const roundId = id || `round-${eventId}-${roundNumber}-${Date.now()}`;
    const existing = await getHackathonRoundById(roundId);

    // Strict Sequential Lifecycle: Only one round can be active, and earlier rounds must be completed
    if (status === "active" && (!existing || existing.status !== "active")) {
      const allRounds = await getHackathonRounds(eventId);
      const otherActive = allRounds.filter((r) => r.id !== roundId && r.status === "active");
      if (otherActive.length > 0) {
        return NextResponse.json(
          {
            error: `Cannot start '${name}'. Round '${otherActive[0].name}' is currently active. Please complete it first.`,
          },
          { status: 400 }
        );
      }

      const uncompletedPrior = allRounds.filter(
        (r) => r.id !== roundId && r.roundNumber < Number(roundNumber) && r.status !== "completed"
      );
      if (uncompletedPrior.length > 0) {
        return NextResponse.json(
          {
            error: `Round ${roundNumber} cannot begin until previous round '${uncompletedPrior[0].name}' has ended and completed.`,
          },
          { status: 400 }
        );
      }
    }

    const round: HackathonRound = {
      id: roundId,
      eventId,
      roundNumber: Number(roundNumber),
      name: sanitizeString(name),
      type: type || "qualifier",
      status: status || existing?.status || "pending",
      cutoffRank: cutoffRank ? Number(cutoffRank) : undefined,
      isElimination: typeof isElimination === "boolean" ? isElimination : true,
      isPublished: typeof isPublished === "boolean" ? isPublished : (existing?.isPublished || false),
      allowRevisions: typeof body.allowRevisions === "boolean" ? body.allowRevisions : (existing?.allowRevisions || false),
      description: description ? sanitizeString(description) : undefined,
      createdAt: existing?.createdAt || new Date().toISOString(),
    };

    const ok = await saveHackathonRound(round);
    if (!ok) {
      return NextResponse.json({ error: "Failed to persist round." }, { status: 500 });
    }

    await logHackathonActivity({
      eventId,
      action: existing ? `Round Updated: ${round.name}` : `Round Created: ${round.name}`,
      actorType: "admin",
      actorId: adminEmail,
      details: { name: round.name, roundNumber: round.roundNumber, status: round.status, allowRevisions: round.allowRevisions },
    });

    return NextResponse.json({ success: true, round });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to process round." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const adminEmail = await getAdminEmailFromRequest(request);
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Round id is required." }, { status: 400 });
  }

  const existing = await getHackathonRoundById(id);
  const ok = await deleteHackathonRound(id);
  if (!ok) {
    return NextResponse.json({ error: "Failed to delete round." }, { status: 500 });
  }

  if (existing) {
    await logHackathonActivity({
      eventId: existing.eventId,
      action: `Round Deleted: ${existing.name}`,
      actorType: "admin",
      actorId: adminEmail,
      details: { id, name: existing.name, roundNumber: existing.roundNumber },
    });
  }

  return NextResponse.json({ success: true, message: "Round deleted." });
}
