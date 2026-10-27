import { NextResponse } from "next/server";
import {
  getHackathonRounds,
  getHackathonTeams,
  getHackathonScores,
  getHackathonVotes,
  getHackathonCriteria,
  getHackathonTiebreakers,
} from "@/lib/hackathon/data";
import { computeStandings } from "@/lib/hackathon/scoring";

// Live ranking for any round, published or not, with the cutoff line applied. This is exactly the
// computation the Advance action uses, so the preview is what will happen.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const eventId = searchParams.get("eventId");
  const roundId = searchParams.get("roundId");
  if (!eventId || !roundId) {
    return NextResponse.json({ error: "eventId and roundId are required." }, { status: 400 });
  }

  const rounds = await getHackathonRounds(eventId);
  const round = rounds.find((r) => r.id === roundId);
  if (!round) {
    return NextResponse.json({ error: "Round not found." }, { status: 404 });
  }

  const cutoffParam = Number(searchParams.get("cutoff"));
  const cutoff = Number.isInteger(cutoffParam) && cutoffParam > 0 ? cutoffParam : round.cutoffRank;

  const [teams, scores, votes, criteria, tiebreakers] = await Promise.all([
    getHackathonTeams(eventId),
    getHackathonScores(eventId, roundId),
    getHackathonVotes(eventId, roundId),
    getHackathonCriteria(eventId, roundId),
    getHackathonTiebreakers(eventId, roundId),
  ]);

  const standings = computeStandings(round, rounds, teams, scores, votes, criteria, tiebreakers, cutoff);
  const active = standings.filter((s) => !s.disqualified);
  const advancingCount = active.filter((s) => s.advanced).length;

  return NextResponse.json({
    round: { id: round.id, name: round.name, type: round.type, status: round.status, isPublished: round.isPublished === true },
    cutoff: cutoff ?? null,
    standings,
    competingCount: active.length,
    unscoredCount: active.filter((s) => s.judgeScoresCount === 0).length,
    advancingCount,
    // A tie on the cutoff rank lets more teams through than the cutoff number suggests.
    tieAtCutoff: !!cutoff && advancingCount > cutoff,
  });
}
