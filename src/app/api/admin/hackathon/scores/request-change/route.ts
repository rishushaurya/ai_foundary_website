import { NextResponse } from "next/server";
import { getHackathonScores, saveHackathonScore, logHackathonActivity } from "@/lib/hackathon/data";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { scoreId, eventId, roundId, judgeId, teamId, reason } = body;

    const allScores = await getHackathonScores(eventId, roundId);
    const targetScore = allScores.find(
      (s) =>
        (scoreId && s.id === scoreId) ||
        (s.roundId === roundId && s.judgeId === judgeId && s.teamId === teamId)
    );

    if (!targetScore) {
      return NextResponse.json({ error: "Score submission not found." }, { status: 404 });
    }

    // Toggle or set changeRequested to true
    targetScore.changeRequested = true;
    targetScore.changeReason = reason || "Administrator requested score revision";

    const res = await saveHackathonScore(targetScore, true);
    if (!res.ok) {
      return NextResponse.json({ error: res.error || "Failed to unlock score for judge." }, { status: 500 });
    }

    await logHackathonActivity({
      eventId: targetScore.eventId,
      action: "Score Change Requested",
      actorType: "admin",
      actorId: "admin",
      details: {
        scoreId: targetScore.id,
        judgeId: targetScore.judgeId,
        teamId: targetScore.teamId,
        roundId: targetScore.roundId,
        reason: targetScore.changeReason,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Score successfully unlocked. Judge can now edit and resubmit their score.",
      score: targetScore,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to process change request." }, { status: 500 });
  }
}
