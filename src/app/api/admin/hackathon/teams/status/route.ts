import { NextResponse } from "next/server";
import { getHackathonTeamById, saveHackathonTeam, logHackathonActivity } from "@/lib/hackathon/data";
import { sanitizeString } from "@/lib/hackathon/validators";

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { teamId, disqualified, disqualificationReason, isEliminated, finalist } = body;

    if (!teamId) {
      return NextResponse.json({ error: "teamId is required." }, { status: 400 });
    }

    const team = await getHackathonTeamById(teamId);
    if (!team) {
      return NextResponse.json({ error: "Team not found." }, { status: 404 });
    }

    if (typeof disqualified === "boolean") {
      team.disqualified = disqualified;
      team.disqualificationReason = disqualified ? sanitizeString(disqualificationReason || "Disqualified by admin") : undefined;
    }

    if (typeof isEliminated === "boolean") {
      team.isEliminated = isEliminated;
    }

    if (typeof finalist === "boolean") {
      team.finalist = finalist;
    }

    const res = await saveHackathonTeam(team);
    if (!res.ok) {
      return NextResponse.json({ error: res.error || "Failed to update status." }, { status: 400 });
    }

    await logHackathonActivity({
      eventId: team.eventId,
      action: "Team Status Modified",
      actorType: "admin",
      actorId: "admin",
      details: {
        teamCode: team.teamCode,
        disqualified: team.disqualified,
        isEliminated: team.isEliminated,
        finalist: team.finalist,
      },
    });

    return NextResponse.json({ success: true, team });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to update team status." }, { status: 500 });
  }
}
