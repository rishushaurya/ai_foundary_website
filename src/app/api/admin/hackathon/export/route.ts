import { NextResponse } from "next/server";
import { getAdminEmailFromRequest } from "@/lib/audit-logger";
import {
  getHackathonEventById,
  getHackathonRounds,
  getHackathonCriteria,
  getHackathonTeams,
  getHackathonScores,
  getHackathonJudges,
  getHackathonVotes,
  getHackathonTiebreakers,
  logHackathonActivity,
} from "@/lib/hackathon/data";
import {
  generateTeamsWorkbook,
  generateJudgesWorkbook,
  generateMarksWorkbook,
  generateVotesWorkbook,
} from "@/lib/hackathon/excel-export";

export async function GET(request: Request) {
  try {
    const adminEmail = await getAdminEmailFromRequest(request);
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type"); // "teams" | "judges" | "marks" | "votes"
    const eventId = searchParams.get("eventId");
    const roundId = searchParams.get("roundId");
    const mode = (searchParams.get("mode") as "full" | "public_only" | "credentials_only") || "full";

    if (!eventId) {
      return NextResponse.json({ error: "Missing eventId parameter." }, { status: 400 });
    }

    const event = await getHackathonEventById(eventId);
    if (!event) {
      return NextResponse.json({ error: "Event not found." }, { status: 404 });
    }

    const safeTitle = (event.title || "hackathon").replace(/[^a-zA-Z0-9_-]/g, "_").toLowerCase();
    const timestamp = new Date().toISOString().split("T")[0];

    // 1. Export Teams
    if (type === "teams") {
      const teams = await getHackathonTeams(eventId);
      const buffer = generateTeamsWorkbook(teams, mode);

      let filename = `${safeTitle}-teams-complete-${timestamp}.xlsx`;
      if (mode === "public_only") {
        filename = `${safeTitle}-teams-public-roster-${timestamp}.xlsx`;
      } else if (mode === "credentials_only") {
        filename = `${safeTitle}-teams-secret-passkeys-${timestamp}.xlsx`;
      }

      await logHackathonActivity({
        eventId,
        action: `Exported Teams Excel (${mode})`,
        actorType: "admin",
        actorId: adminEmail,
        details: { teamCount: teams.length, mode, filename },
      });

      return new NextResponse(buffer as any, {
        headers: {
          "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": `attachment; filename="${filename}"`,
        },
      });
    }

    // 2. Export Judges
    if (type === "judges") {
      const judges = await getHackathonJudges(eventId);
      const buffer = generateJudgesWorkbook(judges);
      const filename = `${safeTitle}-judges-directory-${timestamp}.xlsx`;

      await logHackathonActivity({
        eventId,
        action: "Exported Judges Excel",
        actorType: "admin",
        actorId: adminEmail,
        details: { judgeCount: judges.length, filename },
      });

      return new NextResponse(buffer as any, {
        headers: {
          "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": `attachment; filename="${filename}"`,
        },
      });
    }

    // 3. Export Round Marks / Scores
    if (type === "marks") {
      const rounds = await getHackathonRounds(eventId);
      const targetRound = rounds.find((r) => r.id === roundId) || rounds[0];

      if (!targetRound) {
        return NextResponse.json({ error: "No round found for marks export." }, { status: 404 });
      }

      const criteria = await getHackathonCriteria(eventId);
      const scores = await getHackathonScores(eventId, targetRound.id);
      const teams = await getHackathonTeams(eventId);
      const votes = await getHackathonVotes(eventId, targetRound.id);
      const tiebreakers = await getHackathonTiebreakers(eventId);
      const judges = await getHackathonJudges(eventId);

      const buffer = generateMarksWorkbook(
        event,
        targetRound,
        criteria,
        scores,
        teams,
        votes,
        tiebreakers,
        judges
      );

      const roundSlug = `round-${targetRound.roundNumber}`;
      const filename = `${safeTitle}-${roundSlug}-marks-${timestamp}.xlsx`;

      await logHackathonActivity({
        eventId,
        action: `Exported Round ${targetRound.roundNumber} Marks Excel`,
        actorType: "admin",
        actorId: adminEmail,
        details: { roundId: targetRound.id, roundNumber: targetRound.roundNumber, scoreCount: scores.length, filename },
      });

      return new NextResponse(buffer as any, {
        headers: {
          "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": `attachment; filename="${filename}"`,
        },
      });
    }

    // 4. Export Audience Votes
    if (type === "votes") {
      const votes = await getHackathonVotes(eventId);
      const teams = await getHackathonTeams(eventId);
      const buffer = generateVotesWorkbook(votes, teams);
      const filename = `${safeTitle}-audience-votes-${timestamp}.xlsx`;

      await logHackathonActivity({
        eventId,
        action: "Exported Audience Votes Excel",
        actorType: "admin",
        actorId: adminEmail,
        details: { totalVotes: votes.length, filename },
      });

      return new NextResponse(buffer as any, {
        headers: {
          "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": `attachment; filename="${filename}"`,
        },
      });
    }

    return NextResponse.json({ error: "Invalid export type. Supported: teams, judges, marks, votes." }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to generate Excel export." }, { status: 500 });
  }
}
