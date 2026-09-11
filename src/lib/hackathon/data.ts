import { readData, writeData } from "@/lib/local-db";
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

// ---- Files ----
const FILES = {
  EVENTS: "hackathon-events.json",
  ROUNDS: "hackathon-rounds.json",
  CRITERIA: "hackathon-criteria.json",
  TEAMS: "hackathon-teams.json",
  JUDGES: "hackathon-judges.json",
  SCORES: "hackathon-scores.json",
  VOTES: "hackathon-votes.json",
  TIEBREAKERS: "hackathon-tiebreakers.json",
  LOGS: "hackathon-logs.json",
};

// ---- In-Memory Short-Lived Cache (Protection against 1000+ polling clients) ----
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}
const globalForHotCache = globalThis as unknown as {
  __hackathonHotCache?: Map<string, CacheEntry<any>>;
};
export const hotCache = globalForHotCache.__hackathonHotCache ?? new Map<string, CacheEntry<any>>();
globalForHotCache.__hackathonHotCache = hotCache;

async function cachedRead<T>(filename: string, defaultValue: T, ttlMs: number = HACKATHON_CONSTANTS.STATUS_CACHE_TTL_MS): Promise<T> {
  const now = Date.now();
  const cached = hotCache.get(filename);
  if (cached && now - cached.timestamp < ttlMs) {
    return cached.data as T;
  }
  const fresh = await readData<T>(filename, defaultValue);
  hotCache.set(filename, { data: fresh, timestamp: now });
  return fresh;
}

async function writeAndInvalidate<T>(filename: string, data: T): Promise<boolean> {
  hotCache.delete(filename); // Bust short-lived cache
  const ok = await writeData<T>(filename, data);
  if (ok) {
    hotCache.set(filename, { data, timestamp: Date.now() });
  }
  return ok;
}

// ==========================================
// EVENTS
// ==========================================

export async function getHackathonEvents(): Promise<HackathonEvent[]> {
  return cachedRead<HackathonEvent[]>(FILES.EVENTS, []);
}

export async function getHackathonEventById(id: string): Promise<HackathonEvent | null> {
  const events = await getHackathonEvents();
  return events.find((e) => e.id === id) || null;
}

export async function saveHackathonEvent(event: HackathonEvent): Promise<boolean> {
  const events = await cachedRead<HackathonEvent[]>(FILES.EVENTS, [], 0); // bypass cache on write
  const idx = events.findIndex((e) => e.id === event.id);
  if (idx >= 0) {
    events[idx] = { ...event, updatedAt: new Date().toISOString() };
  } else {
    events.push({ ...event, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
  }
  return writeAndInvalidate(FILES.EVENTS, events);
}

export async function deleteHackathonEvent(id: string): Promise<boolean> {
  const events = await cachedRead<HackathonEvent[]>(FILES.EVENTS, [], 0);
  const filtered = events.filter((e) => e.id !== id);
  await writeAndInvalidate(FILES.EVENTS, filtered);

  // Cascading purge of all event records across all entities
  try {
    const rounds = await cachedRead<HackathonRound[]>(FILES.ROUNDS, [], 0);
    await writeAndInvalidate(FILES.ROUNDS, rounds.filter((r) => r.eventId !== id));

    const criteria = await cachedRead<HackathonCriteria[]>(FILES.CRITERIA, [], 0);
    await writeAndInvalidate(FILES.CRITERIA, criteria.filter((c) => c.eventId !== id));

    const teams = await cachedRead<HackathonTeam[]>(FILES.TEAMS, [], 0);
    await writeAndInvalidate(FILES.TEAMS, teams.filter((t) => t.eventId !== id));

    const judges = await cachedRead<HackathonJudge[]>(FILES.JUDGES, [], 0);
    await writeAndInvalidate(FILES.JUDGES, judges.filter((j) => j.eventId !== id));

    const scores = await cachedRead<HackathonScore[]>(FILES.SCORES, [], 0);
    await writeAndInvalidate(FILES.SCORES, scores.filter((s) => s.eventId !== id));

    const votes = await cachedRead<HackathonVote[]>(FILES.VOTES, [], 0);
    await writeAndInvalidate(FILES.VOTES, votes.filter((v) => v.eventId !== id));

    const ties = await cachedRead<HackathonTiebreaker[]>(FILES.TIEBREAKERS, [], 0);
    await writeAndInvalidate(FILES.TIEBREAKERS, ties.filter((t) => t.eventId !== id));

    const logs = await cachedRead<HackathonActivityLog[]>(FILES.LOGS, [], 0);
    await writeAndInvalidate(FILES.LOGS, logs.filter((l) => l.eventId !== id));
  } catch (err) {
    console.error("[hackathon-data] Cascading purge warning:", err);
  }

  return true;
}

// ==========================================
// ROUNDS
// ==========================================

export async function getHackathonRounds(eventId?: string): Promise<HackathonRound[]> {
  const rounds = await cachedRead<HackathonRound[]>(FILES.ROUNDS, []);
  if (eventId) {
    return rounds
      .filter((r) => r.eventId === eventId)
      .sort((a, b) => a.roundNumber - b.roundNumber);
  }
  return rounds.sort((a, b) => a.roundNumber - b.roundNumber);
}

export async function getHackathonRoundById(id: string): Promise<HackathonRound | null> {
  const rounds = await cachedRead<HackathonRound[]>(FILES.ROUNDS, []);
  return rounds.find((r) => r.id === id) || null;
}

export async function saveHackathonRound(round: HackathonRound): Promise<boolean> {
  const rounds = await cachedRead<HackathonRound[]>(FILES.ROUNDS, [], 0);
  const idx = rounds.findIndex((r) => r.id === round.id);
  if (idx >= 0) {
    rounds[idx] = round;
  } else {
    rounds.push(round);
  }
  return writeAndInvalidate(FILES.ROUNDS, rounds);
}

export async function deleteHackathonRound(id: string): Promise<boolean> {
  const rounds = await cachedRead<HackathonRound[]>(FILES.ROUNDS, [], 0);
  const filtered = rounds.filter((r) => r.id !== id);
  return writeAndInvalidate(FILES.ROUNDS, filtered);
}

// ==========================================
// CRITERIA
// ==========================================

export async function getHackathonCriteria(eventId?: string, roundId?: string): Promise<HackathonCriteria[]> {
  const criteria = await cachedRead<HackathonCriteria[]>(FILES.CRITERIA, []);
  let res = criteria;
  if (eventId) res = res.filter((c) => c.eventId === eventId);
  if (roundId) res = res.filter((c) => c.roundId === roundId || !c.roundId);
  return res;
}

export async function saveHackathonCriteria(criteria: HackathonCriteria): Promise<boolean> {
  const all = await cachedRead<HackathonCriteria[]>(FILES.CRITERIA, [], 0);
  const idx = all.findIndex((c) => c.id === criteria.id);
  if (idx >= 0) {
    all[idx] = criteria;
  } else {
    all.push(criteria);
  }
  return writeAndInvalidate(FILES.CRITERIA, all);
}

export async function deleteHackathonCriteria(id: string): Promise<boolean> {
  const all = await cachedRead<HackathonCriteria[]>(FILES.CRITERIA, [], 0);
  const filtered = all.filter((c) => c.id !== id);
  return writeAndInvalidate(FILES.CRITERIA, filtered);
}

export async function copyCriteriaFromRound(
  eventId: string,
  fromRoundId: string,
  toRoundId: string
): Promise<{ ok: boolean; count: number }> {
  const allCriteria = await cachedRead<HackathonCriteria[]>(FILES.CRITERIA, [], 0);
  const source = allCriteria.filter(
    (c) => c.eventId === eventId && (c.roundId === fromRoundId || !c.roundId)
  );
  if (source.length === 0) return { ok: false, count: 0 };

  const newCriteria: HackathonCriteria[] = source.map((c) => ({
    ...c,
    id: `crit-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    roundId: toRoundId,
  }));

  allCriteria.push(...newCriteria);
  const ok = await writeAndInvalidate(FILES.CRITERIA, allCriteria);
  return { ok, count: newCriteria.length };
}

// ==========================================
// TEAMS
// ==========================================

export async function getHackathonTeams(eventId?: string): Promise<HackathonTeam[]> {
  const teams = await cachedRead<HackathonTeam[]>(FILES.TEAMS, []);
  if (eventId) return teams.filter((t) => t.eventId === eventId);
  return teams;
}

export async function getHackathonTeamById(id: string): Promise<HackathonTeam | null> {
  const teams = await cachedRead<HackathonTeam[]>(FILES.TEAMS, []);
  return teams.find((t) => t.id === id) || null;
}

export async function getHackathonTeamByCode(teamCode: string, eventId?: string): Promise<HackathonTeam | null> {
  const teams = await cachedRead<HackathonTeam[]>(FILES.TEAMS, []);
  const normalized = teamCode.trim().toUpperCase();
  return (
    teams.find((t) => {
      const matchCode = t.teamCode.trim().toUpperCase() === normalized;
      return eventId ? matchCode && t.eventId === eventId : matchCode;
    }) || null
  );
}

export async function saveHackathonTeam(team: HackathonTeam): Promise<{ ok: boolean; error?: string }> {
  const teams = await cachedRead<HackathonTeam[]>(FILES.TEAMS, [], 0);
  // Check globally unique team code across this event
  const duplicate = teams.find(
    (t) =>
      t.id !== team.id &&
      t.eventId === team.eventId &&
      t.teamCode.trim().toUpperCase() === team.teamCode.trim().toUpperCase()
  );
  if (duplicate) {
    return { ok: false, error: `Team Code ${team.teamCode} is already in use by ${duplicate.teamName}` };
  }

  const idx = teams.findIndex((t) => t.id === team.id);
  if (idx >= 0) {
    teams[idx] = team;
  } else {
    teams.push(team);
  }
  const ok = await writeAndInvalidate(FILES.TEAMS, teams);
  return { ok };
}

export async function saveHackathonTeamsBatch(newTeams: HackathonTeam[]): Promise<{ ok: boolean; error?: string }> {
  const teams = await cachedRead<HackathonTeam[]>(FILES.TEAMS, [], 0);
  
  // Validation for internal batch duplicates
  const codeSet = new Set<string>();
  for (const t of newTeams) {
    const code = t.teamCode.trim().toUpperCase();
    if (codeSet.has(code)) {
      return { ok: false, error: `Duplicate Team Code ${t.teamCode} found in batch` };
    }
    codeSet.add(code);
  }

  // Check against existing
  for (const t of newTeams) {
    const code = t.teamCode.trim().toUpperCase();
    const exists = teams.find((e) => e.eventId === t.eventId && e.teamCode.trim().toUpperCase() === code && e.id !== t.id);
    if (exists) {
      return { ok: false, error: `Team Code ${t.teamCode} already exists in event` };
    }
  }

  // Merge
  for (const t of newTeams) {
    const idx = teams.findIndex((e) => e.id === t.id);
    if (idx >= 0) {
      teams[idx] = t;
    } else {
      teams.push(t);
    }
  }

  const ok = await writeAndInvalidate(FILES.TEAMS, teams);
  return { ok };
}

export async function deleteHackathonTeam(id: string): Promise<boolean> {
  const teams = await cachedRead<HackathonTeam[]>(FILES.TEAMS, [], 0);
  const filtered = teams.filter((t) => t.id !== id);
  return writeAndInvalidate(FILES.TEAMS, filtered);
}

// ==========================================
// JUDGES
// ==========================================

export async function getHackathonJudges(eventId?: string): Promise<HackathonJudge[]> {
  const judges = await cachedRead<HackathonJudge[]>(FILES.JUDGES, []);
  if (eventId) return judges.filter((j) => j.eventId === eventId);
  return judges;
}

export async function getHackathonJudgeById(id: string): Promise<HackathonJudge | null> {
  const judges = await cachedRead<HackathonJudge[]>(FILES.JUDGES, []);
  return judges.find((j) => j.id === id) || null;
}

export async function getHackathonJudgeByEmail(email: string, eventId?: string): Promise<HackathonJudge | null> {
  const judges = await cachedRead<HackathonJudge[]>(FILES.JUDGES, []);
  const normalized = email.trim().toLowerCase();
  return (
    judges.find((j) => {
      const matchEmail = j.email.trim().toLowerCase() === normalized;
      return eventId ? matchEmail && j.eventId === eventId : matchEmail;
    }) || null
  );
}

export async function saveHackathonJudge(judge: HackathonJudge): Promise<{ ok: boolean; error?: string }> {
  const judges = await cachedRead<HackathonJudge[]>(FILES.JUDGES, [], 0);
  const duplicate = judges.find(
    (j) =>
      j.id !== judge.id &&
      j.eventId === judge.eventId &&
      j.email.trim().toLowerCase() === judge.email.trim().toLowerCase()
  );
  if (duplicate) {
    return { ok: false, error: `Email ${judge.email} is already registered as a judge in this event` };
  }

  const idx = judges.findIndex((j) => j.id === judge.id);
  if (idx >= 0) {
    judges[idx] = judge;
  } else {
    judges.push(judge);
  }
  const ok = await writeAndInvalidate(FILES.JUDGES, judges);
  return { ok };
}

export async function deleteHackathonJudge(id: string): Promise<boolean> {
  const judges = await cachedRead<HackathonJudge[]>(FILES.JUDGES, [], 0);
  const filtered = judges.filter((j) => j.id !== id);
  return writeAndInvalidate(FILES.JUDGES, filtered);
}

// ==========================================
// SCORES
// ==========================================

export async function getHackathonScores(eventId?: string, roundId?: string): Promise<HackathonScore[]> {
  const scores = await cachedRead<HackathonScore[]>(FILES.SCORES, []);
  let res = scores;
  if (eventId) res = res.filter((s) => s.eventId === eventId);
  if (roundId) res = res.filter((s) => s.roundId === roundId);
  return res;
}

export async function saveHackathonScore(
  score: HackathonScore,
  allowUpdate = false
): Promise<{ ok: boolean; error?: string }> {
  const scores = await cachedRead<HackathonScore[]>(FILES.SCORES, [], 0);

  // Strict constraint: exactly one evaluation per team per round across all judges
  const existingIdx = scores.findIndex(
    (s) =>
      s.roundId === score.roundId &&
      s.teamId === score.teamId
  );

  if (existingIdx >= 0) {
    const existing = scores[existingIdx];
    // Can only update if explicit admin override (allowUpdate) or admin requested revision from THIS specific judge
    const canUpdate = allowUpdate || (existing.changeRequested === true && existing.judgeId === score.judgeId);
    if (!canUpdate) {
      return {
        ok: false,
        error: "This team has already been evaluated for this round. Additional evaluations are locked.",
      };
    }
    scores[existingIdx] = {
      ...score,
      id: existing.id,
      judgeId: existing.judgeId, // Retain original evaluating judge
      changeRequested: false, // Reset change request flag after resubmission
      changeReason: undefined,
      updatedAt: new Date().toISOString(),
    };
  } else {
    scores.push({ ...score, submittedAt: new Date().toISOString() });
  }

  const ok = await writeAndInvalidate(FILES.SCORES, scores);
  return { ok };
}

// ==========================================
// VOTES
// ==========================================

export async function getHackathonVotes(eventId?: string, roundId?: string): Promise<HackathonVote[]> {
  const votes = await cachedRead<HackathonVote[]>(FILES.VOTES, []);
  let res = votes;
  if (eventId) res = res.filter((v) => v.eventId === eventId);
  if (roundId) res = res.filter((v) => v.roundId === roundId);
  return res;
}

export async function recordHackathonVote(vote: HackathonVote): Promise<{ ok: boolean; error?: string }> {
  const votes = await cachedRead<HackathonVote[]>(FILES.VOTES, [], 0);

  // Strict constraint: One vote per team per event
  const alreadyVoted = votes.find(
    (v) => v.eventId === vote.eventId && v.voterTeamId === vote.voterTeamId
  );
  if (alreadyVoted) {
    return { ok: false, error: "Your team has already cast a vote for this hackathon." };
  }

  votes.push(vote);
  const ok = await writeAndInvalidate(FILES.VOTES, votes);
  return { ok };
}

// ==========================================
// TIEBREAKERS
// ==========================================

export async function getHackathonTiebreakers(eventId?: string, roundId?: string): Promise<HackathonTiebreaker[]> {
  const ties = await cachedRead<HackathonTiebreaker[]>(FILES.TIEBREAKERS, []);
  let res = ties;
  if (eventId) res = res.filter((t) => t.eventId === eventId);
  if (roundId) res = res.filter((t) => t.roundId === roundId);
  return res;
}

export async function saveHackathonTiebreaker(tiebreaker: HackathonTiebreaker): Promise<boolean> {
  const ties = await cachedRead<HackathonTiebreaker[]>(FILES.TIEBREAKERS, [], 0);
  const idx = ties.findIndex(
    (t) => t.roundId === tiebreaker.roundId && t.teamId === tiebreaker.teamId
  );
  if (idx >= 0) {
    ties[idx] = tiebreaker;
  } else {
    ties.push(tiebreaker);
  }
  return writeAndInvalidate(FILES.TIEBREAKERS, ties);
}

// ==========================================
// AUDIT / ACTIVITY LOGS
// ==========================================

export async function logHackathonActivity(activity: Omit<HackathonActivityLog, "id" | "timestamp">): Promise<void> {
  try {
    const logs = await cachedRead<HackathonActivityLog[]>(FILES.LOGS, [], 0);
    const entry: HackathonActivityLog = {
      ...activity,
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
    };
    logs.unshift(entry);
    // Keep max 500 log items
    if (logs.length > 500) logs.length = 500;
    await writeAndInvalidate(FILES.LOGS, logs);
  } catch (err) {
    console.error("[hackathon-data] Failed to log activity:", err);
  }
}

export async function getHackathonLogs(eventId?: string): Promise<HackathonActivityLog[]> {
  const logs = await cachedRead<HackathonActivityLog[]>(FILES.LOGS, []);
  if (eventId) return logs.filter((l) => l.eventId === eventId);
  return logs;
}

export async function deleteHackathonLog(id: string): Promise<boolean> {
  const logs = await cachedRead<HackathonActivityLog[]>(FILES.LOGS, [], 0);
  const filtered = logs.filter((l) => l.id !== id);
  return writeAndInvalidate(FILES.LOGS, filtered);
}

export async function clearHackathonLogs(eventId?: string): Promise<boolean> {
  if (eventId) {
    const logs = await cachedRead<HackathonActivityLog[]>(FILES.LOGS, [], 0);
    const filtered = logs.filter((l) => l.eventId !== eventId);
    return writeAndInvalidate(FILES.LOGS, filtered);
  }
  return writeAndInvalidate(FILES.LOGS, []);
}
