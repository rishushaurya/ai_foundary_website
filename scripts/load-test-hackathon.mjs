// Burst test for a big hackathon: imports TEAMS teams from a sheet, runs round 1 into a final with
// a 50/50 split, then fires every eliminated team's login, scorecard and vote at the same moment
// (plus duplicate vote taps) and checks that exactly one vote per team is recorded and nothing 5xx'd.
//
// Runs against a LOCAL dev server (never production). Local-JSON mode:
//   KV_REST_API_URL= KV_REST_API_TOKEN= UPSTASH_REDIS_REST_URL= UPSTASH_REDIS_REST_TOKEN= \
//   JWT_SECRET=local-test-secret npx next dev -p 3123
//   JWT_SECRET=local-test-secret BASE_URL=http://localhost:3123 TEAMS=650 node scripts/load-test-hackathon.mjs
// For the Redis path, start the server with the real Upstash env vars plus an isolated
// REDIS_KEY_PREFIX=aifoundry-load-<date>: and delete those keys afterwards.
// It creates and then deletes its own event.

import { SignJWT } from "jose";
import assert from "node:assert/strict";

const BASE = process.env.BASE_URL || "http://localhost:3123";
const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "");
const TEAMS = Number(process.env.TEAMS || 650);
const FINALISTS = 10;
// Requests kept in flight at once. One local machine can't open 1,000 sockets at the same instant
// (Windows' listen backlog is 511); 250 still lands hundreds of requests on the server together.
const CONCURRENCY = Number(process.env.CONCURRENCY || 250);
const ROOT_EMAIL = "priyanshushaurya9431@gmail.com";
if (!process.env.JWT_SECRET) throw new Error("Set JWT_SECRET to the dev server's secret.");
if (!/localhost|127\.0\.0\.1/.test(BASE)) throw new Error("Refusing to run against a non-local server.");

const admin = `admin-token=${await new SignJWT({ email: ROOT_EMAIL, role: "admin" })
  .setProtectedHeader({ alg: "HS256" })
  .setIssuedAt()
  .setExpirationTime("1h")
  .sign(SECRET)}`;

async function api(path, { method = "GET", body, cookie } = {}) {
  const started = performance.now();
  const res = await fetch(BASE + path, {
    method,
    headers: { "content-type": "application/json", ...(cookie ? { cookie } : {}) },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await res.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch {}
  return { status: res.status, json, ms: performance.now() - started, setCookie: res.headers.get("set-cookie") || "" };
}
const post = (path, body, cookie = admin) => api(path, { method: "POST", body, cookie });
const cookieFrom = (setCookie, name) => (setCookie.match(new RegExp(`${name}=([^;]+)`)) || [])[0] || "";

/** Runs fn over items with at most CONCURRENCY in flight; results keep the input order. */
async function burst(items, fn) {
  const results = new Array(items.length);
  let next = 0;
  await Promise.all(
    Array.from({ length: Math.min(CONCURRENCY, items.length) }, async () => {
      while (next < items.length) {
        const i = next++;
        results[i] = await fn(items[i], i);
      }
    })
  );
  return results;
}

function report(label, results) {
  const ms = results.map((r) => r.ms).sort((a, b) => a - b);
  const pct = (p) => Math.round(ms[Math.min(ms.length - 1, Math.floor(ms.length * p))]);
  const codes = {};
  for (const r of results) codes[r.status] = (codes[r.status] || 0) + 1;
  console.log(`  ${label}: ${results.length} requests, p50 ${pct(0.5)}ms, p95 ${pct(0.95)}ms, max ${pct(1)}ms, statuses ${JSON.stringify(codes)}`);
  assert.ok(!results.some((r) => r.status >= 500), `${label}: server errors`);
}

const event = (await post("/api/admin/hackathon/events", { title: `Load Test ${TEAMS}`, status: "draft" })).json.event;
assert.ok(event?.id, "event created");
const eventId = event.id;

try {
  const round = async (roundNumber, type, extra = {}) =>
    (await post("/api/admin/hackathon/rounds", { eventId, roundNumber, name: `R${roundNumber}`, type, status: "pending", ...extra })).json.round;
  const r1 = await round(1, "qualifier", { cutoffRank: FINALISTS });
  const final = await round(2, "final", { judgeWeight: 50 });
  for (const r of [r1, final]) await post("/api/admin/hackathon/criteria", { eventId, roundId: r.id, name: "Impact", maxMarks: 10 });

  console.log(`Import ${TEAMS} teams from a sheet`);
  const code = (i) => `LT-${String(i).padStart(4, "0")}`;
  const passkey = (i) => `PASS-${i}-LT`;
  const sheet = [["Team Code", "Team Name", "Leader Email", "Members", "Passkey"]].concat(
    Array.from({ length: TEAMS }, (_, i) => [code(i), `Load Team ${i}`, `lead${i}@example.com`, `A${i}; B${i}; C${i}`, passkey(i)])
  );
  const dry = await post("/api/admin/hackathon/teams/bulk", { eventId, rows: sheet, dryRun: true });
  report("dry-run analysis", [dry]);
  assert.equal(dry.json.analysis.summary.valid, TEAMS);
  const imported = await post("/api/admin/hackathon/teams/bulk", { eventId, rows: sheet });
  report("import (hashing every passkey)", [imported]);
  assert.equal(imported.json.count, TEAMS);
  const teams = Object.fromEntries((await api(`/api/admin/hackathon/teams?eventId=${eventId}`, { cookie: admin })).json.teams.map((t) => [t.teamCode, t]));

  console.log("Round 1, then advance the top teams into the final");
  await post("/api/admin/hackathon/judges", { eventId, name: "Load Judge", email: "load-judge@example.com", accessCode: "LOAD-JUDGE-1" });
  const judge = cookieFrom(
    (await api("/api/judge/login", { method: "POST", body: { email: "load-judge@example.com", accessCode: "LOAD-JUDGE-1", eventId } })).setCookie,
    "judge-session"
  );
  await post("/api/admin/hackathon/state", { eventId, status: "live", roundId: r1.id, roundStatus: "active" });
  const crit1 = (await api(`/api/judge/teams?roundId=${r1.id}`, { cookie: judge })).json.criteria[0];
  for (let i = 0; i < FINALISTS; i++) {
    const r = await api("/api/judge/score", { method: "POST", cookie: judge, body: { roundId: r1.id, teamId: teams[code(i)].id, criterionScores: { [crit1.id]: 10 - i * 0.5 } } });
    assert.equal(r.status, 200, `score ${code(i)}`);
  }
  assert.equal((await post("/api/admin/hackathon/advance", { eventId, currentRoundId: r1.id })).status, 200);
  await post("/api/admin/hackathon/state", { eventId, isVotingOpen: true });
  const voterIdx = Array.from({ length: TEAMS - FINALISTS }, (_, k) => k + FINALISTS);
  const finalistIds = Array.from({ length: FINALISTS }, (_, i) => teams[code(i)].id);

  console.log(`Burst: ${voterIdx.length} teams log in at once`);
  const logins = await burst(voterIdx, (i) => api("/api/leaderboard/verify-team", { method: "POST", body: { teamCode: code(i), passkey: passkey(i), eventId } }));
  report("logins", logins);
  assert.equal(logins.filter((r) => r.status === 200).length, voterIdx.length, "every team logged in");
  const cookies = logins.map((r) => cookieFrom(r.setCookie, "participant-session"));

  console.log("Burst: every team opens its scorecard at once");
  const cards = await burst(cookies, (c) => api("/api/leaderboard/team-status", { cookie: c }));
  report("scorecards", cards);
  assert.ok(cards.every((r) => r.status === 200 && r.json.voting.canVote && r.json.voting.candidates.length === FINALISTS));

  console.log("Burst: every team votes at once, 100 of them tap twice more");
  // Each team's vote and its duplicate taps are interleaved, so the duplicates really race the first tap.
  const taps = cookies.flatMap((c, k) => Array.from({ length: k < 100 ? 3 : 1 }, () => ({ c, candidate: finalistIds[k % FINALISTS] })));
  const votes = await burst(taps, ({ c, candidate }) => api("/api/leaderboard/vote", { method: "POST", cookie: c, body: { candidateTeamId: candidate } }));
  report("votes", votes);
  assert.equal(votes.filter((r) => r.status === 200).length, voterIdx.length, "exactly one accepted vote per team");

  const tally = (await api(`/api/admin/hackathon/votes?eventId=${eventId}`, { cookie: admin })).json;
  assert.equal(tally.totalVotes, voterIdx.length, "stored votes = teams that voted");
  const st = (await api(`/api/admin/hackathon/standings?eventId=${eventId}&roundId=${final.id}`, { cookie: admin })).json;
  assert.equal(st.standings.reduce((n, x) => n + (x.votesCount || 0), 0), voterIdx.length);
  for (const x of st.standings) {
    assert.equal(x.finalScore, Math.round((x.avgJudgeScore * 0.5 + x.voteScore * 0.5 + Number.EPSILON) * 100) / 100);
  }
  console.log(`\nAll checks passed: ${TEAMS} teams imported, ${voterIdx.length} simultaneous logins, ${votes.length} vote taps -> ${tally.totalVotes} votes, 50/50 split applied.`);
} finally {
  await api(`/api/admin/hackathon/events?id=${eventId}`, { method: "DELETE", cookie: admin });
}
