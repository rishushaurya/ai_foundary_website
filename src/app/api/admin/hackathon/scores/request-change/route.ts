import { NextResponse } from "next/server";
import { getAdminEmailFromRequest } from "@/lib/audit-logger";
import {
  getHackathonScores,
  setScoreRevisionRequest,
  getHackathonRoundById,
  saveHackathonRound,
  getHackathonTeamById,
  logHackathonActivity,
} from "@/lib/hackathon/data";

export async function POST(request: Request) {
  try {
    const adminEmail = await getAdminEmailFromRequest(request);
    const body = await request.json();
    const { scoreId, eventId, roundId, teamId, reason, universal, allowRevisions } = body;

    // 1. Universal Round Revisions Toggle
    if (universal) {
      if (!roundId) {
        return NextResponse.json({ error: "Missing roundId for universal revisions toggle." }, { status: 400 });
      }

      const round = await getHackathonRoundById(roundId);
      if (!round) {
        return NextResponse.json({ error: "Round not found." }, { status: 404 });
      }

      const newStatus = allowRevisions !== undefined ? Boolean(allowRevisions) : !round.allowRevisions;
      round.allowRevisions = newStatus;
      await saveHackathonRound(round);

      await logHackathonActivity({
        eventId: round.eventId,
        action: newStatus
          ? `Universal Score Revisions ENABLED (Round ${round.roundNumber})`
          : `Universal Score Revisions DISABLED (Round ${round.roundNumber})`,
        actorType: "admin",
        actorId: adminEmail,
        details: {
          roundId: round.id,
          roundNumber: round.roundNumber,
          allowRevisions: newStatus,
          adminEmail,
        },
      });

      return NextResponse.json({
        success: true,
        message: newStatus
          ? `Universal score revisions enabled for Round ${round.roundNumber}. All judges can now revise scores.`
          : `Universal score revisions disabled for Round ${round.roundNumber}.`,
        round,
      });
    }

    // 2. Individual Team Score Revision: match exactly one score (by id, or by round + team).
    const allScores = await getHackathonScores(eventId, roundId);
    const targetScore = allScores.find((s) =>
      scoreId ? s.id === scoreId : s.roundId === roundId && s.teamId === teamId
    );

    if (!targetScore) {
      return NextResponse.json({ error: "Score submission not found for this team/round." }, { status: 404 });
    }

    const team = await getHackathonTeamById(targetScore.teamId);
    const teamLabel = team ? `${team.teamCode} (${team.teamName})` : targetScore.teamId;

    // If explicit changeRequested boolean passed, use it; otherwise toggle
    const newChangeRequested =
      body.changeRequested !== undefined ? Boolean(body.changeRequested) : !targetScore.changeRequested;

    const updated = await setScoreRevisionRequest(
      targetScore.roundId,
      targetScore.teamId,
      newChangeRequested,
      typeof reason === "string" ? reason.trim().slice(0, 300) : undefined
    );
    if (!updated) {
      return NextResponse.json({ error: "Failed to update score revision status." }, { status: 500 });
    }
    targetScore.changeReason = updated.changeReason;

    await logHackathonActivity({
      eventId: targetScore.eventId,
      action: newChangeRequested
        ? `Score Revision Requested for Team ${teamLabel}`
        : `Score Revision Cancelled for Team ${teamLabel}`,
      actorType: "admin",
      actorId: adminEmail,
      details: {
        scoreId: targetScore.id,
        judgeId: targetScore.judgeId,
        teamId: targetScore.teamId,
        teamCode: team?.teamCode,
        roundId: targetScore.roundId,
        reason: targetScore.changeReason,
        adminEmail,
      },
    });

    return NextResponse.json({
      success: true,
      message: newChangeRequested
        ? `Score revision successfully unlocked for ${teamLabel}. Judge can now edit and resubmit score.`
        : `Score revision locked for ${teamLabel}.`,
      score: updated,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to process change request." }, { status: 500 });
  }
}
