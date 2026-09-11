import fs from "fs";
import path from "path";

// Load .env.local manually before other imports
const envPath = path.join(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx > 0) {
        const key = trimmed.slice(0, eqIdx).trim();
        let val = trimmed.slice(eqIdx + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        process.env[key] = val;
      }
    }
  }
}

// Comprehensive test verifying single-evaluation enforcement and read-only score viewing
import { createJudgeToken } from "../src/lib/hackathon/sessions.ts";
import {
  saveHackathonScore,
  getHackathonScores,
  getHackathonTeams,
  getHackathonEvents,
  getHackathonRounds,
  getHackathonJudges,
  getHackathonCriteria,
} from "../src/lib/hackathon/data.ts";

async function runTests() {
  console.log("===============================================================");
  console.log("=== VERIFYING JUDGE SINGLE-EVALUATION & READ-ONLY INTEGRITY ===");
  console.log("===============================================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition, testName) {
    if (condition) {
      console.log(`  ✓ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${testName}`);
      failed++;
    }
  }

  // -------------------------------------------------------------
  // PART 1: DATA LAYER UNIT TESTS
  // -------------------------------------------------------------
  console.log("--- PART 1: Direct Data Layer saveHackathonScore Constraints ---");
  const testEventId = "test-event-single-eval";
  const testRoundId = "round-1";
  const testTeamId = "team-single-eval-unit";

  // Score 1 by Judge Alpha
  const score1 = {
    id: `score-j1-${testTeamId}-${testRoundId}`,
    eventId: testEventId,
    roundId: testRoundId,
    judgeId: "judge-alpha",
    teamId: testTeamId,
    criterionScores: { "crit-1": 15 },
    totalMarksAwarded: 15,
    totalMaxPossible: 20,
    normalizedScore: 75,
    feedback: "Initial evaluation by Judge Alpha",
    submittedAt: new Date().toISOString(),
  };

  const res1 = await saveHackathonScore(score1, true);
  assert(res1.ok === true, "Judge Alpha records initial score successfully");

  // Score 2 by Judge Beta (different judge evaluating the SAME team in SAME round)
  const score2 = {
    id: `score-j2-${testTeamId}-${testRoundId}`,
    eventId: testEventId,
    roundId: testRoundId,
    judgeId: "judge-beta",
    teamId: testTeamId,
    criterionScores: { "crit-1": 18 },
    totalMarksAwarded: 18,
    totalMaxPossible: 20,
    normalizedScore: 90,
    feedback: "Attempted duplicate evaluation by Judge Beta",
    submittedAt: new Date().toISOString(),
  };

  const res2 = await saveHackathonScore(score2, false);
  assert(res2.ok === false, "Judge Beta is BLOCKED from evaluating already-scored team");
  assert(
    res2.error && res2.error.includes("already been evaluated"),
    `Error message correctly identifies prior evaluation: "${res2.error}"`
  );

  // Score 3 by Judge Alpha again without admin change requested
  const res3 = await saveHackathonScore(score1, false);
  assert(res3.ok === false, "Judge Alpha cannot submit duplicate score without admin revision request");

  // -------------------------------------------------------------
  // PART 2: HTTP API Endpoints (/api/judge/teams & /api/judge/score)
  // -------------------------------------------------------------
  console.log("\n--- PART 2: HTTP API Endpoints (/api/judge/teams & /api/judge/score) ---");
  const baseUrl = "http://localhost:3000";

  // Wait 5.5 seconds to ensure any previous hotCache on rounds in Next.js server has expired
  console.log("  (Waiting 5.5s for Next.js hot-cache invalidation...)");
  await new Promise(r => setTimeout(r, 5500));

  const events = await getHackathonEvents();
  assert(events.length > 0, "Hackathon event found in system");
  const event = events[0];

  const realJudges = await getHackathonJudges(event.id);
  const realRounds = await getHackathonRounds(event.id);
  const realTeams = await getHackathonTeams(event.id);
  const round1 = realRounds.find(r => r.roundNumber === 1);
  const realCriteria = await getHackathonCriteria(event.id);

  assert(realJudges.length >= 2, `At least 2 judges exist in test environment (${realJudges.length} found)`);
  // Judge 1: "adssa" (evaluator of TEAM-220)
  const judge1 = realJudges.find(j => j.name === "adssa") || realJudges[0];
  // Judge 2: "YE" (different judge)
  const judge2 = realJudges.find(j => j.id !== judge1.id) || realJudges[1];

  const targetTeam = realTeams.find(t => t.teamCode === "TEAM-220");
  assert(!!targetTeam, `Active evaluated target team found: ${targetTeam?.teamCode}`);

  // Generate auth tokens for both judges
  const tokenJudge1 = await createJudgeToken({
    judgeId: judge1.id,
    eventId: event.id,
    name: judge1.name,
    email: judge1.email,
  });

  const tokenJudge2 = await createJudgeToken({
    judgeId: judge2.id,
    eventId: event.id,
    name: judge2.name,
    email: judge2.email,
  });

  // 1. Judge 2 (different judge) searches for TEAM-220 via GET /api/judge/teams?search=TEAM-220
  const searchResJudge2 = await fetch(
    `${baseUrl}/api/judge/teams?roundId=${round1.id}&search=${targetTeam.teamCode}`,
    {
      headers: {
        Cookie: `judge-session=${tokenJudge2}`,
      },
    }
  );
  assert(searchResJudge2.status === 200, "Judge 2 successfully calls /api/judge/teams?search=");
  const searchData2 = await searchResJudge2.json();
  const teamResultForJudge2 = searchData2.teams[0];

  assert(!!teamResultForJudge2, "Judge 2 receives team details upon entering team code");
  assert(teamResultForJudge2.isScored === true, "Judge 2 sees isScored === true for evaluated team");
  assert(teamResultForJudge2.isScoredByMe === false, "Judge 2 sees isScoredByMe === false");
  assert(teamResultForJudge2.canEdit === false, "Judge 2 has canEdit === false (locked)");
  assert(!!teamResultForJudge2.myScore, "Judge 2 is able to SEE the recorded marks & evaluation");
  assert(
    teamResultForJudge2.myScore.normalizedScore === 65,
    `Recorded score visible to Judge 2: ${teamResultForJudge2.myScore.normalizedScore} pts`
  );
  assert(
    teamResultForJudge2.scoredByJudgeName === judge1.name,
    `Original evaluator's name visible to Judge 2: "${teamResultForJudge2.scoredByJudgeName}"`
  );

  // 2. Judge 2 tries to submit score for TEAM-220 via POST /api/judge/score
  const validScores = {};
  for (const c of realCriteria) {
    validScores[c.id] = 8;
  }

  const submitRes2 = await fetch(`${baseUrl}/api/judge/score`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: `judge-session=${tokenJudge2}`,
    },
    body: JSON.stringify({
      roundId: round1.id,
      teamId: targetTeam.id,
      criterionScores: validScores,
      feedback: "Illegal second evaluation attempt by Judge 2",
    }),
  });

  assert(
    submitRes2.status === 409,
    `Judge 2 evaluation is REJECTED with HTTP 409 Conflict (got HTTP ${submitRes2.status})`
  );
  const submitData2 = await submitRes2.json();
  assert(
    submitData2.error && submitData2.error.includes("already been evaluated"),
    `Error response states: "${submitData2.error}"`
  );

  // 3. Judge 1 (original evaluator) searches for TEAM-220 code
  const searchResJudge1 = await fetch(
    `${baseUrl}/api/judge/teams?roundId=${round1.id}&search=${targetTeam.teamCode}`,
    {
      headers: {
        Cookie: `judge-session=${tokenJudge1}`,
      },
    }
  );
  const searchData1 = await searchResJudge1.json();
  const teamResultForJudge1 = searchData1.teams[0];
  assert(teamResultForJudge1.isScored === true, "Judge 1 sees isScored === true");
  assert(teamResultForJudge1.isScoredByMe === true, "Judge 1 sees isScoredByMe === true");
  assert(teamResultForJudge1.canEdit === false, "Judge 1 has canEdit === false without admin change request");

  // 4. Judge 1 tries to submit duplicate score without admin revision
  const submitRes1Duplicate = await fetch(`${baseUrl}/api/judge/score`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: `judge-session=${tokenJudge1}`,
    },
    body: JSON.stringify({
      roundId: round1.id,
      teamId: targetTeam.id,
      criterionScores: validScores,
      feedback: "Attempted second submission by Judge 1 without revision",
    }),
  });

  assert(
    submitRes1Duplicate.status === 409,
    `Judge 1 duplicate submission without change request is REJECTED with HTTP 409 Conflict (got ${submitRes1Duplicate.status})`
  );

  // -------------------------------------------------------------
  // SUMMARY
  // -------------------------------------------------------------
  console.log("\n===============================================================");
  console.log(`TOTAL TESTS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log("===============================================================\n");

  if (failed > 0) process.exit(1);
}

runTests().catch((err) => {
  console.error("Test execution failed with error:", err);
  process.exit(1);
});
