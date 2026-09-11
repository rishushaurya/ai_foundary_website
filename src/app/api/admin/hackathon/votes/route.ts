import { NextResponse } from "next/server";
import { getHackathonVotes, getHackathonTeams } from "@/lib/hackathon/data";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const eventId = searchParams.get("eventId") || undefined;
  const roundId = searchParams.get("roundId") || undefined;

  const votes = await getHackathonVotes(eventId, roundId);
  const teams = await getHackathonTeams(eventId);
  const teamMap = new Map(teams.map((t) => [t.id, t]));

  // Aggregate candidate counts
  const tally: Record<string, { teamCode: string; teamName: string; count: number }> = {};
  for (const t of teams.filter((tm) => tm.finalist)) {
    tally[t.id] = { teamCode: t.teamCode, teamName: t.teamName, count: 0 };
  }

  const enrichedVotes = votes.map((v) => {
    const voter = teamMap.get(v.voterTeamId);
    const candidate = teamMap.get(v.candidateTeamId);
    if (tally[v.candidateTeamId]) {
      tally[v.candidateTeamId].count += 1;
    }
    return {
      id: v.id,
      submittedAt: v.submittedAt,
      voterTeam: voter ? { id: voter.id, teamCode: voter.teamCode, teamName: voter.teamName } : null,
      candidateTeam: candidate ? { id: candidate.id, teamCode: candidate.teamCode, teamName: candidate.teamName } : null,
      ipAddress: v.ipAddress,
    };
  });

  return NextResponse.json({
    totalVotes: votes.length,
    tally: Object.values(tally).sort((a, b) => b.count - a.count),
    votes: enrichedVotes,
  });
}
