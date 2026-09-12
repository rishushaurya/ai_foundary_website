import { NextResponse } from "next/server";
import { getAdminEmailFromRequest } from "@/lib/audit-logger";
import {
  getHackathonEventById,
  saveHackathonEvent,
  getHackathonRounds,
  saveHackathonRound,
  getHackathonTeams,
  saveHackathonTeam,
  getHackathonScores,
  getHackathonVotes,
  getHackathonCriteria,
  getHackathonTiebreakers,
  logHackathonActivity,
} from "@/lib/hackathon/data";
import { computeRoundLeaderboard } from "@/lib/hackathon/scoring";

export async function POST(request: Request) {
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

    // Determine target next round
    let nextRound = nextRoundId ? rounds.find((r) => r.id === nextRoundId) : null;
    if (!nextRound) {
      nextRound = rounds.find((r) => r.roundNumber === currentRound.roundNumber + 1) || null;
    }

    const teams = await getHackathonTeams(eventId);
    const scores = await getHackathonScores(eventId, currentRoundId);
    const votes = await getHackathonVotes(eventId, currentRoundId);
    const criteria = await getHackathonCriteria(eventId, currentRoundId);
    const tiebreakers = await getHackathonTiebreakers(eventId, currentRoundId);

    // Compute leaderboard to determine rank if advancingTeamIds not provided explicitly
    let winnersSet = new Set<string>();

    if (Array.isArray(advancingTeamIds) && advancingTeamIds.length > 0) {
      winnersSet = new Set(advancingTeamIds);
    } else {
      const effectiveCutoff = cutoffRank || currentRound.cutoffRank || 5;
      const leaderboard = computeRoundLeaderboard(
        currentRoundId,
        currentRound.type === "final",
        teams,
        scores,
        votes,
        criteria,
        tiebreakers,
        effectiveCutoff
      );

      for (const item of leaderboard) {
        if (!item.disqualified && item.rank <= effectiveCutoff) {
          winnersSet.add(item.teamId);
        }
      }
    }

    const isNextFinal = nextRound?.type === "final";

    // Update teams
    const updatedCount = { advanced: 0, eliminated: 0 };
    for (const t of teams) {
      if (t.disqualified) continue;

      if (winnersSet.has(t.id)) {
        updatedCount.advanced++;
        t.isEliminated = false;
        if (isNextFinal) {
          t.finalist = true;
        }
      } else {
        // If not already eliminated, eliminate now
        if (!t.isEliminated) {
          t.isEliminated = true;
          t.eliminatedInRoundId = currentRoundId;
          updatedCount.eliminated++;
        }
      }
      await saveHackathonTeam(t);
    }

    // Complete current round
    currentRound.status = "completed";
    await saveHackathonRound(currentRound);

    // Activate next round if available
    if (nextRound) {
      nextRound.status = "active";
      await saveHackathonRound(nextRound);

      event.currentRoundNumber = nextRound.roundNumber;
      event.activeRoundId = nextRound.id;
      await saveHackathonEvent(event);
    } else {
      // Event completed
      event.status = "completed";
      await saveHackathonEvent(event);
    }

    await logHackathonActivity({
      eventId,
      action: "Round Advancement Executed",
      actorType: "admin",
      actorId: adminEmail,
      details: {
        completedRound: currentRound.name,
        nextRound: nextRound?.name || "Finalized",
        advancedCount: updatedCount.advanced,
        eliminatedCount: updatedCount.eliminated,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Stage advanced. ${updatedCount.advanced} teams advanced, ${updatedCount.eliminated} teams eliminated.`,
      nextRound: nextRound ? { id: nextRound.id, name: nextRound.name, status: nextRound.status } : null,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Stage advancement failed." }, { status: 500 });
  }
}
