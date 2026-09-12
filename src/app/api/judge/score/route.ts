import { NextResponse } from "next/server";
import { getJudgeSession } from "@/lib/hackathon/sessions";
import {
  getHackathonRoundById,
  getHackathonCriteria,
  getHackathonTeamById,
  getHackathonScores,
  saveHackathonScore,
  logHackathonActivity,
} from "@/lib/hackathon/data";
import { calculateJudgeNormalizedScore } from "@/lib/hackathon/scoring";
import { checkRateLimit } from "@/lib/rate-limiter";
import { HACKATHON_CONSTANTS, HackathonScore } from "@/lib/hackathon/constants";

export async function POST(request: Request) {
  const session = await getJudgeSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized judge session." }, { status: 401 });
  }

  // Rate Limiting
  const rate = checkRateLimit(
    `judge-score-${session.judgeId}`,
    HACKATHON_CONSTANTS.RATE_LIMITS.JUDGE_SCORE.limit,
    HACKATHON_CONSTANTS.RATE_LIMITS.JUDGE_SCORE.windowMs
  );
  if (!rate.allowed) {
    return NextResponse.json(
      { error: `Rate limit reached. Please wait ${rate.retryAfterSeconds}s before submitting again.` },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const { roundId, teamId, criterionScores, feedback } = body;

    if (!roundId || !teamId || !criterionScores || typeof criterionScores !== "object") {
      return NextResponse.json({ error: "Missing roundId, teamId, or criterionScores." }, { status: 400 });
    }

    // 1. Verify round
    const round = await getHackathonRoundById(roundId);
    if (!round || round.eventId !== session.eventId) {
      return NextResponse.json({ error: "Round not found in this hackathon." }, { status: 404 });
    }

    if (round.status !== "active" && round.status !== "scoring") {
      return NextResponse.json(
        { error: `Scoring is locked. Round status is '${round.status}'.` },
        { status: 400 }
      );
    }

    // 2. Verify team
    const team = await getHackathonTeamById(teamId);
    if (!team || team.eventId !== session.eventId) {
      return NextResponse.json({ error: "Team not found in this hackathon." }, { status: 404 });
    }

    if (team.disqualified) {
      return NextResponse.json({ error: "Team has been disqualified and cannot be scored." }, { status: 400 });
    }

    // 3. Strict single evaluation constraint: check if team was already evaluated in this round
    const allScores = await getHackathonScores(session.eventId, roundId);
    const existingScore = allScores.find((s) => s.roundId === roundId && s.teamId === teamId);

    let isRevision = false;
    if (existingScore) {
      const isRevisionAllowed = existingScore.changeRequested === true || round.allowRevisions === true;
      if (!isRevisionAllowed) {
        return NextResponse.json(
          {
            error: "This team has already been evaluated for this round. Multiple evaluations are strictly forbidden.",
          },
          { status: 409 }
        );
      }
      if (existingScore.judgeId !== session.judgeId) {
        return NextResponse.json(
          {
            error: "Score revision was requested for the original evaluator. You cannot overwrite another evaluator's assessment.",
          },
          { status: 403 }
        );
      }
      isRevision = true;
    }

    // 3. Verify criteria and compute scores
    const allCriteria = await getHackathonCriteria(session.eventId, roundId);
    if (allCriteria.length === 0) {
      return NextResponse.json({ error: "No scoring criteria configured for this round." }, { status: 400 });
    }

    const validatedCriterionScores: Record<string, number> = {};
    for (const crit of allCriteria) {
      const raw = criterionScores[crit.id];
      const val = typeof raw === "number" ? raw : parseFloat(raw);
      if (isNaN(val) || val < 0 || val > crit.maxMarks) {
        return NextResponse.json(
          { error: `Invalid score for '${crit.name}'. Must be between 0 and ${crit.maxMarks}.` },
          { status: 400 }
        );
      }
      validatedCriterionScores[crit.id] = val;
    }

    const { totalAwarded, totalMax, normalized } = calculateJudgeNormalizedScore(
      validatedCriterionScores,
      allCriteria
    );

    const scoreRecord: HackathonScore = {
      id: `score-${session.judgeId}-${teamId}-${roundId}`,
      eventId: session.eventId,
      roundId,
      judgeId: session.judgeId,
      teamId,
      criterionScores: validatedCriterionScores,
      totalMarksAwarded: totalAwarded,
      totalMaxPossible: totalMax,
      normalizedScore: normalized,
      feedback: typeof feedback === "string" ? feedback.trim().slice(0, 500) : undefined,
      submittedAt: new Date().toISOString(),
    };

    const res = await saveHackathonScore(scoreRecord, isRevision);
    if (!res.ok) {
      return NextResponse.json({ error: res.error || "Failed to record score." }, { status: 409 });
    }

    await logHackathonActivity({
      eventId: session.eventId,
      action: isRevision ? `Score Revised & Resubmitted for Team ${team.teamCode}` : "Score Submitted",
      actorType: "judge",
      actorId: session.judgeId,
      details: {
        teamId,
        teamCode: team.teamCode,
        roundId,
        normalizedScore: normalized,
        isRevision,
        judgeName: session.name,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Score successfully locked and recorded.",
      score: {
        totalAwarded,
        totalMax,
        normalizedScore: normalized,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Scoring operation failed." }, { status: 500 });
  }
}
