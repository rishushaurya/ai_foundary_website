import { NextResponse } from "next/server";
import {
  getHackathonScores,
  getHackathonCriteria,
  saveHackathonCriteria,
  deleteHackathonCriteria,
  copyCriteriaFromRound,
  logHackathonActivity,
} from "@/lib/hackathon/data";
import { sanitizeString } from "@/lib/hackathon/validators";
import { HackathonCriteria } from "@/lib/hackathon/constants";
import { getAdminEmailFromRequest } from "@/lib/audit-logger";
import { randomUUID } from "crypto";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const eventId = searchParams.get("eventId") || undefined;
  const roundId = searchParams.get("roundId") || undefined;
  const criteria = await getHackathonCriteria(eventId, roundId);
  return NextResponse.json({ criteria });
}

export async function POST(request: Request) {
  try {
    const adminEmail = await getAdminEmailFromRequest(request);
    const body = await request.json();
    const { id, eventId, roundId, name, description, maxMarks, weight, copyFromRoundId, toRoundId } = body;

    // Changing the rubric after judges have scored would silently invalidate recorded scores.
    const scoredLock = async (targetRoundId: string | undefined) => {
      const scores = await getHackathonScores(eventId);
      return targetRoundId ? scores.some((s) => s.roundId === targetRoundId) : scores.length > 0;
    };
    const LOCKED = "Judges have already scored this round, so its criteria are locked.";

    // Handle 1-click duplication from previous round
    if (copyFromRoundId && toRoundId && eventId) {
      if (await scoredLock(toRoundId)) {
        return NextResponse.json({ error: LOCKED }, { status: 409 });
      }
      const copyRes = await copyCriteriaFromRound(eventId, copyFromRoundId, toRoundId);
      if (!copyRes.ok) {
        return NextResponse.json({ error: "No criteria found to duplicate." }, { status: 404 });
      }
      await logHackathonActivity({
        eventId,
        action: "Criteria Duplicated",
        actorType: "admin",
        actorId: adminEmail,
        details: { fromRoundId: copyFromRoundId, toRoundId, count: copyRes.count },
      });
      return NextResponse.json({ success: true, count: copyRes.count });
    }

    if (!eventId || !name) {
      return NextResponse.json({ error: "eventId and name are required." }, { status: 400 });
    }
    const marks = maxMarks === undefined || maxMarks === "" ? 10 : Number(maxMarks);
    const critWeight = weight === undefined || weight === "" ? 1.0 : Number(weight);
    if (!Number.isFinite(marks) || marks <= 0 || marks > 1000) {
      return NextResponse.json({ error: "maxMarks must be a number between 1 and 1000." }, { status: 400 });
    }
    if (!Number.isFinite(critWeight) || critWeight <= 0) {
      return NextResponse.json({ error: "weight must be a positive number." }, { status: 400 });
    }

    const critId = id || `crit-${randomUUID()}`;
    if (await scoredLock(roundId || undefined)) {
      const existing = id ? (await getHackathonCriteria(eventId)).find((c) => c.id === id) : null;
      const rubricChanged = !existing || existing.maxMarks !== marks || existing.weight !== critWeight;
      if (rubricChanged) return NextResponse.json({ error: LOCKED }, { status: 409 });
    }

    const criteria: HackathonCriteria = {
      id: critId,
      eventId,
      roundId: roundId || "",
      name: sanitizeString(name),
      description: description ? sanitizeString(description) : undefined,
      maxMarks: marks,
      weight: critWeight,
    };

    const ok = await saveHackathonCriteria(criteria);
    if (!ok) {
      return NextResponse.json({ error: "Failed to persist criteria." }, { status: 500 });
    }

    await logHackathonActivity({
      eventId,
      action: id ? "Criteria Updated" : "Criteria Created",
      actorType: "admin",
      actorId: adminEmail,
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

  const target = (await getHackathonCriteria()).find((c) => c.id === id);
  if (target) {
    const scores = await getHackathonScores(target.eventId);
    if (target.roundId ? scores.some((s) => s.roundId === target.roundId) : scores.length > 0) {
      return NextResponse.json(
        { error: "Judges have already scored this round, so its criteria are locked." },
        { status: 409 }
      );
    }
  }
  const ok = await deleteHackathonCriteria(id);
  if (!ok) {
    return NextResponse.json({ error: "Failed to delete criteria." }, { status: 500 });
  }

  return NextResponse.json({ success: true, message: "Criteria deleted." });
}
