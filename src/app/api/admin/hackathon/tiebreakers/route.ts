import { NextResponse } from "next/server";
import {
  getHackathonTiebreakers,
  saveHackathonTiebreaker,
  logHackathonActivity,
} from "@/lib/hackathon/data";
import { sanitizeString } from "@/lib/hackathon/validators";
import { HackathonTiebreaker } from "@/lib/hackathon/constants";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const eventId = searchParams.get("eventId") || undefined;
  const roundId = searchParams.get("roundId") || undefined;

  const tiebreakers = await getHackathonTiebreakers(eventId, roundId);
  return NextResponse.json({ tiebreakers });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, eventId, roundId, teamId, rankAdjustment, reason } = body;

    if (!eventId || !roundId || !teamId || rankAdjustment === undefined || !reason) {
      return NextResponse.json(
        { error: "eventId, roundId, teamId, rankAdjustment, and reason are required." },
        { status: 400 }
      );
    }

    const tiebreaker: HackathonTiebreaker = {
      id: id || `tie-${roundId}-${teamId}`,
      eventId,
      roundId,
      teamId,
      rankAdjustment: Number(rankAdjustment),
      reason: sanitizeString(reason),
      appliedBy: "admin",
      appliedAt: new Date().toISOString(),
    };

    const ok = await saveHackathonTiebreaker(tiebreaker);
    if (!ok) {
      return NextResponse.json({ error: "Failed to persist tiebreaker." }, { status: 500 });
    }

    await logHackathonActivity({
      eventId,
      action: "Tiebreaker Adjusted",
      actorType: "admin",
      actorId: "admin",
      details: { roundId, teamId, rankAdjustment, reason: tiebreaker.reason },
    });

    return NextResponse.json({ success: true, tiebreaker });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to process tiebreaker." }, { status: 500 });
  }
}
