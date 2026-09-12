import { NextResponse } from "next/server";
import { getAdminEmailFromRequest } from "@/lib/audit-logger";
import {
  getHackathonTeams,
  getHackathonTeamById,
  saveHackathonTeam,
  deleteHackathonTeam,
  logHackathonActivity,
} from "@/lib/hackathon/data";
import { sanitizeString, hashSecret, isValidEmail } from "@/lib/hackathon/validators";
import { HackathonTeam } from "@/lib/hackathon/constants";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const eventId = searchParams.get("eventId") || undefined;
  const teams = await getHackathonTeams(eventId);

  // Return teams without exposing hash
  // Return teams with passkey and session state for administrators
  const safeTeams = teams.map((t) => ({
    id: t.id,
    eventId: t.eventId,
    teamCode: t.teamCode,
    teamName: t.teamName,
    leaderName: t.leaderName,
    leaderEmail: t.leaderEmail,
    leaderPhone: t.leaderPhone,
    members: t.members,
    passkey: t.passkey, // Revealed to admin with eye toggle
    hasActiveSession: !!t.activeSessionId,
    allowMultipleLogins: t.allowMultipleLogins === true,
    isEliminated: t.isEliminated,
    eliminatedInRoundId: t.eliminatedInRoundId,
    finalist: t.finalist,
    disqualified: t.disqualified,
    disqualificationReason: t.disqualificationReason,
    createdAt: t.createdAt,
  }));

  return NextResponse.json({ teams: safeTeams });
}

export async function POST(request: Request) {
  try {
    const adminEmail = await getAdminEmailFromRequest(request);
    const body = await request.json();
    const {
      id,
      eventId,
      teamCode,
      teamName,
      leaderName,
      leaderEmail,
      leaderPhone,
      members,
      passkey,
      resetSession,
      allowMultipleLogins,
      isEliminated,
      finalist,
      disqualified,
      disqualificationReason,
    } = body;

    if (!eventId || !teamCode || !teamName) {
      return NextResponse.json({ error: "eventId, teamCode, and teamName are required." }, { status: 400 });
    }

    if (leaderEmail && !isValidEmail(leaderEmail)) {
      return NextResponse.json({ error: "Invalid leader email address." }, { status: 400 });
    }

    const teamId = id || `team-${eventId}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const existing = await getHackathonTeamById(teamId);

    let verificationCodeHash = existing?.verificationCodeHash || "";
    let effectivePasskey: string | undefined = existing?.passkey;
    if (passkey && typeof passkey === "string" && passkey.trim().length > 0) {
      effectivePasskey = passkey.trim();
      verificationCodeHash = await hashSecret(effectivePasskey);
    } else if (!existing) {
      // Auto-generate random secure 6-character passkey if not provided for new team
      effectivePasskey = `PASS-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      verificationCodeHash = await hashSecret(effectivePasskey);
    }

    const memberList = Array.isArray(members)
      ? members.map((m) => sanitizeString(m)).filter(Boolean)
      : typeof members === "string"
      ? members.split(",").map((m) => sanitizeString(m)).filter(Boolean)
      : [];

    const team: HackathonTeam = {
      id: teamId,
      eventId,
      teamCode: sanitizeString(teamCode).toUpperCase(),
      teamName: sanitizeString(teamName),
      leaderName: leaderName ? sanitizeString(leaderName) : undefined,
      leaderEmail: leaderEmail ? sanitizeString(leaderEmail) : undefined,
      leaderPhone: leaderPhone ? sanitizeString(leaderPhone) : undefined,
      members: memberList,
      verificationCodeHash,
      passkey: effectivePasskey,
      activeSessionId: resetSession ? undefined : existing?.activeSessionId,
      allowMultipleLogins: typeof allowMultipleLogins === "boolean" ? allowMultipleLogins : existing?.allowMultipleLogins,
      isEliminated: typeof isEliminated === "boolean" ? isEliminated : (existing?.isEliminated || false),
      eliminatedInRoundId: existing?.eliminatedInRoundId,
      finalist: typeof finalist === "boolean" ? finalist : (existing?.finalist || false),
      disqualified: typeof disqualified === "boolean" ? disqualified : (existing?.disqualified || false),
      disqualificationReason: disqualificationReason ? sanitizeString(disqualificationReason) : existing?.disqualificationReason,
      createdAt: existing?.createdAt || new Date().toISOString(),
    };

    const res = await saveHackathonTeam(team);
    if (!res.ok) {
      return NextResponse.json({ error: res.error || "Failed to save team." }, { status: 400 });
    }

    await logHackathonActivity({
      eventId,
      action: existing ? `Team Updated: ${team.teamCode} (${team.teamName})` : `Team Registered: ${team.teamCode} (${team.teamName})`,
      actorType: "admin",
      actorId: adminEmail,
      details: { teamCode: team.teamCode, teamName: team.teamName },
    });

    return NextResponse.json({
      success: true,
      team: {
        id: team.id,
        teamCode: team.teamCode,
        teamName: team.teamName,
        passkey: effectivePasskey,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to process team." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const adminEmail = await getAdminEmailFromRequest(request);
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Team id is required." }, { status: 400 });
  }

  const existing = await getHackathonTeamById(id);
  const ok = await deleteHackathonTeam(id);
  if (!ok) {
    return NextResponse.json({ error: "Failed to delete team." }, { status: 500 });
  }

  if (existing) {
    await logHackathonActivity({
      eventId: existing.eventId,
      action: `Team Deleted: ${existing.teamCode} (${existing.teamName})`,
      actorType: "admin",
      actorId: adminEmail,
      details: { id, teamCode: existing.teamCode, teamName: existing.teamName },
    });
  }

  return NextResponse.json({ success: true, message: "Team deleted." });
}
