import { SignJWT } from "jose";
import { cookies } from "next/headers";
import { HACKATHON_CONSTANTS, HackathonJudge, HackathonTeam } from "./constants";
import { getJwtSecret, verifyRoleToken } from "@/lib/auth";
import { getCachedTeam, getHackathonJudgeById, isTeamSessionActive } from "./data";

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
    .sign(getJwtSecret());
}

export async function verifyJudgeToken(token: string): Promise<JudgeSessionPayload | null> {
  return (await verifyRoleToken(token, "judge")) as unknown as JudgeSessionPayload | null;
}

export async function getJudgeSession(): Promise<JudgeSessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(HACKATHON_CONSTANTS.COOKIE_JUDGE)?.value;
  if (!token) return null;
  return verifyJudgeToken(token);
}

/**
 * Judge session backed by the CURRENT judge record: deactivating or deleting a judge cuts off
 * their access immediately instead of when their 8-hour token expires.
 */
export async function getActiveJudge(): Promise<{ session: JudgeSessionPayload; judge: HackathonJudge } | null> {
  const session = await getJudgeSession();
  if (!session) return null;
  const judge = await getHackathonJudgeById(session.judgeId);
  if (!judge || !judge.active || judge.eventId !== session.eventId) return null;
  return { session, judge };
}

export function isJudgeAssignedToRound(judge: HackathonJudge, roundId: string): boolean {
  return !judge.assignedRoundIds?.length || judge.assignedRoundIds.includes(roundId);
}

// ==========================================
// PARTICIPANT SESSIONS
// ==========================================

export async function createParticipantToken(payload: Omit<ParticipantSessionPayload, "role">): Promise<string> {
  return new SignJWT({ ...payload, role: "participant" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${HACKATHON_CONSTANTS.PARTICIPANT_SESSION_TTL_SECONDS}s`)
    .sign(getJwtSecret());
}

export async function verifyParticipantToken(token: string): Promise<ParticipantSessionPayload | null> {
  return (await verifyRoleToken(token, "participant")) as unknown as ParticipantSessionPayload | null;
}

export type VerifiedParticipant =
  | { status: "ok"; session: ParticipantSessionPayload; team: HackathonTeam }
  | { status: "anonymous" | "revoked" | "missing" };

/**
 * Participant session checked against the live team record and device session. A device that
 * was replaced or reset by an admin is "revoked" and must not read scorecards or vote.
 */
export async function getVerifiedParticipant(): Promise<VerifiedParticipant> {
  const session = await getParticipantSession();
  if (!session) return { status: "anonymous" };

  const team = await getCachedTeam(session.teamId);
  if (!team) return { status: "missing" };

  if (!team.allowMultipleLogins && !(await isTeamSessionActive(team.id, session.sessionId))) {
    return { status: "revoked" };
  }
  return { status: "ok", session, team };
}

export async function getParticipantSession(): Promise<ParticipantSessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(HACKATHON_CONSTANTS.COOKIE_PARTICIPANT)?.value;
  if (!token) return null;
  return verifyParticipantToken(token);
}
