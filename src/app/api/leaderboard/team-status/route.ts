import { NextResponse } from "next/server";
import { getParticipantSession, getVerifiedParticipant } from "@/lib/hackathon/sessions";
import {
  getHackathonEventById,
  getHackathonRounds,
  getHackathonCriteria,
  getHackathonScores,
  getHackathonVotes,
  getHackathonTeams,
  getHackathonTiebreakers,
  getActiveTeamSession,
  endTeamSession,
} from "@/lib/hackathon/data";
import { canTeamVote, computeStandings, getCompetingTeamsForRound, judgeSharePct } from "@/lib/hackathon/scoring";
import { HACKATHON_CONSTANTS } from "@/lib/hackathon/constants";

function clearParticipantCookie(response: NextResponse): NextResponse {
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

export async function GET() {
  const participant = await getVerifiedParticipant();
  if (participant.status === "anonymous") {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
  if (participant.status !== "ok") {
    // Enforce single-device session integrity (replaced by another device or reset by an admin)
    return clearParticipantCookie(
      NextResponse.json(
        {
          authenticated: false,
          sessionRevoked: participant.status === "revoked",
          error:
            participant.status === "revoked"
              ? "Session ended: This team account was accessed from another device or reset by an administrator."
              : "Team record not found.",
        },
        { status: 401 }
      )
    );
  }
  const { team } = participant;

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

  const myVote = allVotes.find((v) => v.voterTeamId === team.id);
  const hasVoted = !!myVote;
  const finalRound = rounds.find((r) => r.type === "final");

  // Votes this team received in the final, counted by the same rule as the ranking (eligible voters only)
  const eligibleVoters = new Set(allTeams.filter(canTeamVote).map((t) => t.id));
  const totalVotesReceived = allVotes.filter(
    (v) => v.candidateTeamId === team.id && v.roundId === finalRound?.id && eligibleVoters.has(v.voterTeamId)
  ).length;

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
          // Exception: a disqualified team still sees the Round 1 rank its evaluations earned
          const asCompeting = allTeams.map((t) => (t.id === team.id ? { ...t, disqualified: false } : t));
          const mine = computeStandings(round, rounds, asCompeting, allScores, allVotes, allCriteria, allTiebreakers).find(
            (r) => r.teamId === team.id
          );
          if (mine && mine.judgeScoresCount > 0) {
            roundRank = mine.rank;
            roundFinalScore = mine.finalScore;
            criteriaBreakdown = mine.criteriaBreakdown;
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
        // Normal competing team: same standings as the public board and the admin preview
        const roundLeaderboard = computeStandings(
          round,
          rounds,
          allTeams,
          allScores,
          allVotes,
          allCriteria,
          allTiebreakers
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

  // Same eligibility the vote endpoint enforces, so the ballot never shows a vote that would be refused
  const votingLive =
    event.isVotingOpen && event.status !== "completed" && !!finalRound && finalRound.status !== "completed";
  const canVote = votingLive && canTeamVote(team) && !hasVoted;

  const finalistCandidates =
    canVote && finalRound
      ? getCompetingTeamsForRound(allTeams, finalRound, rounds)
          .filter((t) => t.id !== team.id)
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
      judgeWeight: finalRound ? judgeSharePct(finalRound) : undefined,
    },
  });
}

export async function DELETE() {
  // Only the device holding the active session can free it; a replaced device just drops its cookie.
  try {
    const session = await getParticipantSession();
    if (session?.teamId) {
      const active = await getActiveTeamSession(session.teamId);
      if (active && active.sessionId === session.sessionId) await endTeamSession(session.teamId);
    }
  } catch {
    // Ignore error on logout cleanup
  }

  return clearParticipantCookie(NextResponse.json({ success: true, message: "Logged out" }));
}
