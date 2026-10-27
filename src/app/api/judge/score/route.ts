import { NextResponse } from "next/server";
import { getActiveJudge, isJudgeAssignedToRound } from "@/lib/hackathon/sessions";
import {
  getHackathonRounds,
  getHackathonCriteria,
  getHackathonTeams,
  getHackathonScore,
  saveHackathonScore,
  logHackathonActivity,
} from "@/lib/hackathon/data";
import { calculateJudgeNormalizedScore, getCompetingTeamsForRound } from "@/lib/hackathon/scoring";
import { validateCriterionScores } from "@/lib/hackathon/validators";
import { checkRateLimit } from "@/lib/rate-limiter";
import { HACKATHON_CONSTANTS, HackathonScore } from "@/lib/hackathon/constants";

export async function POST(request: Request) {
  const active = await getActiveJudge();
  if (!active) {
    return NextResponse.json({ error: "Unauthorized judge session." }, { status: 401 });
  }
  const { session, judge } = active;

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
    const rounds = await getHackathonRounds(session.eventId);
    const round = rounds.find((r) => r.id === roundId);
    if (!round) {
      return NextResponse.json({ error: "Round not found in this hackathon." }, { status: 404 });
    }

    if (round.status !== "active" && round.status !== "scoring") {
      return NextResponse.json(
        { error: `Scoring is locked. Round status is '${round.status}'.` },
        { status: 400 }
      );
    }

    if (!isJudgeAssignedToRound(judge, round.id)) {
      return NextResponse.json({ error: "You are not assigned to evaluate this round." }, { status: 403 });
    }

    // 2. Verify the team is actually competing in this round (not eliminated earlier, not disqualified)
    const teams = await getHackathonTeams(session.eventId);
    const team = teams.find((t) => t.id === teamId);
    if (!team) {
      return NextResponse.json({ error: "Team not found in this hackathon." }, { status: 404 });
    }
    if (team.disqualified) {
      return NextResponse.json({ error: "Team has been disqualified and cannot be scored." }, { status: 400 });
    }
    if (!getCompetingTeamsForRound(teams, round, rounds).some((t) => t.id === teamId)) {
      return NextResponse.json({ error: "This team is not competing in this round." }, { status: 400 });
    }

    // 3. Strict single evaluation: a revision is only possible for the original evaluator, when unlocked
    const existingScore = await getHackathonScore(roundId, teamId);
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

    // 4. Validate criteria and compute scores
    const allCriteria = await getHackathonCriteria(session.eventId, roundId);
    const parsed = validateCriterionScores(criterionScores, allCriteria);
    if ("error" in parsed) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    const { totalAwarded, totalMax, normalized } = calculateJudgeNormalizedScore(parsed.scores, allCriteria);

    const scoreRecord: HackathonScore = {
      id: `score-${roundId}-${teamId}`,
      eventId: session.eventId,
      roundId,
      judgeId: session.judgeId,
      teamId,
      criterionScores: parsed.scores,
      totalMarksAwarded: totalAwarded,
      totalMaxPossible: totalMax,
      normalizedScore: normalized,
      feedback: typeof feedback === "string" ? feedback.trim().slice(0, 500) : undefined,
      submittedAt: new Date().toISOString(),
    };

    // A first submission is inserted atomically: if another judge got there first, this fails.
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
        judgeName: judge.name,
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
