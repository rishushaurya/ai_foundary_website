import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { getAdminEmailFromRequest } from "@/lib/audit-logger";
import {
  getHackathonEventById,
  saveHackathonEvent,
  getHackathonRounds,
  saveHackathonRound,
  getHackathonTeams,
  saveHackathonTeams,
  getHackathonScores,
  getHackathonVotes,
  getHackathonCriteria,
  getHackathonTiebreakers,
  logHackathonActivity,
} from "@/lib/hackathon/data";
import { computeStandings, getCompetingTeamsForRound } from "@/lib/hackathon/scoring";
import { HackathonTeam } from "@/lib/hackathon/constants";

export async function POST(request: Request) {
  const gate = await requireAdmin();
  if (gate instanceof NextResponse) return gate;
  try {
    const adminEmail = await getAdminEmailFromRequest(request);
    const body = await request.json();
    const { eventId, currentRoundId, nextRoundId, advancingTeamIds, cutoffRank } = body;

    if (!eventId || !currentRoundId) {
      return NextResponse.json({ error: "eventId and currentRoundId are required." }, { status: 400 });
    }

    const event = await getHackathonEventById(eventId);
    if (!event) {
      return NextResponse.json({ error: "Event not found." }, { status: 404 });
    }

    const rounds = await getHackathonRounds(eventId);
    const currentRound = rounds.find((r) => r.id === currentRoundId);
    if (!currentRound) {
      return NextResponse.json({ error: "Current round not found." }, { status: 404 });
    }
    // Guards double-clicks and replays: a completed round has already decided its advancement.
    if (currentRound.status === "completed") {
      return NextResponse.json(
        { error: `'${currentRound.name}' is already completed. Select the round that is in progress.` },
        { status: 409 }
      );
    }

    const nextRound =
      (nextRoundId && rounds.find((r) => r.id === nextRoundId)) ||
      rounds.find((r) => r.roundNumber === currentRound.roundNumber + 1) ||
      null;

    const teams = await getHackathonTeams(eventId);
    const competing = getCompetingTeamsForRound(teams, currentRound, rounds);
    const competingIds = new Set(competing.map((t) => t.id));

    // Decide winners among the teams that actually competed in this round. Teams eliminated in
    // earlier rounds are never re-ranked here, so they can never be "advanced" back in.
    let winners: Set<string>;
    let effectiveCutoff: number | undefined;
    if (Array.isArray(advancingTeamIds) && advancingTeamIds.length > 0) {
      winners = new Set(advancingTeamIds.filter((id: string) => competingIds.has(id)));
    } else {
      effectiveCutoff = Number(cutoffRank) || currentRound.cutoffRank;
      if (nextRound && (!effectiveCutoff || !Number.isInteger(effectiveCutoff) || effectiveCutoff < 1)) {
        return NextResponse.json({ error: "A cutoff rank (whole number of 1 or more) is required." }, { status: 400 });
      }
      const [scores, votes, criteria, tiebreakers] = await Promise.all([
        getHackathonScores(eventId, currentRoundId),
        getHackathonVotes(eventId, currentRoundId),
        getHackathonCriteria(eventId, currentRoundId),
        getHackathonTiebreakers(eventId, currentRoundId),
      ]);
      const standings = computeStandings(currentRound, rounds, teams, scores, votes, criteria, tiebreakers, effectiveCutoff);
      winners = new Set(standings.filter((s) => s.advanced).map((s) => s.teamId));
    }

    const isNextFinal = nextRound?.type === "final";
    const changedTeams: HackathonTeam[] = [];
    let advanced = 0;
    let eliminated = 0;

    // Finishing the last round finalizes the event; team states stay as the final ranking shows them.
    if (nextRound) {
      for (const team of competing) {
        if (winners.has(team.id)) {
          advanced++;
          changedTeams.push({ ...team, isEliminated: false, finalist: isNextFinal || team.finalist });
        } else {
          eliminated++;
          changedTeams.push({ ...team, isEliminated: true, eliminatedInRoundId: currentRound.id });
        }
      }
      if (changedTeams.length > 0) await saveHackathonTeams(changedTeams);
    }

    await saveHackathonRound({ ...currentRound, status: "completed" });

    if (nextRound) {
      await saveHackathonRound({ ...nextRound, status: "active" });
      await saveHackathonEvent({ ...event, currentRoundNumber: nextRound.roundNumber, activeRoundId: nextRound.id });
    } else {
      await saveHackathonEvent({ ...event, status: "completed", isVotingOpen: false });
    }

    await logHackathonActivity({
      eventId,
      action: "Round Advancement Executed",
      actorType: "admin",
      actorId: adminEmail,
      details: {
        completedRound: currentRound.name,
        nextRound: nextRound?.name || "Finalized",
        cutoffRank: effectiveCutoff,
        advancedCount: advanced,
        eliminatedCount: eliminated,
      },
    });

    return NextResponse.json({
      success: true,
      message: nextRound
        ? `Stage advanced. ${advanced} teams advanced, ${eliminated} teams eliminated.`
        : `Final round completed. ${event.title} is now finalized.`,
      nextRound: nextRound ? { id: nextRound.id, name: nextRound.name, status: "active" } : null,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Stage advancement failed." }, { status: 500 });
  }
}
