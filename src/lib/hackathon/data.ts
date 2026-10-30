import { randomUUID } from "crypto";
import {
  readData,
  listRecords,
  getRecord,
  putRecords,
  insertRecordIfAbsent,
  deleteRecords,
  pushLog,
  readLog,
  removeFromLog,
  clearLog,
  bumpVersion,
  readVersion,
  type CollectionSpec,
  type LogSpec,
} from "@/lib/local-db";
import {
  HackathonEvent,
  HackathonRound,
  HackathonCriteria,
  HackathonTeam,
  HackathonJudge,
  HackathonScore,
  HackathonVote,
  HackathonTiebreaker,
  HackathonActivityLog,
  HACKATHON_CONSTANTS,
} from "./constants";

// ---- Collections ----
// Keys encode the uniqueness rules, so Redis enforces them atomically:
//   scores: one evaluation per team per round; votes: one vote per team per event.
const EVENTS: CollectionSpec<HackathonEvent> = { name: "hackathon-events.json", keyOf: (e) => e.id };
const ROUNDS: CollectionSpec<HackathonRound> = { name: "hackathon-rounds.json", keyOf: (r) => r.id };
const CRITERIA: CollectionSpec<HackathonCriteria> = { name: "hackathon-criteria.json", keyOf: (c) => c.id };
const TEAMS: CollectionSpec<HackathonTeam> = { name: "hackathon-teams.json", keyOf: (t) => t.id };
const JUDGES: CollectionSpec<HackathonJudge> = { name: "hackathon-judges.json", keyOf: (j) => j.id };
const SCORES: CollectionSpec<HackathonScore> = {
  name: "hackathon-scores.json",
  keyOf: (s) => `${s.roundId}:${s.teamId}`,
};
const VOTES: CollectionSpec<HackathonVote> = {
  name: "hackathon-votes.json",
  keyOf: (v) => `${v.eventId}:${v.voterTeamId}`,
};
const TIEBREAKERS: CollectionSpec<HackathonTiebreaker> = {
  name: "hackathon-tiebreakers.json",
  keyOf: (t) => `${t.roundId}:${t.teamId}`,
};

// Device sessions live apart from team records so a login can never overwrite an admin's
// concurrent change to the team (elimination, finalist, disqualification).
export interface TeamSession {
  teamId: string;
  eventId: string;
  sessionId: string;
  lastLoginAt: string;
  expiresAt: string;
}
const SESSION_TTL_MS = HACKATHON_CONSTANTS.PARTICIPANT_SESSION_TTL_SECONDS * 1000;
const SESSIONS: CollectionSpec<TeamSession> = {
  name: "hackathon-team-sessions.json",
  keyOf: (s) => s.teamId,
  seed: async () =>
    (await readData<HackathonTeam[]>(TEAMS.name, []))
      .filter((t) => t.activeSessionId)
      .map((t) => {
        const lastLoginAt = t.lastLoginAt || new Date().toISOString();
        return {
          teamId: t.id,
          eventId: t.eventId,
          sessionId: t.activeSessionId as string,
          lastLoginAt,
          expiresAt: new Date(Date.parse(lastLoginAt) + SESSION_TTL_MS).toISOString(),
        };
      }),
};

const logSpec = (eventId: string): LogSpec<HackathonActivityLog> => ({
  name: `hackathon-logs-${eventId.replace(/[^a-zA-Z0-9_-]/g, "_")}.json`,
  // 600 logins plus 600 votes must not push the admin's own actions out of the trail.
  max: 5000,
  seed: async () =>
    (await readData<HackathonActivityLog[]>("hackathon-logs.json", [])).filter((l) => l.eventId === eventId),
});

// ---- Read cache, invalidated by the shared change counter ----
// Every write bumps the version in Redis; any instance that sees a new version drops its cache,
// so all servers serve fresh data within ~1s of a write while polling clients stay cheap.
const VERSION_KEY = "hackathon";
const VERSION_RECHECK_MS = 1000;
const CACHE_SAFETY_TTL_MS = 15000; // only matters if a version bump itself failed

interface HotState {
  cache: Map<string, { data: Promise<unknown[]>; timestamp: number }>;
  version: number;
  checkedAt: number;
  pending: Promise<number> | null;
}
const globalForHot = globalThis as unknown as { __hackathonHot?: HotState };
const hot: HotState = (globalForHot.__hackathonHot ??= {
  cache: new Map(),
  version: -1,
  checkedAt: 0,
  pending: null,
});

/** Current change counter. `atLeast` forces a re-read when a client has already seen a newer version. */
export async function syncHackathonVersion(atLeast = 0): Promise<number> {
  if (Date.now() - hot.checkedAt < VERSION_RECHECK_MS && hot.version >= atLeast) return hot.version;
  hot.pending ??= readVersion(VERSION_KEY)
    .then((v) => {
      if (v !== hot.version) hot.cache.clear();
      hot.version = v;
      hot.checkedAt = Date.now();
      return v;
    })
    .finally(() => {
      hot.pending = null;
    });
  return hot.pending;
}

/** The shared cached rows. Read-only: callers that might mutate use cachedList. */
async function cachedRows<T>(spec: CollectionSpec<T>): Promise<readonly T[]> {
  await syncHackathonVersion();
  let entry = hot.cache.get(spec.name);
  if (!entry || Date.now() - entry.timestamp > CACHE_SAFETY_TTL_MS) {
    // Cache the promise, so a burst of requests after a change triggers one Redis read, not hundreds.
    entry = { data: listRecords(spec) as Promise<unknown[]>, timestamp: Date.now() };
    hot.cache.set(spec.name, entry);
    entry.data.catch(() => hot.cache.delete(spec.name));
  }
  return (await entry.data) as T[];
}

async function cachedList<T>(spec: CollectionSpec<T>): Promise<T[]> {
  // Callers mutate what they get back; never hand out the shared cached objects.
  return structuredClone(await cachedRows(spec)) as T[];
}

async function changed(): Promise<void> {
  const v = await bumpVersion(VERSION_KEY);
  hot.cache.clear();
  hot.version = v;
  hot.checkedAt = Date.now();
}

// ==========================================
// EVENTS
// ==========================================

export async function getHackathonEvents(): Promise<HackathonEvent[]> {
  return cachedList(EVENTS);
}

export async function getHackathonEventById(id: string): Promise<HackathonEvent | null> {
  const events = await getHackathonEvents();
  return events.find((e) => e.id === id) || null;
}

export async function saveHackathonEvent(event: HackathonEvent): Promise<boolean> {
  const now = new Date().toISOString();
  const existing = await getRecord(EVENTS, event.id);
  await putRecords(EVENTS, [{ ...event, createdAt: existing?.createdAt || event.createdAt || now, updatedAt: now }]);
  await changed();
  return true;
}

export async function deleteHackathonEvent(id: string): Promise<boolean> {
  const byEvent = <T extends { eventId: string }>(spec: CollectionSpec<T>) =>
    listRecords(spec).then((rows) =>
      deleteRecords(spec, rows.filter((r) => r.eventId === id).map(spec.keyOf))
    );

  await deleteRecords(EVENTS, [id]);
  await Promise.all([
    byEvent(ROUNDS),
    byEvent(CRITERIA),
    byEvent(TEAMS),
    byEvent(JUDGES),
    byEvent(SCORES),
    byEvent(VOTES),
    byEvent(TIEBREAKERS),
    byEvent(SESSIONS),
    clearLog(logSpec(id)),
  ]);
  await changed();
  return true;
}

// ==========================================
// ROUNDS
// ==========================================

export async function getHackathonRounds(eventId?: string): Promise<HackathonRound[]> {
  const rounds = await cachedList(ROUNDS);
  return (eventId ? rounds.filter((r) => r.eventId === eventId) : rounds).sort(
    (a, b) => a.roundNumber - b.roundNumber
  );
}

export async function getHackathonRoundById(id: string): Promise<HackathonRound | null> {
  const rounds = await cachedList(ROUNDS);
  return rounds.find((r) => r.id === id) || null;
}

export async function saveHackathonRound(round: HackathonRound): Promise<boolean> {
  await putRecords(ROUNDS, [round]);
  await changed();
  return true;
}

export async function deleteHackathonRound(id: string): Promise<boolean> {
  await deleteRecords(ROUNDS, [id]);
  await changed();
  return true;
}

// ==========================================
// CRITERIA
// ==========================================

export async function getHackathonCriteria(eventId?: string, roundId?: string): Promise<HackathonCriteria[]> {
  let res = await cachedList(CRITERIA);
  if (eventId) res = res.filter((c) => c.eventId === eventId);
  if (roundId) res = res.filter((c) => c.roundId === roundId || !c.roundId);
  return res;
}

export async function saveHackathonCriteria(criteria: HackathonCriteria): Promise<boolean> {
  await putRecords(CRITERIA, [criteria]);
  await changed();
  return true;
}

export async function deleteHackathonCriteria(id: string): Promise<boolean> {
  await deleteRecords(CRITERIA, [id]);
  await changed();
  return true;
}

export async function copyCriteriaFromRound(
  eventId: string,
  fromRoundId: string,
  toRoundId: string
): Promise<{ ok: boolean; count: number }> {
  const source = (await listRecords(CRITERIA)).filter(
    (c) => c.eventId === eventId && (c.roundId === fromRoundId || !c.roundId)
  );
  if (source.length === 0) return { ok: false, count: 0 };

  const copies: HackathonCriteria[] = source.map((c) => ({
    ...c,
    id: `crit-${randomUUID()}`,
    roundId: toRoundId,
  }));
  await putRecords(CRITERIA, copies);
  await changed();
  return { ok: true, count: copies.length };
}

// ==========================================
// TEAMS
// ==========================================

export async function getHackathonTeams(eventId?: string): Promise<HackathonTeam[]> {
  const teams = await cachedList(TEAMS);
  return eventId ? teams.filter((t) => t.eventId === eventId) : teams;
}

export async function getHackathonTeamById(id: string): Promise<HackathonTeam | null> {
  return getRecord(TEAMS, id); // uncached: auth and voting decisions need the current record
}

/**
 * Team lookup for participant requests (scorecards, votes). Served from the version-invalidated
 * cache: with 600 teams refreshing at once this saves a Redis read per request. Admin
 * read-modify-write paths use getHackathonTeamById instead.
 */
export async function getCachedTeam(id: string): Promise<HackathonTeam | null> {
  const team = (await cachedRows(TEAMS)).find((t) => t.id === id);
  return team ? structuredClone(team) : null;
}

const sameCode = (a: HackathonTeam, b: HackathonTeam) =>
  a.eventId === b.eventId && a.teamCode.trim().toUpperCase() === b.teamCode.trim().toUpperCase();

// seniordev: team-code uniqueness is check-then-write. Only admins create teams, so concurrent
// duplicate creation is not a realistic race; add a code->id HSETNX index if that changes.
export async function saveHackathonTeam(team: HackathonTeam): Promise<{ ok: boolean; error?: string }> {
  const teams = await listRecords(TEAMS);
  const duplicate = teams.find((t) => t.id !== team.id && sameCode(t, team));
  if (duplicate) {
    return { ok: false, error: `Team Code ${team.teamCode} is already in use by ${duplicate.teamName}` };
  }
  const { activeSessionId: _legacy, lastLoginAt: _legacyLogin, ...clean } = team;
  await putRecords(TEAMS, [clean]);
  await changed();
  return { ok: true };
}

export async function saveHackathonTeamsBatch(newTeams: HackathonTeam[]): Promise<{ ok: boolean; error?: string }> {
  const seen = new Set<string>();
  for (const t of newTeams) {
    const code = t.teamCode.trim().toUpperCase();
    if (seen.has(code)) return { ok: false, error: `Duplicate Team Code ${t.teamCode} found in batch` };
    seen.add(code);
  }

  const existing = await listRecords(TEAMS);
  for (const t of newTeams) {
    if (existing.some((e) => e.id !== t.id && sameCode(e, t))) {
      return { ok: false, error: `Team Code ${t.teamCode} already exists in event` };
    }
  }

  await putRecords(TEAMS, newTeams);
  await changed();
  return { ok: true };
}

/** Batch status update (round advancement). One write, no per-team blob rewrites. */
export async function saveHackathonTeams(teams: HackathonTeam[]): Promise<boolean> {
  await putRecords(TEAMS, teams);
  await changed();
  return true;
}

export async function deleteHackathonTeam(id: string): Promise<boolean> {
  await deleteRecords(TEAMS, [id]);
  await deleteRecords(SESSIONS, [id]);
  await changed();
  return true;
}

// ==========================================
// TEAM DEVICE SESSIONS
// ==========================================

const isLive = (s: TeamSession | null): s is TeamSession => !!s && Date.parse(s.expiresAt) > Date.now();

export async function getActiveTeamSession(teamId: string): Promise<TeamSession | null> {
  const session = await getRecord(SESSIONS, teamId);
  return isLive(session) ? session : null;
}

/**
 * Starts a device session. With single-device mode, a second device is refused while the first
 * session is live; expired sessions (token TTL passed) are taken over automatically.
 */
export async function startTeamSession(
  team: HackathonTeam
): Promise<{ ok: true; sessionId: string } | { ok: false; error: string }> {
  const now = Date.now();
  const session: TeamSession = {
    teamId: team.id,
    eventId: team.eventId,
    sessionId: randomUUID(),
    lastLoginAt: new Date(now).toISOString(),
    expiresAt: new Date(now + SESSION_TTL_MS).toISOString(),
  };

  if (team.allowMultipleLogins) {
    await putRecords(SESSIONS, [session]);
    return { ok: true, sessionId: session.sessionId };
  }
  if (await insertRecordIfAbsent(SESSIONS, session)) {
    return { ok: true, sessionId: session.sessionId };
  }

  if (isLive(await getRecord(SESSIONS, team.id))) {
    return {
      ok: false,
      error:
        "Account already logged in on another device. Simultaneous logins are disabled. Please log out from the other device or ask an event administrator to reset your session.",
    };
  }
  await putRecords(SESSIONS, [session]);
  return { ok: true, sessionId: session.sessionId };
}

/**
 * Whether this device holds the team's live session. A cache hit can be trusted because every
 * revocation (reset, logout, team deletion) bumps the version and clears the cache; a miss is
 * re-read from storage, because a brand-new login doesn't bump the version.
 */
export async function isTeamSessionActive(teamId: string, sessionId: string | undefined): Promise<boolean> {
  if (!sessionId) return false;
  const hit = (await cachedRows(SESSIONS)).find((s) => s.teamId === teamId);
  if (hit && hit.sessionId === sessionId && isLive(hit)) return true;
  const fresh = await getRecord(SESSIONS, teamId);
  return isLive(fresh) && fresh.sessionId === sessionId;
}

export async function endTeamSession(teamId: string): Promise<void> {
  await deleteRecords(SESSIONS, [teamId]);
  await changed(); // lets a device whose session was reset notice right away
}

export async function getLiveSessionsByTeam(eventId?: string): Promise<Map<string, TeamSession>> {
  const sessions = (await listRecords(SESSIONS)).filter(
    (s) => isLive(s) && (!eventId || s.eventId === eventId)
  );
  return new Map(sessions.map((s) => [s.teamId, s]));
}

// ==========================================
// JUDGES
// ==========================================

export async function getHackathonJudges(eventId?: string): Promise<HackathonJudge[]> {
  const judges = await cachedList(JUDGES);
  return eventId ? judges.filter((j) => j.eventId === eventId) : judges;
}

export async function getHackathonJudgeById(id: string): Promise<HackathonJudge | null> {
  return getRecord(JUDGES, id);
}

export async function getHackathonJudgeByEmail(email: string, eventId?: string): Promise<HackathonJudge | null> {
  const normalized = email.trim().toLowerCase();
  const judges = await getHackathonJudges(eventId);
  return judges.find((j) => j.email.trim().toLowerCase() === normalized) || null;
}

export async function saveHackathonJudge(judge: HackathonJudge): Promise<{ ok: boolean; error?: string }> {
  const judges = await listRecords(JUDGES);
  const duplicate = judges.find(
    (j) =>
      j.id !== judge.id &&
      j.eventId === judge.eventId &&
      j.email.trim().toLowerCase() === judge.email.trim().toLowerCase()
  );
  if (duplicate) {
    return { ok: false, error: `Email ${judge.email} is already registered as a judge in this event` };
  }
  await putRecords(JUDGES, [judge]);
  await changed();
  return { ok: true };
}

export async function deleteHackathonJudge(id: string): Promise<boolean> {
  await deleteRecords(JUDGES, [id]);
  await changed();
  return true;
}

// ==========================================
// SCORES
// ==========================================

export async function getHackathonScores(eventId?: string, roundId?: string): Promise<HackathonScore[]> {
  let res = await cachedList(SCORES);
  if (eventId) res = res.filter((s) => s.eventId === eventId);
  if (roundId) res = res.filter((s) => s.roundId === roundId);
  return res;
}

export async function getHackathonScore(roundId: string, teamId: string): Promise<HackathonScore | null> {
  return getRecord(SCORES, `${roundId}:${teamId}`);
}

/**
 * Records a score. Exactly one evaluation per team per round: the first submission wins atomically.
 * Updates are allowed for admin overrides (`allowUpdate`) or when a revision was requested from
 * the original judge. The original judge and submission time are kept.
 */
export async function saveHackathonScore(
  score: HackathonScore,
  allowUpdate = false
): Promise<{ ok: boolean; error?: string }> {
  const now = new Date().toISOString();
  if (await insertRecordIfAbsent(SCORES, { ...score, submittedAt: now })) {
    await changed();
    return { ok: true };
  }

  const existing = await getRecord(SCORES, SCORES.keyOf(score));
  const canUpdate =
    !!existing && (allowUpdate || (existing.changeRequested === true && existing.judgeId === score.judgeId));
  if (!existing || !canUpdate) {
    return {
      ok: false,
      error: "This team has already been evaluated for this round. Additional evaluations are locked.",
    };
  }

  await putRecords(SCORES, [
    {
      ...score,
      id: existing.id,
      judgeId: existing.judgeId,
      submittedAt: existing.submittedAt,
      changeRequested: false,
      changeReason: undefined,
      updatedAt: now,
    },
  ]);
  await changed();
  return { ok: true };
}

/** Opens or closes a revision request on one score without touching its marks. */
export async function setScoreRevisionRequest(
  roundId: string,
  teamId: string,
  requested: boolean,
  reason?: string
): Promise<HackathonScore | null> {
  const existing = await getHackathonScore(roundId, teamId);
  if (!existing) return null;
  const updated: HackathonScore = {
    ...existing,
    changeRequested: requested,
    changeReason: requested ? reason || "Administrator authorized score revision" : undefined,
  };
  await putRecords(SCORES, [updated]);
  await changed();
  return updated;
}

// ==========================================
// VOTES
// ==========================================

export async function getHackathonVotes(eventId?: string, roundId?: string): Promise<HackathonVote[]> {
  let res = await cachedList(VOTES);
  if (eventId) res = res.filter((v) => v.eventId === eventId);
  if (roundId) res = res.filter((v) => v.roundId === roundId);
  return res;
}

export async function getTeamVote(eventId: string, voterTeamId: string): Promise<HackathonVote | null> {
  return getRecord(VOTES, `${eventId}:${voterTeamId}`);
}

/** One vote per team per event, enforced atomically by the record key. */
export async function recordHackathonVote(vote: HackathonVote): Promise<{ ok: boolean; error?: string }> {
  if (!(await insertRecordIfAbsent(VOTES, vote))) {
    return { ok: false, error: "Your team has already cast a vote for this hackathon." };
  }
  await changed();
  return { ok: true };
}

// ==========================================
// TIEBREAKERS
// ==========================================

export async function getHackathonTiebreakers(eventId?: string, roundId?: string): Promise<HackathonTiebreaker[]> {
  let res = await cachedList(TIEBREAKERS);
  if (eventId) res = res.filter((t) => t.eventId === eventId);
  if (roundId) res = res.filter((t) => t.roundId === roundId);
  return res;
}

export async function saveHackathonTiebreaker(tiebreaker: HackathonTiebreaker): Promise<boolean> {
  await putRecords(TIEBREAKERS, [tiebreaker]);
  await changed();
  return true;
}

// ==========================================
// AUDIT / ACTIVITY LOGS (append-only list per event, newest first)
// ==========================================

export async function logHackathonActivity(activity: Omit<HackathonActivityLog, "id" | "timestamp">): Promise<void> {
  try {
    await pushLog(logSpec(activity.eventId), {
      ...activity,
      id: `log-${randomUUID()}`,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error("[hackathon-data] Failed to log activity:", err);
  }
}

/** Newest entries first; the admin page shows the latest 300. */
export async function getHackathonLogs(eventId: string, limit = 300): Promise<HackathonActivityLog[]> {
  return readLog(logSpec(eventId), limit);
}

export async function deleteHackathonLog(eventId: string, id: string): Promise<boolean> {
  await removeFromLog(logSpec(eventId), (l) => l.id === id);
  return true;
}

export async function clearHackathonLogs(eventId: string): Promise<boolean> {
  await clearLog(logSpec(eventId));
  return true;
}
