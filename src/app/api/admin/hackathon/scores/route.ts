import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import {
  getHackathonScore,
  getHackathonRoundById,
  getHackathonScores,
  getHackathonJudges,
  getHackathonTeams,
  getHackathonCriteria,
  saveHackathonScore,
  logHackathonActivity,
} from "@/lib/hackathon/data";
import { calculateJudgeNormalizedScore } from "@/lib/hackathon/scoring";
import { validateCriterionScores } from "@/lib/hackathon/validators";
import { getAdminEmailFromRequest } from "@/lib/audit-logger";
import { HackathonScore } from "@/lib/hackathon/constants";

export async function GET(request: Request) {
  const gate = await requireAdmin();
  if (gate instanceof NextResponse) return gate;
  const { searchParams } = new URL(request.url);
  const eventId = searchParams.get("eventId") || undefined;
  const roundId = searchParams.get("roundId") || undefined;

  const scores = await getHackathonScores(eventId, roundId);
  const judges = await getHackathonJudges(eventId);
  const teams = await getHackathonTeams(eventId);

  const judgeMap = new Map(judges.map((j) => [j.id, j.name]));
  const teamMap = new Map(teams.map((t) => [t.id, t]));

  const enriched = scores.map((s) => ({
    ...s,
    judgeName: judgeMap.get(s.judgeId) || "Judge",
    teamCode: teamMap.get(s.teamId)?.teamCode || "TEAM",
    teamName: teamMap.get(s.teamId)?.teamName || "Unknown",
  }));

  return NextResponse.json({ scores: enriched });
}

export async function POST(request: Request) {
  const gate = await requireAdmin();
  if (gate instanceof NextResponse) return gate;
  try {
    const adminEmail = await getAdminEmailFromRequest(request);
    const body = await request.json();
    const { eventId, roundId, teamId, criterionScores, feedback, reason } = body;

    if (!eventId || !roundId || !teamId || !criterionScores || typeof criterionScores !== "object") {
      return NextResponse.json({ error: "Missing required score fields." }, { status: 400 });
    }

    // An override corrects an existing evaluation; it never invents one or rewrites a decided round.
    const [existing, round] = await Promise.all([getHackathonScore(roundId, teamId), getHackathonRoundById(roundId)]);
    if (!existing || !round || round.eventId !== eventId) {
      return NextResponse.json({ error: "No submitted score to override for this team and round." }, { status: 404 });
    }
    if (round.status === "completed") {
      return NextResponse.json(
        { error: "This round is completed and its advancement is decided; scores can no longer be overridden." },
        { status: 409 }
      );
    }

    const allCriteria = await getHackathonCriteria(eventId, roundId);
    const parsed = validateCriterionScores(criterionScores, allCriteria);
    if ("error" in parsed) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    const { totalAwarded, totalMax, normalized } = calculateJudgeNormalizedScore(parsed.scores, allCriteria);

    const scoreRecord: HackathonScore = {
      id: `score-${roundId}-${teamId}`,
      eventId,
      roundId,
      judgeId: existing.judgeId,
      teamId,
      criterionScores: parsed.scores,
      totalMarksAwarded: totalAwarded,
      totalMaxPossible: totalMax,
      normalizedScore: normalized,
      feedback: typeof feedback === "string" ? feedback.trim().slice(0, 500) : undefined,
      submittedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const res = await saveHackathonScore(scoreRecord, true); // Allow admin override
    if (!res.ok) {
      return NextResponse.json({ error: res.error || "Failed to update score." }, { status: 400 });
    }

    await logHackathonActivity({
      eventId,
      action: "Admin Score Override",
      actorType: "admin",
      actorId: adminEmail,
      details: {
        teamId,
        roundId,
        judgeId: existing.judgeId,
        previousScore: existing.normalizedScore,
        normalizedScore: normalized,
        reason: typeof reason === "string" && reason.trim() ? reason.trim().slice(0, 300) : "Admin correction",
      },
    });

    return NextResponse.json({ success: true, score: scoreRecord });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to update score." }, { status: 500 });
  }
}
