import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { getAdminEmailFromRequest } from "@/lib/audit-logger";
import { isValidJudgeWeight, judgeSharePct, roundStartBlocker } from "@/lib/hackathon/scoring";
import {
  getHackathonScores,
  getHackathonRounds,
  getHackathonRoundById,
  saveHackathonRound,
  deleteHackathonRound,
  logHackathonActivity,
} from "@/lib/hackathon/data";
import { sanitizeString } from "@/lib/hackathon/validators";
import { HackathonRound, RoundStatus, RoundType } from "@/lib/hackathon/constants";
import { randomUUID } from "crypto";

const ROUND_TYPES: RoundType[] = ["qualifier", "semi-final", "final"];
const ROUND_STATUSES: RoundStatus[] = ["pending", "active", "scoring", "completed"];

export async function GET(request: Request) {
  const gate = await requireAdmin();
  if (gate instanceof NextResponse) return gate;
  const { searchParams } = new URL(request.url);
  const eventId = searchParams.get("eventId") || undefined;
  const rounds = await getHackathonRounds(eventId);
  return NextResponse.json({ rounds });
}

export async function POST(request: Request) {
  const gate = await requireAdmin();
  if (gate instanceof NextResponse) return gate;
  try {
    const adminEmail = await getAdminEmailFromRequest(request);
    const body = await request.json();
    const { id, eventId, roundNumber, name, type, status, cutoffRank, isElimination, isPublished, description } = body;

    if (!eventId || !name || roundNumber === undefined) {
      return NextResponse.json({ error: "eventId, name, and roundNumber are required." }, { status: 400 });
    }
    if (!Number.isInteger(Number(roundNumber)) || Number(roundNumber) < 1) {
      return NextResponse.json({ error: "roundNumber must be a whole number of 1 or more." }, { status: 400 });
    }
    if (type !== undefined && !ROUND_TYPES.includes(type)) {
      return NextResponse.json({ error: `type must be one of: ${ROUND_TYPES.join(", ")}.` }, { status: 400 });
    }
    if (status !== undefined && !ROUND_STATUSES.includes(status)) {
      return NextResponse.json({ error: `status must be one of: ${ROUND_STATUSES.join(", ")}.` }, { status: 400 });
    }
    if (cutoffRank && (!Number.isInteger(Number(cutoffRank)) || Number(cutoffRank) < 1)) {
      return NextResponse.json({ error: "cutoffRank must be a whole number of 1 or more." }, { status: 400 });
    }
    const weightGiven = body.judgeWeight !== undefined && body.judgeWeight !== null && body.judgeWeight !== "";
    const judgeWeight = weightGiven ? Number(body.judgeWeight) : undefined;
    if (weightGiven && !isValidJudgeWeight(judgeWeight)) {
      return NextResponse.json({ error: "judgeWeight must be a whole number from 0 to 100 (judges' share in percent)." }, { status: 400 });
    }

    // Client-supplied ids are only accepted for editing an existing round of this event.
    const existing = id ? await getHackathonRoundById(id) : null;
    if (id && (!existing || existing.eventId !== eventId)) {
      return NextResponse.json({ error: "Round not found in this event." }, { status: 404 });
    }
    const roundId = existing?.id || `round-${randomUUID()}`;

    // Advancement walks round numbers in order and voting targets THE final round: both must be unambiguous.
    const siblings = (await getHackathonRounds(eventId)).filter((r) => r.id !== roundId);
    if (siblings.some((r) => r.roundNumber === Number(roundNumber))) {
      return NextResponse.json({ error: `Round number ${roundNumber} already exists in this event.` }, { status: 400 });
    }
    if ((type || existing?.type) === "final" && siblings.some((r) => r.type === "final")) {
      return NextResponse.json({ error: "This event already has a Final round." }, { status: 400 });
    }

    // Strict Sequential Lifecycle: one live round at a time, earlier rounds completed first
    const goingLive = status === "active" || status === "scoring";
    const wasLive = existing?.status === "active" || existing?.status === "scoring";
    if (goingLive && !wasLive) {
      const blocker = roundStartBlocker(
        { ...(existing as HackathonRound), id: roundId, name: sanitizeString(name), roundNumber: Number(roundNumber) },
        await getHackathonRounds(eventId)
      );
      if (blocker) return NextResponse.json({ error: blocker }, { status: 400 });
    }

    // Once a round has scores, its number and type define past results: keep them fixed.
    if (existing && (await getHackathonScores(eventId, existing.id)).length > 0) {
      if (Number(roundNumber) !== existing.roundNumber || (type && type !== existing.type)) {
        return NextResponse.json(
          { error: "This round already has scores. Its number and type can no longer change." },
          { status: 409 }
        );
      }
    }

    const effectiveType = type || existing?.type || "qualifier";
    const nextJudgeWeight = effectiveType === "final" ? judgeWeight ?? existing?.judgeWeight : undefined;
    // The split decides the winners: once the final is completed it is part of the locked results.
    if (existing?.status === "completed" && judgeSharePct({ judgeWeight: nextJudgeWeight }) !== judgeSharePct(existing)) {
      return NextResponse.json(
        { error: "This final is completed; changing the judge/vote split would change locked results." },
        { status: 409 }
      );
    }

    const round: HackathonRound = {
      id: roundId,
      eventId,
      roundNumber: Number(roundNumber),
      name: sanitizeString(name),
      type: effectiveType,
      status: status || existing?.status || "pending",
      cutoffRank: cutoffRank ? Number(cutoffRank) : undefined,
      isElimination: typeof isElimination === "boolean" ? isElimination : existing?.isElimination ?? true,
      isPublished: typeof isPublished === "boolean" ? isPublished : (existing?.isPublished || false),
      allowRevisions: typeof body.allowRevisions === "boolean" ? body.allowRevisions : (existing?.allowRevisions || false),
      judgeWeight: nextJudgeWeight,
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
      details: {
        name: round.name,
        roundNumber: round.roundNumber,
        status: round.status,
        allowRevisions: round.allowRevisions,
        ...(round.type === "final" ? { judgeWeight: judgeSharePct(round), voteWeight: 100 - judgeSharePct(round) } : {}),
      },
    });

    return NextResponse.json({ success: true, round });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to process round." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const gate = await requireAdmin();
  if (gate instanceof NextResponse) return gate;
  const adminEmail = await getAdminEmailFromRequest(request);
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Round id is required." }, { status: 400 });
  }

  const existing = await getHackathonRoundById(id);
  if (existing && (await getHackathonScores(existing.eventId, id)).length > 0) {
    return NextResponse.json(
      { error: "This round already has judge scores and cannot be deleted." },
      { status: 409 }
    );
  }
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
