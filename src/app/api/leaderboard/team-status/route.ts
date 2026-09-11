import { NextResponse } from "next/server";
import { getParticipantSession } from "@/lib/hackathon/sessions";
import {
  getHackathonTeamById,
  getHackathonEventById,
  getHackathonRounds,
  getHackathonCriteria,
  getHackathonScores,
  getHackathonVotes,
  getHackathonTeams,
  getHackathonTiebreakers,
  saveHackathonTeam,
} from "@/lib/hackathon/data";
import { computeRoundLeaderboard } from "@/lib/hackathon/scoring";
import { HACKATHON_CONSTANTS } from "@/lib/hackathon/constants";

export async function GET() {
  const session = await getParticipantSession();
  if (!session) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  const team = await getHackathonTeamById(session.teamId);
  if (!team) {
    return NextResponse.json({ error: "Team record not found." }, { status: 404 });
  }

  // Enforce single-device session integrity
  if (!team.allowMultipleLogins && team.activeSessionId && session.sessionId && team.activeSessionId !== session.sessionId) {
    const response = NextResponse.json(
      {
        authenticated: false,
        sessionRevoked: true,
        error: "Session ended: This team account was accessed from another device.",
      },
      { status: 401 }
    );
    response.cookies.set({
      name: HACKATHON_CONSTANTS.COOKIE_PARTICIPANT,
      value: "",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });
    return response;
  }

  const event = await getHackathonEventById(team.eventId);
  if (!event) {
    return NextResponse.json({ error: "Event not found." }, { status: 404 });
  }

  const rounds = await getHackathonRounds(team.eventId);
  const allCriteria = await getHackathonCriteria(team.eventId);
  const allScores = await getHackathonScores(team.eventId);
  const allVotes = await getHackathonVotes(team.eventId);
  const allTeams = await getHackathonTeams(team.eventId);
  const allTiebreakers = await getHackathonTiebreakers(team.eventId);

  // Check if team has cast a vote
  const myVote = allVotes.find((v) => v.voterTeamId === team.id);
  const hasVoted = !!myVote;

  // Calculate total audience votes received across the event
  const totalVotesReceived = allVotes.filter((v) => v.candidateTeamId === team.id).length;

  // Build round performance breakdown: strictly gated by round.isPublished
  const roundBreakdown = rounds.map((round) => {
    const isPublished = round.isPublished === true;
    const isFinalRound = round.type === "final";
    const isRound1 = round.roundNumber === 1;

    let mySummary = null;
    let roundRank: number | null = null;
    let roundFinalScore: number | null = null;
    let criteriaBreakdown: Record<string, { name: string; marksAwarded: number; maxMarks: number }> = {};
    let statusBadge = "Unranked";
    let isEliminatedPrior = false;

    // Check if team was eliminated in an earlier round than this one
    if (team.isEliminated && team.eliminatedInRoundId) {
      const elimRound = rounds.find((r) => r.id === team.eliminatedInRoundId);
      if (elimRound && elimRound.roundNumber < round.roundNumber) {
        isEliminatedPrior = true;
      }
    }

    if (isPublished) {
      if (team.disqualified) {
        if (isRound1) {
          // Exception: Disqualified teams can see their Round 1 rank based on Round 1 performance
          const r1Scores = allScores.filter((s) => s.roundId === round.id);
          const r1Rankings = allTeams
            .map((t) => {
              const tScores = r1Scores.filter((s) => s.teamId === t.id);
              const avg =
                tScores.length > 0
                  ? Math.round(
                      ((tScores.reduce((sum, s) => sum + s.normalizedScore, 0) / tScores.length) +
                        Number.EPSILON) *
                        100
                    ) / 100
                  : 0;
              return { teamId: t.id, score: avg };
            })
            .sort((a, b) => b.score - a.score);

          let currentRank = 1;
          for (let i = 0; i < r1Rankings.length; i++) {
            if (i > 0 && r1Rankings[i].score < r1Rankings[i - 1].score) {
              currentRank = i + 1;
            }
            if (r1Rankings[i].teamId === team.id && r1Rankings[i].score > 0) {
              roundRank = currentRank;
              break;
            }
          }

          const myR1Scores = r1Scores.filter((s) => s.teamId === team.id);
          if (myR1Scores.length > 0) {
            roundFinalScore =
              Math.round(
                ((myR1Scores.reduce((sum, s) => sum + s.normalizedScore, 0) / myR1Scores.length) +
                  Number.EPSILON) *
                  100
              ) / 100;

            const critMap = new Map(allCriteria.map((c) => [c.id, c]));
            for (const score of myR1Scores) {
              for (const [critId, marks] of Object.entries(score.criterionScores)) {
                const crit = critMap.get(critId);
                criteriaBreakdown[critId] = {
                  name: crit?.name || "Criterion",
                  marksAwarded: marks,
                  maxMarks: crit?.maxMarks || 10,
                };
              }
            }
          }
          statusBadge = roundRank ? `Rank #${roundRank}` : "Unranked";
        } else {
          // For rounds after Round 1, disqualified teams do NOT see a rank
          roundRank = null;
          roundFinalScore = null;
          statusBadge = "Disqualified";
        }
      } else if (isEliminatedPrior) {
        roundRank = null;
        roundFinalScore = null;
        statusBadge = "Eliminated in Prior Round";
      } else {
        // Normal competing team
        const roundLeaderboard = computeRoundLeaderboard(
          round.id,
          isFinalRound,
          allTeams,
          allScores,
          allVotes,
          allCriteria,
          allTiebreakers,
          round.cutoffRank
        );
        mySummary = roundLeaderboard.find((r) => r.teamId === team.id);
        if (mySummary) {
          roundRank = mySummary.rank;
          roundFinalScore = mySummary.finalScore;
          criteriaBreakdown = mySummary.criteriaBreakdown || {};
          statusBadge = mySummary.rank ? `Rank #${mySummary.rank}` : "Unranked";
        }
      }
    } else {
      statusBadge = "Pending Publication";
    }

    return {
      roundId: round.id,
      roundNumber: round.roundNumber,
      roundName: round.name,
      roundType: round.type,
      roundStatus: round.status,
      isPublished,
      evaluationPending: !isPublished,
      pendingMessage: !isPublished
        ? "Evaluation in progress. Scores will be officially revealed once this round's leaderboard is published by administrators."
        : undefined,
      rank: roundRank,
      displayRank: roundRank,
      statusBadge,
      isEliminatedPrior,
      avgJudgeScore: isPublished && mySummary ? mySummary.avgJudgeScore : roundFinalScore,
      finalScore: roundFinalScore,
      criteriaBreakdown,
      votesCount: isFinalRound && !team.isEliminated ? totalVotesReceived : isPublished ? mySummary?.votesCount : undefined,
      voteScore: isPublished ? mySummary?.voteScore : undefined,
      advanced: isPublished ? mySummary?.advanced : undefined,
      isTie: isPublished ? mySummary?.isTie : undefined,
    };
  });

  // Finalist candidates available for voting if eligible
  // Eligibility: team.isEliminated === true, event.isVotingOpen === true, !hasVoted
  const canVote = event.isVotingOpen && team.isEliminated && !hasVoted;

  const finalistCandidates = canVote
    ? allTeams
        .filter((t) => t.finalist && !t.disqualified && t.id !== team.id)
        .map((t) => ({
          id: t.id,
          teamCode: t.teamCode,
          teamName: t.teamName,
          leaderName: t.leaderName,
          members: t.members,
        }))
    : [];

  return NextResponse.json({
    authenticated: true,
    team: {
      id: team.id,
      teamCode: team.teamCode,
      teamName: team.teamName,
      leaderName: team.leaderName,
      members: team.members,
      isEliminated: team.isEliminated,
      finalist: team.finalist,
      disqualified: team.disqualified,
      votesReceived: !team.isEliminated ? totalVotesReceived : undefined,
    },
    event: {
      id: event.id,
      title: event.title,
      status: event.status,
      isVotingOpen: event.isVotingOpen,
    },
    roundBreakdown,
    voting: {
      canVote,
      hasVoted,
      votedCandidateId: myVote?.candidateTeamId,
      candidates: finalistCandidates,
    },
  });
}

export async function DELETE() {
  // Logout participant session and clear activeSessionId
  try {
    const session = await getParticipantSession();
    if (session?.teamId) {
      const team = await getHackathonTeamById(session.teamId);
      if (team) {
        team.activeSessionId = undefined;
        await saveHackathonTeam(team);
      }
    }
  } catch (err) {
    // Ignore error on logout cleanup
  }

  const response = NextResponse.json({ success: true, message: "Logged out" });
  response.cookies.set({
    name: HACKATHON_CONSTANTS.COOKIE_PARTICIPANT,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}
