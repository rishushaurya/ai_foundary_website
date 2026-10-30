// End-to-end check of the whole hackathon lifecycle: prepare a draft event before the day, go live,
// judge, advance, vote, finalize, publish winners and download results, plus every abuse case.
//
// Runs against a LOCAL dev server in local-JSON mode (never point it at production):
//   KV_REST_API_URL= KV_REST_API_TOKEN= UPSTASH_REDIS_REST_URL= UPSTASH_REDIS_REST_TOKEN= \
//   JWT_SECRET=local-test-secret npx next dev -p 3123
//   JWT_SECRET=local-test-secret BASE_URL=http://localhost:3123 node scripts/verify-hackathon-integrity.mjs
// It creates and then deletes its own test event. Restore data/ afterwards with `git checkout -- data/`.

import { SignJWT } from "jose";
import assert from "node:assert/strict";
import * as XLSX from "xlsx";

const BASE = process.env.BASE_URL || "http://localhost:3123";
const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "");
const ROOT_EMAIL = "priyanshushaurya9431@gmail.com";
if (!process.env.JWT_SECRET) throw new Error("Set JWT_SECRET to the dev server's secret.");
if (!/localhost|127\.0\.0\.1/.test(BASE)) throw new Error("Refusing to run against a non-local server.");

const sign = (claims) =>
  new SignJWT(claims).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime("1h").sign(SECRET);

async function api(path, { method = "GET", body, cookie, headers = {} } = {}) {
  const res = await fetch(BASE + path, {
    method,
    redirect: "manual",
    headers: { "content-type": "application/json", ...(cookie ? { cookie } : {}), ...headers },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const buf = Buffer.from(await res.arrayBuffer());
  const text = buf.toString("utf8");
  let json = null;
  try {
    json = JSON.parse(text);
  } catch {}
  return { status: res.status, json, text, buf, type: res.headers.get("content-type") || "", setCookie: res.headers.get("set-cookie") || "" };
}

const cookieFrom = (setCookie, name) => {
  const m = setCookie.match(new RegExp(`${name}=([^;]+)`));
  return m ? `${name}=${m[1]}` : "";
};

let passed = 0;
async function check(name, fn) {
  await fn();
  passed++;
  console.log(`  ok  ${name}`);
}

async function waitForServer() {
  for (let i = 0; i < 90; i++) {
    try {
      if ((await fetch(BASE + "/api/hackathon/version")).ok) return;
    } catch {}
    await new Promise((r) => setTimeout(r, 2000));
  }
  throw new Error(`Server at ${BASE} did not come up`);
}

await waitForServer();
const admin = `admin-token=${await sign({ email: ROOT_EMAIL, role: "admin" })}`;
const post = (path, body, cookie = admin) => api(path, { method: "POST", cookie, body });

console.log("Auth");
await check("participant token cannot act as admin", async () => {
  const forged = `admin-token=${await sign({ teamId: "x", role: "participant" })}`;
  assert.equal((await api("/api/admin/hackathon/events", { cookie: forged })).status, 401);
});
await check("judge token cannot act as admin", async () => {
  const forged = `admin-token=${await sign({ judgeId: "x", email: ROOT_EMAIL, role: "judge" })}`;
  assert.equal((await api("/api/admin/hackathon/events", { cookie: forged })).status, 401);
});
await check("non-whitelisted admin email is rejected", async () => {
  const outsider = `admin-token=${await sign({ email: "intruder@example.com", role: "admin" })}`;
  assert.equal((await api("/api/admin/hackathon/events", { cookie: outsider })).status, 401);
});
await check("token signed with the old public secret is rejected", async () => {
  const old = new TextEncoder().encode("ai-foundry-dev-jwt-secret-key-2026");
  const forged = await new SignJWT({ email: ROOT_EMAIL, role: "admin" }).setProtectedHeader({ alg: "HS256" }).setExpirationTime("1h").sign(old);
  assert.equal((await api("/api/admin/hackathon/events", { cookie: `admin-token=${forged}` })).status, 401);
});
await check("cross-site POST is blocked", async () => {
  const r = await api("/api/admin/hackathon/events", { method: "POST", cookie: admin, body: { title: "x" }, headers: { origin: "https://evil.example" } });
  assert.equal(r.status, 403);
});

await check("a non-root admin can save settings, can't self-promote, and loses access when removed", async () => {
  const settings = (await api("/api/admin/settings", { cookie: admin })).json;
  const helper = "e2e-helper@example.com";
  await api("/api/admin/settings", { method: "PUT", cookie: admin, body: { ...settings, adminEmails: [...settings.adminEmails, helper] } });
  const helperCookie = `admin-token=${await sign({ email: helper, role: "admin" })}`;
  const seen = (await api("/api/admin/settings", { cookie: helperCookie })).json;
  assert.equal((await api("/api/admin/settings", { method: "PUT", cookie: helperCookie, body: seen })).status, 200);
  const promote = { ...seen, rootAdminEmails: [...seen.rootAdminEmails, helper] };
  assert.equal((await api("/api/admin/settings", { method: "PUT", cookie: helperCookie, body: promote })).status, 403);
  await api("/api/admin/settings", { method: "PUT", cookie: admin, body: { ...seen, adminEmails: seen.adminEmails.filter((e) => e !== helper) } });
  assert.equal((await api("/api/admin/settings", { cookie: helperCookie })).status, 401);
});

console.log("Preparation (draft, before the hackathon)");
const v0 = (await api("/api/hackathon/version")).json.version;
const event = (await post("/api/admin/hackathon/events", { title: "Integrity Check", status: "draft" })).json.event;
assert.ok(event?.id, "event created");
const eventId = event.id;

try {
  await check("writes advance the live version", async () => {
    assert.ok((await api("/api/hackathon/version")).json.version > v0);
  });

  const mkRound = async (roundNumber, type, extra = {}) =>
    (await post("/api/admin/hackathon/rounds", { eventId, roundNumber, name: `R${roundNumber}`, type, status: "pending", ...extra })).json.round;
  const r1 = await mkRound(1, "qualifier", { cutoffRank: 6 });
  const r2 = await mkRound(2, "semi-final", { cutoffRank: 3 });
  const r3 = await mkRound(3, "final");

  await check("duplicate round number and a second Final are refused", async () => {
    assert.equal((await post("/api/admin/hackathon/rounds", { eventId, roundNumber: 2, name: "dup", type: "qualifier" })).status, 400);
    assert.equal((await post("/api/admin/hackathon/rounds", { eventId, roundNumber: 9, name: "F2", type: "final" })).status, 400);
  });

  await post("/api/admin/hackathon/criteria", { eventId, roundId: r1.id, name: "Impact", maxMarks: 10, weight: 1 });
  await post("/api/admin/hackathon/criteria", { eventId, roundId: r1.id, name: "Design", maxMarks: 10, weight: 3 });
  for (const r of [r2, r3]) await post("/api/admin/hackathon/criteria", { eventId, roundId: r.id, name: "Impact", maxMarks: 10 });

  const csv = ["team_code,team_name,leader_name,leader_email,passkey"]
    .concat(Array.from({ length: 12 }, (_, i) => `IC-${i + 1},Team ${i + 1},Lead,lead${i + 1}@example.com,PK-SECRET-${i + 1}`))
    .join("\n");
  await check("CSV import uses the passkey column, not the team code", async () => {
    assert.equal((await post("/api/admin/hackathon/teams/bulk", { eventId, csvContent: csv })).status, 200);
    const teams = (await api(`/api/admin/hackathon/teams?eventId=${eventId}`, { cookie: admin })).json.teams;
    assert.equal(teams.find((t) => t.teamCode === "IC-1").passkey, "PK-SECRET-1");
  });
  await check("CSV without a passkey column auto-generates strong passkeys", async () => {
    await post("/api/admin/hackathon/teams/bulk", { eventId, csvContent: "team_code,team_name\nIC-GEN,Generated" });
    const teams = (await api(`/api/admin/hackathon/teams?eventId=${eventId}`, { cookie: admin })).json.teams;
    const gen = teams.find((t) => t.teamCode === "IC-GEN");
    assert.match(gen.passkey, /^[A-Z2-9]{8}$/);
    assert.equal((await api(`/api/admin/hackathon/teams?id=${gen.id}`, { method: "DELETE", cookie: admin })).status, 200);
  });
  const sheet = [
    ["Team Name", "Team Code", "Email ID", "Member 1", "Member 2", "Password"],
    ["Alpha Squad", "", "alpha@example.com", "Ann", "Bob", ""], // valid: code and passkey generated
    ["", "IC-X1", "", "", "", ""], // missing team name
    ["Gamma", "IC-1", "", "", "", ""], // code already registered
    ["Delta", "IC-D", "not-an-email", "", "", ""], // bad email
    ["Epsilon", "IC-E", "", "", "", "123"], // passkey too short
  ];
  await check("sheet import dry run analyses every row and saves nothing", async () => {
    const before = (await api(`/api/admin/hackathon/teams?eventId=${eventId}`, { cookie: admin })).json.teams.length;
    const r = await post("/api/admin/hackathon/teams/bulk", { eventId, rows: sheet, dryRun: true });
    assert.equal(r.status, 200);
    const { summary, columns, rows } = r.json.analysis;
    assert.deepEqual([summary.valid, summary.invalid, summary.generatedCodes, summary.generatedPasskeys], [1, 4, 1, 1]);
    assert.equal(columns.passkey, "Password");
    assert.deepEqual(rows[0].members, ["Ann", "Bob"]);
    assert.ok(rows.every((row) => !("passkey" in row)), "typed passkeys are never echoed back");
    assert.equal((await api(`/api/admin/hackathon/teams?eventId=${eventId}`, { cookie: admin })).json.teams.length, before);
  });
  await check("sheet import is all-or-nothing unless told to skip invalid rows", async () => {
    assert.equal((await post("/api/admin/hackathon/teams/bulk", { eventId, rows: sheet })).status, 400);
    const r = await post("/api/admin/hackathon/teams/bulk", { eventId, rows: sheet, skipInvalid: true });
    assert.equal(r.status, 200);
    assert.equal(r.json.count, 1);
    const alpha = (await api(`/api/admin/hackathon/teams?eventId=${eventId}`, { cookie: admin })).json.teams.find((t) => t.teamName === "Alpha Squad");
    assert.equal(alpha.teamCode, "TEAM-001");
    assert.match(alpha.passkey, /^[A-Z2-9]{8}$/);
    assert.equal((await api(`/api/admin/hackathon/teams?id=${alpha.id}`, { method: "DELETE", cookie: admin })).status, 200);
  });
  await check("weak admin-typed passkey is refused", async () => {
    assert.equal((await post("/api/admin/hackathon/teams", { eventId, teamCode: "IC-WEAK", teamName: "Weak", passkey: "123" })).status, 400);
  });

  const teamsByCode = async () =>
    Object.fromEntries((await api(`/api/admin/hackathon/teams?eventId=${eventId}`, { cookie: admin })).json.teams.map((t) => [t.teamCode, t]));
  let teams = await teamsByCode();
  const loginTeam = async (code) =>
    api("/api/leaderboard/verify-team", { method: "POST", body: { teamCode: code, passkey: `PK-SECRET-${code.split("-")[1]}`, eventId } });

  await check("draft event is hidden publicly and teams cannot log in yet", async () => {
    const status = (await api(`/api/leaderboard/status?eventId=${eventId}`)).json;
    assert.ok(!status.availableEvents.some((e) => e.id === eventId));
    assert.equal((await loginTeam("IC-1")).status, 403);
  });

  const mkJudge = async (n) => {
    await post("/api/admin/hackathon/judges", { eventId, name: `Judge ${n}`, email: `judge${n}@example.com`, accessCode: `JCODE-${n}` });
    const login = await api("/api/judge/login", { method: "POST", body: { email: `judge${n}@example.com`, accessCode: `JCODE-${n}`, eventId } });
    return cookieFrom(login.setCookie, "judge-session");
  };
  const j1 = await mkJudge(1);
  const j2 = await mkJudge(2);
  await check("judge login gives the same answer for unknown email and wrong code", async () => {
    const a = await api("/api/judge/login", { method: "POST", body: { email: "nobody@example.com", accessCode: "WRONG-1" } });
    const b = await api("/api/judge/login", { method: "POST", body: { email: "judge1@example.com", accessCode: "WRONG-1" } });
    assert.equal(a.json.error, b.json.error);
  });

  const criteriaOf = {};
  const score = async (cookie, roundId, code, marks) => {
    criteriaOf[roundId] ??= (await api(`/api/judge/teams?roundId=${roundId}`, { cookie })).json.criteria;
    const criterionScores = Object.fromEntries(
      criteriaOf[roundId].map((c) => [c.id, typeof marks === "number" ? marks : marks[c.name] ?? 0])
    );
    return api("/api/judge/score", { method: "POST", cookie, body: { roundId, teamId: teams[code].id, criterionScores } });
  };

  console.log("Going live and judging round 1");
  await post("/api/admin/hackathon/state", { eventId, status: "live" });
  await check("a pending round can't be scored", async () => {
    assert.equal((await score(j1, r1.id, "IC-1", 5)).status, 400);
  });
  await post("/api/admin/hackathon/state", { eventId, roundId: r1.id, roundStatus: "active" });
  await check("starting round 1 makes it the judges' active round", async () => {
    assert.equal((await api("/api/judge/teams", { cookie: j1 })).json.activeRound.id, r1.id);
  });
  await check("a second round can't go live while round 1 runs", async () => {
    assert.equal((await post("/api/admin/hackathon/state", { eventId, roundId: r2.id, roundStatus: "active" })).status, 400);
  });

  await check("two judges scoring the same team at once: exactly one wins", async () => {
    const results = await Promise.all([score(j1, r1.id, "IC-1", 9), score(j2, r1.id, "IC-1", 3)]);
    assert.equal(results.filter((r) => r.status === 200).length, 1, JSON.stringify(results.map((r) => r.json)));
  });
  await check("out-of-range marks are refused", async () => {
    assert.equal((await score(j1, r1.id, "IC-12", 11)).status, 400);
  });
  await check("criterion weights count (10 on weight-1, 0 on weight-3 = 25.00)", async () => {
    assert.equal((await score(j1, r1.id, "IC-12", { Impact: 10, Design: 0 })).json.score.normalizedScore, 25);
  });
  for (let i = 2; i <= 11; i++) await score(j1, r1.id, `IC-${i}`, 10 - (i % 10));

  await check("criteria are locked once a round is scored", async () => {
    assert.equal((await post("/api/admin/hackathon/criteria", { eventId, roundId: r1.id, name: "Late", maxMarks: 5 })).status, 409);
  });
  await check("a scored round can't be deleted", async () => {
    assert.equal((await api(`/api/admin/hackathon/rounds?id=${r1.id}`, { method: "DELETE", cookie: admin })).status, 409);
  });
  await check("a scored team can't be deleted (disqualify instead)", async () => {
    assert.equal((await api(`/api/admin/hackathon/teams?id=${teams["IC-1"].id}`, { method: "DELETE", cookie: admin })).status, 409);
  });

  await check("revision request stays open until the judge resubmits", async () => {
    const before = (await api(`/api/admin/hackathon/scores?eventId=${eventId}&roundId=${r1.id}`, { cookie: admin })).json.scores;
    const target = before.find((s) => s.teamId === teams["IC-2"].id);
    await post("/api/admin/hackathon/scores/request-change", { scoreId: target.id, eventId, roundId: r1.id, reason: "recheck" });
    const after = (await api(`/api/admin/hackathon/scores?eventId=${eventId}&roundId=${r1.id}`, { cookie: admin })).json.scores;
    assert.equal(after.find((s) => s.id === target.id).changeRequested, true);
    assert.equal((await score(j1, r1.id, "IC-2", 8)).status, 200); // judge 1 scored IC-2..IC-12
    const final = (await api(`/api/admin/hackathon/scores?eventId=${eventId}&roundId=${r1.id}`, { cookie: admin })).json.scores;
    assert.equal(final.find((s) => s.id === target.id).changeRequested ?? false, false);
  });
  await check("judge can't re-score a locked team", async () => {
    assert.equal((await score(j1, r1.id, "IC-3", 1)).status, 409);
  });

  await check("deactivated judge loses access immediately", async () => {
    const judges = (await api(`/api/admin/hackathon/judges?eventId=${eventId}`, { cookie: admin })).json.judges;
    const judge2 = judges.find((j) => j.email === "judge2@example.com");
    await post("/api/admin/hackathon/judges", { ...judge2, eventId, active: false });
    assert.equal((await api("/api/judge/teams", { cookie: j2 })).status, 401);
  });

  console.log("Advancement");
  await post("/api/admin/hackathon/advance", { eventId, currentRoundId: r1.id, cutoffRank: 6 });
  teams = await teamsByCode();
  const r1Eliminated = Object.values(teams).filter((t) => t.isEliminated).map((t) => t.teamCode);
  await check("round 1 cutoff eliminates exactly 6 and round 2 starts", async () => {
    assert.equal(r1Eliminated.length, 6);
    assert.equal((await api("/api/judge/teams", { cookie: j1 })).json.activeRound.id, r2.id);
  });
  await check("an eliminated team can't be scored in round 2", async () => {
    assert.equal((await score(j1, r2.id, r1Eliminated[0], 5)).status, 400);
  });

  // Round 2: score one team only, so five unscored teams tie on 0 inside the cutoff.
  const r2Competing = Object.values(teams).filter((t) => !t.isEliminated).map((t) => t.teamCode);
  await score(j1, r2.id, r2Competing[0], 7);
  await check("standings preview flags the tie on the cutoff", async () => {
    const st = (await api(`/api/admin/hackathon/standings?eventId=${eventId}&roundId=${r2.id}&cutoff=3`, { cookie: admin })).json;
    assert.equal(st.competingCount, 6);
    assert.equal(st.tieAtCutoff, true);
  });
  await post("/api/admin/hackathon/advance", { eventId, currentRoundId: r2.id, cutoffRank: 3 });
  teams = await teamsByCode();
  await check("earlier-eliminated teams are never brought back by a tie at 0", async () => {
    for (const code of r1Eliminated) assert.equal(teams[code].isEliminated, true, code);
  });
  await check("advancing a completed round again is rejected", async () => {
    assert.equal((await post("/api/admin/hackathon/advance", { eventId, currentRoundId: r2.id, cutoffRank: 3 })).status, 409);
  });
  const finalists = Object.values(teams).filter((t) => t.finalist && !t.isEliminated);
  await check("the final starts with the advanced teams as finalists", async () => {
    assert.ok(finalists.length >= 3);
    const roster = (await api("/api/judge/teams", { cookie: j1 })).json;
    assert.equal(roster.activeRound.id, r3.id);
    assert.equal(roster.teams.length, finalists.length);
  });

  console.log("Voting");
  await post("/api/admin/hackathon/state", { eventId, isVotingOpen: true });
  const voters = await Promise.all(r1Eliminated.map(async (code) => cookieFrom((await loginTeam(code)).setCookie, "participant-session")));
  const [leader, runnerUp] = finalists;
  const vote = (cookie, candidate = leader) => api("/api/leaderboard/vote", { method: "POST", cookie, body: { candidateTeamId: candidate.id } });

  await check("second device for the same team is refused", async () => {
    assert.equal((await loginTeam(r1Eliminated[0])).status, 403);
  });
  await check("an eliminated team sees the ballot live", async () => {
    const st = (await api("/api/leaderboard/team-status", { cookie: voters[0] })).json;
    assert.equal(st.voting.canVote, true);
    assert.equal(st.voting.candidates.length, finalists.length);
  });
  await check("can't vote for a non-finalist", async () => {
    assert.equal((await api("/api/leaderboard/vote", { method: "POST", cookie: voters[0], body: { candidateTeamId: teams[r1Eliminated[1]].id } })).status, 400);
  });
  await check("5 simultaneous votes from one team record exactly 1", async () => {
    const results = await Promise.all(Array.from({ length: 5 }, () => vote(voters[0])));
    assert.equal(results.filter((r) => r.status === 200).length, 1);
  });
  await check("simultaneous votes from 5 different teams are all recorded", async () => {
    const results = await Promise.all(voters.slice(1).map((c, i) => vote(c, i < 3 ? leader : runnerUp)));
    assert.equal(results.filter((r) => r.status === 200).length, 5);
    assert.equal((await api(`/api/admin/hackathon/votes?eventId=${eventId}`, { cookie: admin })).json.totalVotes, 6);
  });
  await check("a finalist cannot vote", async () => {
    const c = cookieFrom((await api("/api/leaderboard/verify-team", { method: "POST", body: { teamCode: leader.teamCode, passkey: `PK-SECRET-${leader.teamCode.split("-")[1]}`, eventId } })).setCookie, "participant-session");
    assert.equal((await vote(c, runnerUp)).status, 403);
  });
  await check("votes from a team disqualified later stop counting", async () => {
    await api("/api/admin/hackathon/teams/status", { method: "PATCH", cookie: admin, body: { teamId: teams[r1Eliminated[5]].id, disqualified: true, disqualificationReason: "test" } });
    const st = (await api(`/api/admin/hackathon/standings?eventId=${eventId}&roundId=${r3.id}`, { cookie: admin })).json;
    assert.equal(st.standings.reduce((n, s) => n + (s.votesCount || 0), 0), 5);
  });
  await check("admin session reset revokes the device", async () => {
    const t = teams[r1Eliminated[0]];
    await post("/api/admin/hackathon/teams", { ...t, eventId, resetSession: true });
    const r = await api("/api/leaderboard/team-status", { cookie: voters[0] });
    assert.equal(r.status, 401);
    assert.equal(r.json.sessionRevoked, true);
  });

  console.log("Final, winners and downloads");
  for (const [i, f] of finalists.entries()) await score(j1, r3.id, f.teamCode, 10 - i);
  const finalRoundEdit = { id: r3.id, eventId, roundNumber: 3, name: "R3", type: "final" };
  await check("admin-set split (50/50) is what ranks the final, and bad splits are refused", async () => {
    assert.equal((await post("/api/admin/hackathon/rounds", { ...finalRoundEdit, judgeWeight: 101 })).status, 400);
    assert.equal((await post("/api/admin/hackathon/rounds", { ...finalRoundEdit, judgeWeight: 50 })).status, 200);
    const st = (await api(`/api/admin/hackathon/standings?eventId=${eventId}&roundId=${r3.id}`, { cookie: admin })).json;
    const active = st.standings.filter((x) => !x.disqualified);
    assert.ok(active.length > 0 && active.some((x) => x.voteScore > 0));
    for (const x of active) {
      assert.equal(x.finalScore, Math.round((x.avgJudgeScore * 0.5 + x.voteScore * 0.5 + Number.EPSILON) * 100) / 100);
    }
    const pub = (await api(`/api/leaderboard/status?eventId=${eventId}&roundId=${r3.id}`)).json;
    assert.equal(pub.rounds.find((r) => r.id === r3.id).judgeWeight, 50);
  });
  await post("/api/admin/hackathon/advance", { eventId, currentRoundId: r3.id });
  await check("the split is locked once the final is completed", async () => {
    assert.equal((await post("/api/admin/hackathon/rounds", { ...finalRoundEdit, judgeWeight: 60 })).status, 409);
  });
  await check("finishing the final completes the event and closes voting", async () => {
    const ev = (await api("/api/admin/hackathon/events", { cookie: admin })).json.events.find((e) => e.id === eventId);
    assert.equal(ev.status, "completed");
    assert.equal(ev.isVotingOpen, false);
  });
  await check("voting can't be re-opened or used after the final", async () => {
    assert.equal((await post("/api/admin/hackathon/state", { eventId, isVotingOpen: true })).status, 409);
    assert.equal((await vote(voters[1], runnerUp)).status, 403);
  });
  await check("results stay hidden until the final is published", async () => {
    const hidden = (await api(`/api/leaderboard/status?eventId=${eventId}&roundId=${r3.id}`)).json;
    assert.equal(hidden.leaderboard[0].finalScore, null);
  });
  await post("/api/admin/hackathon/state", { eventId, roundId: r3.id, isPublished: true });
  await check("published final shows the winner (admin-set split) publicly", async () => {
    const board = (await api(`/api/leaderboard/status?eventId=${eventId}&roundId=${r3.id}`)).json.leaderboard;
    assert.equal(board[0].teamId, leader.id);
    assert.equal(board[0].rank, 1);
    assert.ok(board[0].finalScore > board[1].finalScore);
  });
  await check("full results download has Results & Winners plus every round", async () => {
    const r = await api(`/api/admin/hackathon/export?type=marks&eventId=${eventId}`, { cookie: admin });
    assert.equal(r.status, 200);
    const wb = XLSX.read(r.buf, { type: "buffer" });
    assert.equal(wb.SheetNames[0], "Results & Winners");
    assert.equal(wb.SheetNames.length, 4);
    const summary = XLSX.utils.sheet_to_json(wb.Sheets["Results & Winners"]);
    assert.ok(summary.some((row) => row.Result === "WINNER" && row["Team Code"] === leader.teamCode));
  });
  await check("teams, judges and votes downloads work", async () => {
    for (const type of ["teams", "judges", "votes"]) {
      const r = await api(`/api/admin/hackathon/export?type=${type}&eventId=${eventId}`, { cookie: admin });
      assert.equal(r.status, 200, type);
      assert.ok(XLSX.read(r.buf, { type: "buffer" }).SheetNames.length > 0, type);
    }
  });

  console.log("Two hackathons at once");
  const twin = (await post("/api/admin/hackathon/events", { title: "Integrity Twin", status: "live" })).json.event;
  try {
    // Same sheet in both events: identical team code and passkey, same judge email and code.
    await post("/api/admin/hackathon/teams/bulk", { eventId: twin.id, csvContent: "team_code,team_name,passkey\nIC-1,Twin Team,PK-SECRET-1" });
    await post("/api/admin/hackathon/judges", { eventId: twin.id, name: "Judge 1", email: "judge1@example.com", accessCode: "JCODE-1" });
    await check("identical team code and passkey in two hackathons never cross over", async () => {
      const ambiguous = await api("/api/leaderboard/verify-team", { method: "POST", body: { teamCode: "IC-1", passkey: "PK-SECRET-1" } });
      assert.equal(ambiguous.status, 409, "both events are open, so the login must ask which one");
      const r = await api("/api/leaderboard/verify-team", { method: "POST", body: { teamCode: "IC-1", passkey: "PK-SECRET-1", eventId: twin.id } });
      assert.equal(r.status, 200);
      assert.equal(r.json.team.eventId, twin.id);
      assert.equal(r.json.team.teamName, "Twin Team");
      const st = (await api("/api/leaderboard/team-status", { cookie: cookieFrom(r.setCookie, "participant-session") })).json;
      assert.equal(st.event.id, twin.id);
      assert.equal((await api(`/api/admin/hackathon/votes?eventId=${twin.id}`, { cookie: admin })).json.totalVotes, 0);
      assert.equal((await api(`/api/admin/hackathon/votes?eventId=${eventId}`, { cookie: admin })).json.totalVotes, 6);
      assert.equal((await api(`/api/admin/hackathon/teams?eventId=${twin.id}`, { cookie: admin })).json.teams.length, 1);
    });
    await check("a judge on two hackathons with the same code lands in the live one", async () => {
      const r = await api("/api/judge/login", { method: "POST", body: { email: "judge1@example.com", accessCode: "JCODE-1" } });
      assert.equal(r.status, 200);
      assert.equal(r.json.judge.eventId, twin.id);
    });
  } finally {
    await api(`/api/admin/hackathon/events?id=${twin.id}`, { method: "DELETE", cookie: admin });
  }

  console.log("Event registrations (PII)");
  const cmsEvent = (await post("/api/admin/events", { title: "PII Check", date: "2030-01-01", isRegistrationOpen: true })).json.event;
  try {
    const reg = { eventId: cmsEvent.id, name: "Pat Test", email: "pii-check@example.com", phone: "9999999999" };
    await check("simultaneous duplicate registrations record exactly 1", async () => {
      const results = await Promise.all([1, 2, 3].map(() => api("/api/events/register", { method: "POST", body: reg })));
      assert.equal(results.filter((r) => r.status === 200).length, 1);
    });
    await check("registrant PII is not in public HTML or /api/content", async () => {
      assert.ok(!(await api("/")).text.includes("pii-check@example.com"));
      assert.ok(!(await api("/events")).text.includes("pii-check@example.com"));
      assert.ok(!(await api("/api/content")).text.includes("pii-check@example.com"));
    });
    await check("admin saving a stale event copy keeps registrations", async () => {
      await api("/api/admin/events", { method: "PUT", cookie: admin, body: { ...cmsEvent, registrations: [] } });
      const events = (await api("/api/admin/events", { cookie: admin })).json;
      assert.equal(events.find((e) => e.id === cmsEvent.id).registrations.length, 1);
    });
  } finally {
    await api(`/api/admin/events?id=${cmsEvent.id}`, { method: "DELETE", cookie: admin });
  }
} finally {
  if (!process.env.KEEP_EVENT) await api(`/api/admin/hackathon/events?id=${eventId}`, { method: "DELETE", cookie: admin });
}

console.log(`\nAll ${passed} checks passed.`);
