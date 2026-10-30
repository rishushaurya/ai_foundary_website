import { NextResponse } from "next/server";
import {
  getHackathonTeams,
  getHackathonEvents,
  getTeamVote,
  startTeamSession,
  logHackathonActivity,
} from "@/lib/hackathon/data";
import { compareSecret } from "@/lib/hackathon/validators";
import { createParticipantToken } from "@/lib/hackathon/sessions";
import { HACKATHON_CONSTANTS } from "@/lib/hackathon/constants";
import { checkSharedRateLimit } from "@/lib/rate-limiter";
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
    const rate = await checkSharedRateLimit(
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

    // The same code and passkey can exist in several hackathons (one sheet imported twice), so every
    // match is collected and the event is chosen deliberately: the one picked on the page, else the
    // only one that's running. Never "whichever came first".
    const candidates = (await getHackathonTeams()).filter((t) => t.teamCode.trim().toUpperCase() === normalized);
    const matches: typeof candidates = [];
    for (const cand of candidates) {
      if (await compareSecret(passkey.trim(), cand.verificationCodeHash)) matches.push(cand);
    }
    if (matches.length === 0) {
      return NextResponse.json({ error: "Invalid Team Code or Passkey." }, { status: 401 });
    }

    const events = await getHackathonEvents();
    const isOpen = (t: (typeof matches)[number]) => {
      const ev = events.find((e) => e.id === t.eventId);
      return !!ev && (ev.status === "live" || ev.status === "completed");
    };
    const open = matches.filter(isOpen);
    const team = open.find((t) => t.eventId === eventId) ?? (open.length === 1 ? open[0] : null);
    if (!team) {
      return open.length > 1
        ? NextResponse.json(
            {
              error: "This team code and passkey work in more than one running hackathon. Choose your hackathon from the list and sign in again.",
              ambiguousEvents: open.map((t) => t.eventId),
            },
            { status: 409 }
          )
        : NextResponse.json(
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
        eventId: team.eventId,
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
