import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { HACKATHON_CONSTANTS } from "./constants";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "ai-foundry-dev-jwt-secret-key-2026"
);

export interface JudgeSessionPayload {
  judgeId: string;
  eventId: string;
  name: string;
  email: string;
  role: "judge";
}

export interface ParticipantSessionPayload {
  teamId: string;
  eventId: string;
  teamCode: string;
  teamName: string;
  sessionId?: string; // Unique device session token
  isEliminated: boolean;
  finalist: boolean;
  role: "participant";
}

// ==========================================
// JUDGE SESSIONS
// ==========================================

export async function createJudgeToken(payload: Omit<JudgeSessionPayload, "role">): Promise<string> {
  return new SignJWT({ ...payload, role: "judge" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${HACKATHON_CONSTANTS.JUDGE_SESSION_TTL_SECONDS}s`)
    .sign(JWT_SECRET);
}

export async function verifyJudgeToken(token: string): Promise<JudgeSessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    if (payload.role !== "judge") return null;
    return payload as unknown as JudgeSessionPayload;
  } catch {
    return null;
  }
}

export async function getJudgeSession(): Promise<JudgeSessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(HACKATHON_CONSTANTS.COOKIE_JUDGE)?.value;
  if (!token) return null;
  return verifyJudgeToken(token);
}

// ==========================================
// PARTICIPANT SESSIONS
// ==========================================

export async function createParticipantToken(payload: Omit<ParticipantSessionPayload, "role">): Promise<string> {
  return new SignJWT({ ...payload, role: "participant" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${HACKATHON_CONSTANTS.PARTICIPANT_SESSION_TTL_SECONDS}s`)
    .sign(JWT_SECRET);
}

export async function verifyParticipantToken(token: string): Promise<ParticipantSessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    if (payload.role !== "participant") return null;
    return payload as unknown as ParticipantSessionPayload;
  } catch {
    return null;
  }
}

export async function getParticipantSession(): Promise<ParticipantSessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(HACKATHON_CONSTANTS.COOKIE_PARTICIPANT)?.value;
  if (!token) return null;
  return verifyParticipantToken(token);
}
