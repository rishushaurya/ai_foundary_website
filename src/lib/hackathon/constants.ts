/**
 * Hackathon Leaderboard - Core System Constants & Interfaces
 * Enforces architectural rules: admin-set final judge/vote split, 100 scale, 2-decimal precision
 */

export const HACKATHON_CONSTANTS = {
  // Final round judges' share in percent when the admin hasn't set one (votes get the rest)
  DEFAULT_JUDGE_WEIGHT_PCT: 70,
  MAX_SCORE_SCALE: 100.0,
  DECIMAL_PRECISION: 2,

  // Session Lifetimes (seconds)
  JUDGE_SESSION_TTL_SECONDS: 8 * 60 * 60, // 8 hours
  PARTICIPANT_SESSION_TTL_SECONDS: 12 * 60 * 60, // 12 hours

  // Cookie Names
  COOKIE_JUDGE: "judge-session",
  COOKIE_PARTICIPANT: "participant-session",
  COOKIE_ADMIN: "admin-token",

  // Rate Limiting (calls allowed per window - calibrated for smooth hackathon live operation)
  RATE_LIMITS: {
    // Keyed per judge email / team code (not IP), so venue Wi-Fi sharing is unaffected; low enough to stop guessing.
    JUDGE_LOGIN: { limit: 10, windowMs: 60 * 1000 },
    PARTICIPANT_VERIFY: { limit: 10, windowMs: 60 * 1000 },
    JUDGE_SCORE: { limit: 120, windowMs: 60 * 1000 }, // 120 per min (zero friction for evaluators)
    VOTE_SUBMIT: { limit: 20, windowMs: 30 * 1000 }, // 20 per 30s (smooth, immediate vote casting without delays)
    PUBLIC_POLL: { limit: 300, windowMs: 60 * 1000 }, // 300 per min (supports fast live updates)
  },
} as const;

// ---- Data Entities ----

export type EventStatus = "draft" | "live" | "completed" | "archived";
export type RoundType = "qualifier" | "semi-final" | "final";
export type RoundStatus = "pending" | "active" | "scoring" | "completed";

export interface HackathonEvent {
  id: string;
  title: string;
  description: string;
  theme?: string;
  status: EventStatus;
  currentRoundNumber: number;
  isVotingOpen: boolean; // Active audience voting toggle
  activeRoundId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface HackathonRound {
  id: string;
  eventId: string;
  roundNumber: number;
  name: string;
  type: RoundType;
  status: RoundStatus;
  cutoffRank?: number; // e.g. Top 10 advance
  isElimination: boolean;
  isPublished?: boolean; // Whether marks/rankings are visible to public
  allowRevisions?: boolean; // Universal toggle: allows judges to revise submitted scores for this round
  judgeWeight?: number; // Final round only: judges' share in percent (0-100); audience votes get the rest
  description?: string;
  createdAt: string;
}

export interface HackathonCriteria {
  id: string;
  eventId: string;
  roundId: string; // Belongs to a round or all rounds if empty
  name: string;
  description?: string;
  maxMarks: number; // e.g. 10
  weight: number; // e.g. 1.0
}

export interface HackathonTeam {
  id: string;
  eventId: string;
  teamCode: string; // Globally unique identifier shown to users (e.g. "TEAM-401")
  teamName: string;
  leaderName?: string;
  leaderEmail?: string;
  leaderPhone?: string;
  members?: string[]; // Member names
  verificationCodeHash: string; // bcrypt hash of secret passkey given to team
  passkey?: string; // Stored passkey for admin lookup with eye toggle
  activeSessionId?: string; // ID of active device session (single-device enforcement)
  lastLoginAt?: string;
  allowMultipleLogins?: boolean; // Admin override to permit multi-device login
  isEliminated: boolean;
  eliminatedInRoundId?: string;
  finalist: boolean;
  disqualified?: boolean;
  disqualificationReason?: string;
  createdAt: string;
}

export interface HackathonJudge {
  id: string;
  eventId: string;
  name: string;
  email: string;
  accessCodeHash: string; // bcrypt hash of judge secret access code
  accessCode?: string; // Stored code for admin lookup with eye toggle
  active: boolean;
  assignedRoundIds?: string[]; // Empty means all rounds
  createdAt: string;
}

export interface HackathonScore {
  id: string;
  eventId: string;
  roundId: string;
  judgeId: string;
  teamId: string;
  criterionScores: Record<string, number>; // criterionId -> marks awarded
  totalMarksAwarded: number;
  totalMaxPossible: number;
  normalizedScore: number; // Normalized to 100-point scale (2 decimals)
  feedback?: string;
  changeRequested?: boolean; // Admin requested judge to modify score
  changeReason?: string;
  submittedAt: string;
  updatedAt?: string;
}

export interface HackathonVote {
  id: string;
  eventId: string;
  roundId: string; // Final round ID
  voterTeamId: string; // Eliminated team casting the vote
  candidateTeamId: string; // Finalist team receiving the vote
  submittedAt: string;
  ipAddress: string;
}

export interface HackathonTiebreaker {
  id: string;
  eventId: string;
  roundId: string;
  teamId: string;
  rankAdjustment: number; // e.g. -1 or +1 rank shift
  reason: string;
  appliedBy: string; // Admin identifier
  appliedAt: string;
}

export interface HackathonActivityLog {
  id: string;
  eventId: string;
  action: string;
  actorType: "admin" | "judge" | "participant" | "system";
  actorId: string;
  details?: Record<string, any>;
  timestamp: string;
}
