import { NextResponse } from "next/server";
import { getActiveJudge } from "@/lib/hackathon/sessions";
import { HACKATHON_CONSTANTS } from "@/lib/hackathon/constants";
import { getHackathonEventById } from "@/lib/hackathon/data";

export async function GET() {
  const active = await getActiveJudge();
  if (!active) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
  const { session } = active;

  const event = await getHackathonEventById(session.eventId);

  return NextResponse.json({
    authenticated: true,
    judge: {
      id: session.judgeId,
      name: session.name,
      email: session.email,
      eventId: session.eventId,
    },
    event: event
      ? {
          id: event.id,
          title: event.title,
          status: event.status,
          currentRoundNumber: event.currentRoundNumber,
          activeRoundId: event.activeRoundId,
        }
      : null,
  });
}

export async function DELETE() {
  const response = NextResponse.json({ success: true, message: "Logged out" });
  response.cookies.set({
    name: HACKATHON_CONSTANTS.COOKIE_JUDGE,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}
