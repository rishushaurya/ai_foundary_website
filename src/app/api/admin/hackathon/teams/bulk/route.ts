import { NextResponse } from "next/server";
import { saveHackathonTeamsBatch, logHackathonActivity } from "@/lib/hackathon/data";
import { parseTeamsCSV, hashSecret } from "@/lib/hackathon/validators";
import { HackathonTeam } from "@/lib/hackathon/constants";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { eventId, csvContent, teamsData } = body;

    if (!eventId) {
      return NextResponse.json({ error: "eventId is required." }, { status: 400 });
    }

    let parsedTeams: any[] = [];
    if (csvContent && typeof csvContent === "string") {
      const { teams, errors } = parseTeamsCSV(csvContent);
      if (errors.length > 0) {
        return NextResponse.json({ error: `CSV Parsing Error: ${errors.join(", ")}` }, { status: 400 });
      }
      parsedTeams = teams;
    } else if (Array.isArray(teamsData)) {
      parsedTeams = teamsData;
    } else {
      return NextResponse.json({ error: "csvContent (string) or teamsData (array) is required." }, { status: 400 });
    }

    if (parsedTeams.length === 0) {
      return NextResponse.json({ error: "No teams found in payload." }, { status: 400 });
    }

    // Hash secrets and format entities
    const readyTeams: HackathonTeam[] = [];
    for (const t of parsedTeams) {
      const passkey = t.passkey || "AI2026";
      const verificationCodeHash = await hashSecret(passkey);
      const teamId = `team-${eventId}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

      readyTeams.push({
        id: teamId,
        eventId,
        teamCode: String(t.teamCode).trim().toUpperCase(),
        teamName: String(t.teamName).trim(),
        leaderName: String(t.leaderName || "Leader").trim(),
        leaderEmail: String(t.leaderEmail || "").trim(),
        leaderPhone: t.leaderPhone ? String(t.leaderPhone).trim() : undefined,
        members: Array.isArray(t.members) ? t.members : [],
        verificationCodeHash,
        passkey,
        isEliminated: false,
        finalist: false,
        disqualified: false,
        createdAt: new Date().toISOString(),
      });
    }

    const res = await saveHackathonTeamsBatch(readyTeams);
    if (!res.ok) {
      return NextResponse.json({ error: res.error || "Batch insertion failed." }, { status: 400 });
    }

    await logHackathonActivity({
      eventId,
      action: "Bulk Teams Uploaded",
      actorType: "admin",
      actorId: "admin",
      details: { count: readyTeams.length },
    });

    return NextResponse.json({
      success: true,
      message: `Successfully imported ${readyTeams.length} teams.`,
      count: readyTeams.length,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Bulk teams upload failed." }, { status: 500 });
  }
}
