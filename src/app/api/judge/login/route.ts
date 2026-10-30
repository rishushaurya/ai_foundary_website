import { NextResponse } from "next/server";
import { getHackathonEvents, getHackathonJudges, logHackathonActivity } from "@/lib/hackathon/data";
import { compareSecret } from "@/lib/hackathon/validators";
import { createJudgeToken } from "@/lib/hackathon/sessions";
import { HACKATHON_CONSTANTS } from "@/lib/hackathon/constants";
import { checkSharedRateLimit } from "@/lib/rate-limiter";
import { clientIp } from "@/lib/auth";

export async function POST(request: Request) {
  const ip = clientIp(request);

  try {
    const body = await request.json();
    const { email, accessCode, eventId } = body;

    if (typeof email !== "string" || typeof accessCode !== "string" || !email || !accessCode) {
      return NextResponse.json(
        { error: "Email and Judge Access Code are required." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Smooth Rate Limiting per Judge Email (prevents venue Wi-Fi NAT collisions)
    const rate = await checkSharedRateLimit(
      `judge-login-${normalizedEmail}`,
      HACKATHON_CONSTANTS.RATE_LIMITS.JUDGE_LOGIN.limit,
      HACKATHON_CONSTANTS.RATE_LIMITS.JUDGE_LOGIN.windowMs
    );
    if (!rate.allowed) {
      return NextResponse.json(
        { error: `Too many login attempts. Please try again in ${rate.retryAfterSeconds}s.` },
        { status: 429 }
      );
    }
    // One judge can sit on several hackathons with the same email (and even the same code), so collect
    // every match and pick deliberately: the requested event, else the only live one, else the only one.
    const candidates = (await getHackathonJudges()).filter(
      (j) => j.email.trim().toLowerCase() === normalizedEmail && j.active
    );
    const matches: typeof candidates = [];
    for (const cand of candidates) {
      if (await compareSecret(accessCode.trim(), cand.accessCodeHash)) matches.push(cand);
    }
    if (matches.length === 0) {
      return NextResponse.json({ error: "Invalid email or access code." }, { status: 401 });
    }

    const liveEventIds = new Set((await getHackathonEvents()).filter((e) => e.status === "live").map((e) => e.id));
    const only = <T,>(list: T[]) => (list.length === 1 ? list[0] : null);
    const authenticatedJudge =
      matches.find((j) => j.eventId === eventId) ?? only(matches.filter((j) => liveEventIds.has(j.eventId))) ?? only(matches);
    if (!authenticatedJudge) {
      return NextResponse.json(
        { error: "This email and access code work for more than one hackathon. Ask the organisers for a separate code per event." },
        { status: 409 }
      );
    }

    const judge = authenticatedJudge;

    // Generate JWT
    const token = await createJudgeToken({
      judgeId: judge.id,
      eventId: judge.eventId,
      name: judge.name,
      email: judge.email,
    });

    await logHackathonActivity({
      eventId: judge.eventId,
      action: "Judge Login Successful",
      actorType: "judge",
      actorId: judge.id,
      details: { email: judge.email, ip },
    });

    const response = NextResponse.json({
      success: true,
      judge: {
        id: judge.id,
        name: judge.name,
        email: judge.email,
        eventId: judge.eventId,
      },
    });

    response.cookies.set({
      name: HACKATHON_CONSTANTS.COOKIE_JUDGE,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: HACKATHON_CONSTANTS.JUDGE_SESSION_TTL_SECONDS,
    });

    return response;
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Judge authentication failed." },
      { status: 500 }
    );
  }
}
