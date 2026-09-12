import { NextResponse } from "next/server";
import { getHackathonJudges, logHackathonActivity } from "@/lib/hackathon/data";
import { compareSecret } from "@/lib/hackathon/validators";
import { createJudgeToken } from "@/lib/hackathon/sessions";
import { HACKATHON_CONSTANTS } from "@/lib/hackathon/constants";
import { checkRateLimit } from "@/lib/rate-limiter";

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";

  try {
    const body = await request.json();
    const { email, accessCode, eventId } = body;

    if (!email || !accessCode) {
      return NextResponse.json(
        { error: "Email and Judge Access Code are required." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Smooth Rate Limiting per Judge Email (prevents venue Wi-Fi NAT collisions)
    const rate = checkRateLimit(
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
    const judges = await getHackathonJudges();
    const candidates = judges.filter(
      (j) => j.email.trim().toLowerCase() === normalizedEmail && j.active && (!eventId || j.eventId === eventId)
    );

    if (candidates.length === 0) {
      return NextResponse.json(
        { error: "Invalid credentials or judge account is inactive." },
        { status: 401 }
      );
    }

    let authenticatedJudge: typeof candidates[0] | null = null;
    for (const cand of candidates) {
      const valid = await compareSecret(accessCode.trim(), cand.accessCodeHash);
      if (valid) {
        authenticatedJudge = cand;
        break;
      }
    }

    if (!authenticatedJudge) {
      return NextResponse.json(
        { error: "Invalid credentials. Please verify your Judge Access Code." },
        { status: 401 }
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
