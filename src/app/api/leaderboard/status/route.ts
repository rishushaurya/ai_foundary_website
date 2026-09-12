import { NextResponse } from "next/server";
import {
  getHackathonEvents,
  getHackathonRounds,
  getHackathonCriteria,
  getHackathonTeams,
  getHackathonScores,
  getHackathonVotes,
  getHackathonTiebreakers,
} from "@/lib/hackathon/data";
import { computeRoundLeaderboard, getCompetingTeamsForRound } from "@/lib/hackathon/scoring";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const requestedEventId = searchParams.get("eventId");
  const requestedRoundId = searchParams.get("roundId");

  const events = await getHackathonEvents();
  const publicEvents = events.filter((e) => e.status !== "archived");

  // If no events exist
  if (publicEvents.length === 0) {
    return NextResponse.json({
      availableEvents: [],
      event: null,
      rounds: [],
      activeRound: null,
      leaderboard: [],
      isVotingOpen: false,
    });
  }

  // Find requested event, or live event, or latest event
  let event = publicEvents.find((e) => e.id === requestedEventId);
  if (!event) {
    event = publicEvents.find((e) => e.status === "live") ||
      publicEvents.find((e) => e.status === "completed") ||
      publicEvents[0];
  }

  const rounds = await getHackathonRounds(event.id);
  let activeRound = rounds.find((r) => r.id === requestedRoundId);
  if (!activeRound) {
    activeRound = rounds.find((r) => r.id === event.activeRoundId) ||
      rounds.find((r) => r.status === "active" || r.status === "scoring") ||
      rounds[rounds.length - 1];
  }

  let leaderboard: any[] = [];
  const isPublished = activeRound?.isPublished === true;

  if (activeRound) {
    const allTeams = await getHackathonTeams(event.id);
    const competingTeams = getCompetingTeamsForRound(allTeams, activeRound, rounds);

    if (isPublished) {
      const scores = await getHackathonScores(event.id, activeRound.id);
      const votes = await getHackathonVotes(event.id, activeRound.id);
      const criteria = await getHackathonCriteria(event.id, activeRound.id);
      const tiebreakers = await getHackathonTiebreakers(event.id, activeRound.id);

      const isFinalRound = activeRound.type === "final";
      const computed = computeRoundLeaderboard(
        activeRound.id,
        isFinalRound,
        competingTeams,
        scores,
        votes,
        criteria,
        tiebreakers,
        activeRound.cutoffRank
      );

      // Filter public view: Clean display, hiding internal details
      leaderboard = computed.map((c) => ({
        teamId: c.teamId,
        teamCode: c.teamCode,
        teamName: c.teamName,
        rank: c.rank,
        finalScore: c.finalScore,
        avgJudgeScore: isFinalRound ? undefined : c.avgJudgeScore,
        voteScore: isFinalRound ? c.voteScore : undefined,
        votesCount: isFinalRound ? (c.votesCount || 0) : undefined,
        isTie: c.isTie,
        isEliminated: c.isEliminated,
        finalist: c.finalist,
        disqualified: c.disqualified,
        advanced: c.advanced,
        judgeScoresCount: c.judgeScoresCount,
      }));
    } else {
      // Draft / unpublished round: show competing roster with scores masked until admin releases marks
      leaderboard = competingTeams.map((t) => ({
        teamId: t.id,
        teamCode: t.teamCode,
        teamName: t.teamName,
        rank: null,
        finalScore: null,
        avgJudgeScore: null,
        voteScore: null,
        isEliminated: t.isEliminated,
        finalist: t.finalist,
        disqualified: t.disqualified,
      }));
    }
  }

  return NextResponse.json(
    {
      availableEvents: publicEvents.map((e) => ({
        id: e.id,
        title: e.title,
        description: e.description,
        theme: e.theme,
        status: e.status,
        currentRoundNumber: e.currentRoundNumber,
      })),
      event: {
        id: event.id,
        title: event.title,
        description: event.description,
        theme: event.theme,
        status: event.status,
        currentRoundNumber: event.currentRoundNumber,
        isVotingOpen: event.isVotingOpen,
      },
      rounds: rounds.map((r) => ({
        id: r.id,
        roundNumber: r.roundNumber,
        name: r.name,
        type: r.type,
        status: r.status,
        cutoffRank: r.cutoffRank,
        isElimination: r.isElimination,
        isPublished: r.isPublished === true,
      })),
      activeRound: activeRound
        ? {
            id: activeRound.id,
            roundNumber: activeRound.roundNumber,
            name: activeRound.name,
            type: activeRound.type,
            status: activeRound.status,
            cutoffRank: activeRound.cutoffRank,
            isPublished,
          }
        : null,
      leaderboard,
      isVotingOpen: event.isVotingOpen,
      isPublished,
      timestamp: new Date().toISOString(),
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=3, stale-while-revalidate=10",
      },
    }
  );
}
