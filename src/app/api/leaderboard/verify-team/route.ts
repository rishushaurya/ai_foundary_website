import { NextResponse } from "next/server";
import {
  getHackathonTeams,
  getHackathonEventById,
  getTeamVote,
  startTeamSession,
  logHackathonActivity,
} from "@/lib/hackathon/data";
import { compareSecret } from "@/lib/hackathon/validators";
import { createParticipantToken } from "@/lib/hackathon/sessions";
import { HACKATHON_CONSTANTS } from "@/lib/hackathon/constants";
import { checkRateLimit } from "@/lib/rate-limiter";
import { clientIp } from "@/lib/auth";

export async function POST(request: Request) {
  const ip = clientIp(request);

  try {
    const body = await request.json();
    const { teamCode, passkey, eventId } = body;

    if (typeof teamCode !== "string" || typeof passkey !== "string" || !teamCode.trim() || !passkey.trim()) {
      return NextResponse.json(
        { error: "Team Code and Secret Passkey are required." },
        { status: 400 }
      );
    }

    const normalized = teamCode.trim().toUpperCase();

    // Smooth Rate Limiting per Team Code (prevents venue Wi-Fi NAT collisions)
    const rate = checkRateLimit(
      `team-verify-${normalized}`,
      HACKATHON_CONSTANTS.RATE_LIMITS.PARTICIPANT_VERIFY.limit,
      HACKATHON_CONSTANTS.RATE_LIMITS.PARTICIPANT_VERIFY.windowMs
    );
    if (!rate.allowed) {
      return NextResponse.json(
        { error: `Too many attempts for this team. Please wait ${rate.retryAfterSeconds}s.` },
        { status: 429 }
      );
    }

    const allTeams = await getHackathonTeams(typeof eventId === "string" ? eventId : undefined);
    const candidates = allTeams.filter((t) => t.teamCode.trim().toUpperCase() === normalized);

    let team: (typeof candidates)[number] | null = null;
    for (const cand of candidates) {
      if (await compareSecret(passkey.trim(), cand.verificationCodeHash)) {
        team = cand;
        break;
      }
    }

    if (!team) {
      return NextResponse.json({ error: "Invalid Team Code or Passkey." }, { status: 401 });
    }

    const event = await getHackathonEventById(team.eventId);
    if (!event || (event.status !== "live" && event.status !== "completed")) {
      return NextResponse.json(
        { error: "This hackathon hasn't started yet. Team login opens when the organisers go live." },
        { status: 403 }
      );
    }

    // Atomic device claim: two phones logging in at the same instant cannot both win.
    const claim = await startTeamSession(team);
    if (!claim.ok) {
      return NextResponse.json({ error: claim.error }, { status: 403 });
    }

    const hasVoted = !!(await getTeamVote(team.eventId, team.id));

    const token = await createParticipantToken({
      teamId: team.id,
      eventId: team.eventId,
      teamCode: team.teamCode,
      teamName: team.teamName,
      sessionId: claim.sessionId,
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
