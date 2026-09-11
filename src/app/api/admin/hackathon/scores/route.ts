import { NextResponse } from "next/server";
import {
  getHackathonScores,
  getHackathonJudges,
  getHackathonTeams,
  getHackathonCriteria,
  saveHackathonScore,
  logHackathonActivity,
} from "@/lib/hackathon/data";
import { calculateJudgeNormalizedScore } from "@/lib/hackathon/scoring";
import { HackathonScore } from "@/lib/hackathon/constants";

export async function GET(request: Request) {
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
  try {
    const body = await request.json();
    const { eventId, roundId, judgeId, teamId, criterionScores, feedback, reason } = body;

    if (!eventId || !roundId || !judgeId || !teamId || !criterionScores) {
      return NextResponse.json({ error: "Missing required score fields." }, { status: 400 });
    }

    const allCriteria = await getHackathonCriteria(eventId, roundId);
    const { totalAwarded, totalMax, normalized } = calculateJudgeNormalizedScore(
      criterionScores,
      allCriteria
    );

    const scoreRecord: HackathonScore = {
      id: `score-${judgeId}-${teamId}-${roundId}`,
      eventId,
      roundId,
      judgeId,
      teamId,
      criterionScores,
      totalMarksAwarded: totalAwarded,
      totalMaxPossible: totalMax,
      normalizedScore: normalized,
      feedback,
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
      actorId: "admin",
      details: {
        teamId,
        roundId,
        judgeId,
        normalizedScore: normalized,
        reason: reason || "Admin correction",
      },
    });

    return NextResponse.json({ success: true, score: scoreRecord });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to update score." }, { status: 500 });
  }
}
