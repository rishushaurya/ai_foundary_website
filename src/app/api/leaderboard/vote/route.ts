import { NextResponse } from "next/server";
import { getVerifiedParticipant } from "@/lib/hackathon/sessions";
import {
  getHackathonEventById,
  getHackathonRounds,
  getHackathonTeams,
  recordHackathonVote,
  logHackathonActivity,
} from "@/lib/hackathon/data";
import { getCompetingTeamsForRound } from "@/lib/hackathon/scoring";
import { checkRateLimit } from "@/lib/rate-limiter";
import { clientIp } from "@/lib/auth";
import { HACKATHON_CONSTANTS, HackathonVote } from "@/lib/hackathon/constants";

export async function POST(request: Request) {
  const ip = clientIp(request);

  const participant = await getVerifiedParticipant();
  if (participant.status !== "ok") {
    return NextResponse.json(
      {
        error:
          participant.status === "revoked"
            ? "This device's session has ended. Please verify your team again."
            : "Authentication required. Please verify your team code first.",
        sessionRevoked: participant.status === "revoked",
      },
      { status: 401 }
    );
  }
  const voterTeam = participant.team;

  // Smooth Rate Limiting per authenticated team (prevents venue Wi-Fi NAT collisions)
  const rate = checkRateLimit(
    `vote-submit-${voterTeam.id}`,
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

    if (!candidateTeamId || typeof candidateTeamId !== "string") {
      return NextResponse.json({ error: "Candidate team selection is required." }, { status: 400 });
    }

    // Rule: Only eliminated, non-disqualified teams vote
    if (voterTeam.disqualified) {
      return NextResponse.json({ error: "Disqualified teams cannot vote." }, { status: 403 });
    }
    if (!voterTeam.isEliminated) {
      return NextResponse.json(
        { error: "Voting is reserved for eliminated teams supporting final contenders." },
        { status: 403 }
      );
    }

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

    const rounds = await getHackathonRounds(event.id);
    const finalRound = rounds.find((r) => r.type === "final");
    if (!finalRound) {
      return NextResponse.json({ error: "Final round is not configured for voting." }, { status: 400 });
    }
    if (finalRound.status === "completed" || event.status === "completed") {
      return NextResponse.json({ error: "Voting has ended. The final results are locked." }, { status: 403 });
    }

    if (candidateTeamId === voterTeam.id) {
      return NextResponse.json({ error: "Cannot vote for your own team." }, { status: 400 });
    }
    // Candidates are exactly the teams competing in the final: finalists, not eliminated, not disqualified.
    const teams = await getHackathonTeams(event.id);
    const candidateTeam = teams.find((t) => t.id === candidateTeamId);
    if (!candidateTeam) {
      return NextResponse.json({ error: "Candidate team not found in this hackathon." }, { status: 404 });
    }
    if (!getCompetingTeamsForRound(teams, finalRound, rounds).some((t) => t.id === candidateTeam.id)) {
      return NextResponse.json({ error: "Votes can only be cast for teams competing in the final." }, { status: 400 });
    }

    // One vote per team per event, enforced atomically by the storage key (not a read-then-write check).
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
