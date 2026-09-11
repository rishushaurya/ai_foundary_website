import { NextResponse } from "next/server";
import {
  getHackathonTeamByCode,
  getHackathonTeams,
  saveHackathonTeam,
  getHackathonVotes,
  logHackathonActivity,
} from "@/lib/hackathon/data";
import { compareSecret } from "@/lib/hackathon/validators";
import { createParticipantToken } from "@/lib/hackathon/sessions";
import { HACKATHON_CONSTANTS } from "@/lib/hackathon/constants";
import { checkRateLimit } from "@/lib/rate-limiter";

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";

  // Rate Limiting
  const rate = checkRateLimit(
    `team-verify-${ip}`,
    HACKATHON_CONSTANTS.RATE_LIMITS.PARTICIPANT_VERIFY.limit,
    HACKATHON_CONSTANTS.RATE_LIMITS.PARTICIPANT_VERIFY.windowMs
  );
  if (!rate.allowed) {
    return NextResponse.json(
      { error: `Too many verification attempts. Please wait ${rate.retryAfterSeconds}s.` },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const { teamCode, passkey, eventId } = body;

    if (!teamCode || !passkey) {
      return NextResponse.json(
        { error: "Team Code and Secret Passkey are required." },
        { status: 400 }
      );
    }

    const allTeams = await getHackathonTeams(eventId);
    const normalized = teamCode.trim().toUpperCase();
    const candidates = allTeams.filter(
      (t) => t.teamCode.trim().toUpperCase() === normalized
    );

    if (candidates.length === 0) {
      return NextResponse.json(
        { error: "Invalid Team Code or Passkey." },
        { status: 401 }
      );
    }

    let matchingTeam: typeof candidates[0] | null = null;
    for (const cand of candidates) {
      const valid = await compareSecret(passkey.trim(), cand.verificationCodeHash);
      if (valid) {
        matchingTeam = cand;
        break;
      }
    }

    if (!matchingTeam) {
      return NextResponse.json(
        { error: "Invalid Team Code or Passkey." },
        { status: 401 }
      );
    }

    const team = matchingTeam;

    // Check if team already has an active session on another device
    const cookieStore = await request.headers.get("cookie") || "";
    const existingParticipantCookie = cookieStore.includes(HACKATHON_CONSTANTS.COOKIE_PARTICIPANT);

    if (team.activeSessionId && !team.allowMultipleLogins) {
      // Check if this is the same active session
      // If team.lastLoginAt is within session TTL and activeSessionId is set, block 2nd device
      return NextResponse.json(
        {
          error: "Account already logged in on another device. Simultaneous logins are disabled. Please log out from the other device or ask an event administrator to reset your session.",
        },
        { status: 403 }
      );
    }

    // Generate unique device session ID
    const newSessionId = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    team.activeSessionId = newSessionId;
    team.lastLoginAt = new Date().toISOString();
    await saveHackathonTeam(team);

    // Check if team has already cast a vote in the event
    const votes = await getHackathonVotes(team.eventId);
    const hasVoted = votes.some((v) => v.voterTeamId === team.id);

    const token = await createParticipantToken({
      teamId: team.id,
      eventId: team.eventId,
      teamCode: team.teamCode,
      teamName: team.teamName,
      sessionId: newSessionId,
      isEliminated: team.isEliminated,
      finalist: team.finalist,
    });

    await logHackathonActivity({
      eventId: team.eventId,
      action: "Participant Team Verified",
      actorType: "participant",
      actorId: team.id,
      details: { teamCode: team.teamCode, ip },
    });

    const response = NextResponse.json({
      success: true,
      team: {
        id: team.id,
        teamCode: team.teamCode,
        teamName: team.teamName,
        leaderName: team.leaderName,
        members: team.members,
        isEliminated: team.isEliminated,
        finalist: team.finalist,
        disqualified: team.disqualified,
        hasVoted,
      },
    });

    response.cookies.set({
      name: HACKATHON_CONSTANTS.COOKIE_PARTICIPANT,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: HACKATHON_CONSTANTS.PARTICIPANT_SESSION_TTL_SECONDS,
    });

    return response;
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Team verification failed." },
      { status: 500 }
    );
  }
}
