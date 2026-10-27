import { NextResponse } from "next/server";
import { getAdminEmailFromRequest } from "@/lib/audit-logger";
import {
  getHackathonTeams,
  getHackathonTeamById,
  saveHackathonTeam,
  deleteHackathonTeam,
  endTeamSession,
  getHackathonScores,
  getHackathonVotes,
  getLiveSessionsByTeam,
  logHackathonActivity,
} from "@/lib/hackathon/data";
import { sanitizeString, hashSecret, isValidEmail, generateSecretCode } from "@/lib/hackathon/validators";
import { randomUUID } from "crypto";
import { HackathonTeam } from "@/lib/hackathon/constants";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const eventId = searchParams.get("eventId") || undefined;
  const [teams, sessions] = await Promise.all([getHackathonTeams(eventId), getLiveSessionsByTeam(eventId)]);

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
    hasActiveSession: sessions.has(t.id),
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

    if (typeof passkey === "string" && passkey.trim() && passkey.trim().length < 6) {
      return NextResponse.json({ error: "Passkeys must be at least 6 characters (leave blank to auto-generate)." }, { status: 400 });
    }

    if (leaderEmail && !isValidEmail(leaderEmail)) {
      return NextResponse.json({ error: "Invalid leader email address." }, { status: 400 });
    }

    // Client-supplied ids are only accepted for editing an existing team of this event.
    const existing = id ? await getHackathonTeamById(id) : null;
    if (id && (!existing || existing.eventId !== eventId)) {
      return NextResponse.json({ error: "Team not found in this event." }, { status: 404 });
    }
    const teamId = existing?.id || `team-${randomUUID()}`;

    let verificationCodeHash = existing?.verificationCodeHash || "";
    let effectivePasskey: string | undefined = existing?.passkey;
    if (passkey && typeof passkey === "string" && passkey.trim().length > 0 && passkey.trim() !== existing?.passkey) {
      effectivePasskey = passkey.trim();
      verificationCodeHash = await hashSecret(effectivePasskey);
    } else if (!existing) {
      // Auto-generate random secure 6-character passkey if not provided for new team
      effectivePasskey = generateSecretCode();
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
    if (resetSession) await endTeamSession(team.id);

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
  if (existing) {
    const [scores, votes] = await Promise.all([
      getHackathonScores(existing.eventId),
      getHackathonVotes(existing.eventId),
    ]);
    const hasResults =
      scores.some((s) => s.teamId === id) || votes.some((v) => v.voterTeamId === id || v.candidateTeamId === id);
    if (hasResults) {
      return NextResponse.json(
        { error: "This team already has scores or votes. Disqualify it instead of deleting, so results stay auditable." },
        { status: 409 }
      );
    }
  }
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
