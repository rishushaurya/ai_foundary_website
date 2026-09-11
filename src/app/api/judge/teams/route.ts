import { NextResponse } from "next/server";
import { getJudgeSession } from "@/lib/hackathon/sessions";
import {
  getHackathonEventById,
  getHackathonRounds,
  getHackathonCriteria,
  getHackathonTeams,
  getHackathonScores,
  getHackathonJudges,
} from "@/lib/hackathon/data";
import { getCompetingTeamsForRound } from "@/lib/hackathon/scoring";

export async function GET(request: Request) {
  const session = await getJudgeSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized judge session" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const requestedRoundId = searchParams.get("roundId");

  const event = await getHackathonEventById(session.eventId);
  if (!event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  const rounds = await getHackathonRounds(session.eventId);
  // Pick requested round, active round, or latest scoring round
  let activeRound = rounds.find((r) => r.id === requestedRoundId);
  if (!activeRound) {
    activeRound = rounds.find((r) => r.id === event.activeRoundId) ||
      rounds.find((r) => r.status === "active" || r.status === "scoring") ||
      rounds[0];
  }

  if (!activeRound) {
    return NextResponse.json({
      event: { id: event.id, title: event.title, status: event.status },
      rounds: [],
      activeRound: null,
      criteria: [],
      teams: [],
    });
  }

  // Get criteria for this round
  const allCriteria = await getHackathonCriteria(session.eventId);
  const roundCriteria = allCriteria.filter(
    (c) => c.roundId === activeRound.id || !c.roundId
  );

  // Get eligible competing teams for this round
  const allTeams = await getHackathonTeams(session.eventId);
  const eligibleTeams = getCompetingTeamsForRound(allTeams, activeRound, rounds);

  // Fetch all judges for evaluator names
  const allJudges = await getHackathonJudges(session.eventId);
  const judgesMap = new Map(allJudges.map((j) => [j.id, j.name]));

  // Get ALL scores for this round (teams can only be evaluated once per round across all judges)
  const allScores = await getHackathonScores(session.eventId, activeRound.id);
  const scoresByTeamMap = new Map(allScores.map((s) => [s.teamId, s]));

  const teamsWithStatus = eligibleTeams.map((team) => {
    const existingScore = scoresByTeamMap.get(team.id);
    const isScoredByMe = existingScore ? existingScore.judgeId === session.judgeId : false;
    const scoredByJudgeName = existingScore
      ? judgesMap.get(existingScore.judgeId) || (isScoredByMe ? session.name : "Another Evaluator")
      : null;

    return {
      id: team.id,
      teamCode: team.teamCode,
      teamName: team.teamName,
      leaderName: team.leaderName,
      members: team.members,
      finalist: team.finalist,
      isScored: !!existingScore,
      isScoredByMe,
      scoredByJudgeName,
      scoredByJudgeId: existingScore?.judgeId || null,
      canEdit: existingScore ? (isScoredByMe && existingScore.changeRequested === true) : true,
      changeRequested: existingScore ? existingScore.changeRequested === true : false,
      changeReason: existingScore?.changeReason,
      myScore: existingScore
        ? {
            id: existingScore.id,
            judgeId: existingScore.judgeId,
            scoredByJudgeName,
            isScoredByMe,
            criterionScores: existingScore.criterionScores,
            totalMarksAwarded: existingScore.totalMarksAwarded,
            totalMaxPossible: existingScore.totalMaxPossible,
            normalizedScore: existingScore.normalizedScore,
            feedback: existingScore.feedback,
            changeRequested: existingScore.changeRequested === true,
            changeReason: existingScore.changeReason,
            submittedAt: existingScore.submittedAt,
            updatedAt: existingScore.updatedAt,
          }
        : null,
    };
  });

  const searchCode = searchParams.get("search")?.trim().toUpperCase();
  const filteredTeams = searchCode
    ? teamsWithStatus.filter(
        (t) => t.teamCode.toUpperCase() === searchCode || t.teamName.toUpperCase().includes(searchCode)
      )
    : teamsWithStatus;

  return NextResponse.json({
    event: { id: event.id, title: event.title, status: event.status },
    rounds: rounds.map((r) => ({
      id: r.id,
      roundNumber: r.roundNumber,
      name: r.name,
      type: r.type,
      status: r.status,
    })),
    activeRound: {
      id: activeRound.id,
      roundNumber: activeRound.roundNumber,
      name: activeRound.name,
      type: activeRound.type,
      status: activeRound.status,
    },
    criteria: roundCriteria.map((c) => ({
      id: c.id,
      name: c.name,
      description: c.description,
      maxMarks: c.maxMarks,
      weight: c.weight,
    })),
    teams: filteredTeams,
    rosterSummary: teamsWithStatus.map((t) => ({
      id: t.id,
      teamCode: t.teamCode,
      teamName: t.teamName,
      isScored: t.isScored,
      isScoredByMe: t.isScoredByMe,
      scoredByJudgeName: t.scoredByJudgeName,
    })),
  });
}
