import { NextResponse } from "next/server";
import { saveHackathonTeamsBatch, logHackathonActivity } from "@/lib/hackathon/data";
import { parseTeamsCSV, hashSecret, generateSecretCode, sanitizeString } from "@/lib/hackathon/validators";
import { HackathonTeam } from "@/lib/hackathon/constants";
import { getAdminEmailFromRequest } from "@/lib/audit-logger";
import { randomUUID } from "crypto";

export async function POST(request: Request) {
  try {
    const adminEmail = await getAdminEmailFromRequest(request);
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
      const teamCode = sanitizeString(String(t.teamCode ?? "")).toUpperCase();
      const teamName = sanitizeString(String(t.teamName ?? ""));
      if (!teamCode || !teamName) {
        return NextResponse.json({ error: "Every team needs a teamCode and teamName." }, { status: 400 });
      }
      const passkey = sanitizeString(String(t.passkey ?? "")) || generateSecretCode();
      if (passkey.length < 6) {
        return NextResponse.json(
          { error: `Passkey for ${teamCode} is shorter than 6 characters. Use longer passkeys or leave the column empty to auto-generate.` },
          { status: 400 }
        );
      }
      const verificationCodeHash = await hashSecret(passkey);

      readyTeams.push({
        id: `team-${randomUUID()}`,
        eventId,
        teamCode,
        teamName,
        leaderName: sanitizeString(String(t.leaderName || "Leader")),
        leaderEmail: sanitizeString(String(t.leaderEmail || "")),
        leaderPhone: t.leaderPhone ? sanitizeString(String(t.leaderPhone)) : undefined,
        members: Array.isArray(t.members) ? t.members.map((m: unknown) => sanitizeString(m)).filter(Boolean) : [],
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
      actorId: adminEmail,
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
