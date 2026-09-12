import { NextResponse } from "next/server";
import { getParticipantSession } from "@/lib/hackathon/sessions";
import {
  getHackathonTeamById,
  getHackathonEventById,
  getHackathonRounds,
  recordHackathonVote,
  logHackathonActivity,
} from "@/lib/hackathon/data";
import { checkRateLimit } from "@/lib/rate-limiter";
import { HACKATHON_CONSTANTS, HackathonVote } from "@/lib/hackathon/constants";

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";

  const session = await getParticipantSession();
  if (!session) {
    return NextResponse.json(
      { error: "Authentication required. Please verify your team code first." },
      { status: 401 }
    );
  }

  // Smooth Rate Limiting per authenticated team (prevents venue Wi-Fi NAT collisions)
  const rateLimitKey = `vote-submit-${session.teamId || ip}`;
  const rate = checkRateLimit(
    rateLimitKey,
    HACKATHON_CONSTANTS.RATE_LIMITS.VOTE_SUBMIT.limit,
    HACKATHON_CONSTANTS.RATE_LIMITS.VOTE_SUBMIT.windowMs
  );
  if (!rate.allowed) {
    return NextResponse.json(
      { error: `Voting is busy. Please wait ${rate.retryAfterSeconds}s before trying again.` },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const { candidateTeamId } = body;

    if (!candidateTeamId) {
      return NextResponse.json({ error: "Candidate team selection is required." }, { status: 400 });
    }

    // 1. Fetch voter team
    const voterTeam = await getHackathonTeamById(session.teamId);
    if (!voterTeam) {
      return NextResponse.json({ error: "Voter team record not found." }, { status: 404 });
    }

    // Rule: Only eliminated teams vote
    if (!voterTeam.isEliminated) {
      return NextResponse.json(
        { error: "Voting is reserved for eliminated teams supporting final contenders." },
        { status: 403 }
      );
    }

    // 2. Fetch event
    const event = await getHackathonEventById(voterTeam.eventId);
    if (!event) {
      return NextResponse.json({ error: "Event not found." }, { status: 404 });
    }

    if (!event.isVotingOpen) {
      return NextResponse.json(
        { error: "Voting is currently closed for this hackathon." },
        { status: 403 }
      );
    }

    // 3. Find the final round
    const rounds = await getHackathonRounds(event.id);
    const finalRound = rounds.find((r) => r.type === "final");
    if (!finalRound) {
      return NextResponse.json({ error: "Final round is not configured for voting." }, { status: 400 });
    }

    // 4. Validate candidate team
    const candidateTeam = await getHackathonTeamById(candidateTeamId);
    if (!candidateTeam || candidateTeam.eventId !== event.id) {
      return NextResponse.json({ error: "Candidate team not found in this hackathon." }, { status: 404 });
    }

    if (!candidateTeam.finalist) {
      return NextResponse.json({ error: "Votes can only be cast for official finalists." }, { status: 400 });
    }

    if (candidateTeam.disqualified) {
      return NextResponse.json({ error: "Selected team has been disqualified." }, { status: 400 });
    }

    if (candidateTeam.id === voterTeam.id) {
      return NextResponse.json({ error: "Cannot vote for your own team." }, { status: 400 });
    }

    // 5. Cast vote with atomic uniqueness constraint
    const voteRecord: HackathonVote = {
      id: `vote-${event.id}-${voterTeam.id}`,
      eventId: event.id,
      roundId: finalRound.id,
      voterTeamId: voterTeam.id,
      candidateTeamId: candidateTeam.id,
      submittedAt: new Date().toISOString(),
      ipAddress: ip,
    };

    const res = await recordHackathonVote(voteRecord);
    if (!res.ok) {
      return NextResponse.json({ error: res.error || "Failed to record vote." }, { status: 409 });
    }

    await logHackathonActivity({
      eventId: event.id,
      action: "Vote Cast",
      actorType: "participant",
      actorId: voterTeam.id,
      details: {
        candidateTeamId: candidateTeam.id,
        candidateName: candidateTeam.teamName,
        ip,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Vote successfully cast for ${candidateTeam.teamName}.`,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to submit vote." }, { status: 500 });
  }
}
