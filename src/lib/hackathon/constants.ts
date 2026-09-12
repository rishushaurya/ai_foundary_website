/**
 * Hackathon Leaderboard - Core System Constants & Interfaces
 * Enforces architectural rules: 70/30 judge/vote split, 100 scale, 2-decimal precision
 */

export const HACKATHON_CONSTANTS = {
  // Scoring split for Final Round (70% Judges, 30% Audience Votes)
  JUDGE_WEIGHT: 0.70,
  VOTE_WEIGHT: 0.30,
  MAX_SCORE_SCALE: 100.0,
  DECIMAL_PRECISION: 2,

  // Session Lifetimes (seconds)
  JUDGE_SESSION_TTL_SECONDS: 8 * 60 * 60, // 8 hours
  PARTICIPANT_SESSION_TTL_SECONDS: 12 * 60 * 60, // 12 hours

  // Polling & Real-time Synchronization
  POLL_INTERVAL_MS: 15000, // 15 seconds recommended for client poll
  STATUS_CACHE_TTL_MS: 5000, // 5 seconds in-memory TTL to protect Redis free tier

  // Cookie Names
  COOKIE_JUDGE: "judge-session",
  COOKIE_PARTICIPANT: "participant-session",
  COOKIE_ADMIN: "admin-token",

  // Rate Limiting (calls allowed per window)
  RATE_LIMITS: {
    JUDGE_LOGIN: { limit: 5, windowMs: 15 * 60 * 1000 }, // 5 per 15 min
    PARTICIPANT_VERIFY: { limit: 10, windowMs: 10 * 60 * 1000 }, // 10 per 10 min
    JUDGE_SCORE: { limit: 60, windowMs: 60 * 1000 }, // 60 per min
    VOTE_SUBMIT: { limit: 3, windowMs: 5 * 60 * 1000 }, // 3 per 5 min
    PUBLIC_POLL: { limit: 120, windowMs: 60 * 1000 }, // 120 per min per IP
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
