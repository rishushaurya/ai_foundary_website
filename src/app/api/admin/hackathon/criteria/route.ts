import { NextResponse } from "next/server";
import {
  getHackathonCriteria,
  saveHackathonCriteria,
  deleteHackathonCriteria,
  copyCriteriaFromRound,
  logHackathonActivity,
} from "@/lib/hackathon/data";
import { sanitizeString } from "@/lib/hackathon/validators";
import { HackathonCriteria } from "@/lib/hackathon/constants";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const eventId = searchParams.get("eventId") || undefined;
  const roundId = searchParams.get("roundId") || undefined;
  const criteria = await getHackathonCriteria(eventId, roundId);
  return NextResponse.json({ criteria });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, eventId, roundId, name, description, maxMarks, weight, copyFromRoundId, toRoundId } = body;

    // Handle 1-click duplication from previous round
    if (copyFromRoundId && toRoundId && eventId) {
      const copyRes = await copyCriteriaFromRound(eventId, copyFromRoundId, toRoundId);
      if (!copyRes.ok) {
        return NextResponse.json({ error: "No criteria found to duplicate." }, { status: 404 });
      }
      await logHackathonActivity({
        eventId,
        action: "Criteria Duplicated",
        actorType: "admin",
        actorId: "admin",
        details: { fromRoundId: copyFromRoundId, toRoundId, count: copyRes.count },
      });
      return NextResponse.json({ success: true, count: copyRes.count });
    }

    if (!eventId || !name) {
      return NextResponse.json({ error: "eventId and name are required." }, { status: 400 });
    }

    const critId = id || `crit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

    const criteria: HackathonCriteria = {
      id: critId,
      eventId,
      roundId: roundId || "",
      name: sanitizeString(name),
      description: description ? sanitizeString(description) : undefined,
      maxMarks: maxMarks ? Number(maxMarks) : 10,
      weight: weight ? Number(weight) : 1.0,
    };

    const ok = await saveHackathonCriteria(criteria);
    if (!ok) {
      return NextResponse.json({ error: "Failed to persist criteria." }, { status: 500 });
    }

    await logHackathonActivity({
      eventId,
      action: id ? "Criteria Updated" : "Criteria Created",
      actorType: "admin",
      actorId: "admin",
      details: { name: criteria.name, maxMarks: criteria.maxMarks, roundId: criteria.roundId },
    });

    return NextResponse.json({ success: true, criteria });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to process criteria." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Criteria id is required." }, { status: 400 });
  }

  const ok = await deleteHackathonCriteria(id);
  if (!ok) {
    return NextResponse.json({ error: "Failed to delete criteria." }, { status: 500 });
  }

  return NextResponse.json({ success: true, message: "Criteria deleted." });
}
