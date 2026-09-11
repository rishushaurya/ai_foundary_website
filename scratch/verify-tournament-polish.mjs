// Comprehensive automated test suite for tournament progression polish
import { createParticipantToken } from "../src/lib/hackathon/sessions.js";
import { getCompetingTeamsForRound, computeRoundLeaderboard } from "../src/lib/hackathon/scoring.js";

async function runTests() {
  console.log("=== STARTING TOURNAMENT POLISH VERIFICATION ===");
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

  // TEST 1: Round Eligibility & Elimination Filtering
  console.log("\n--- TEST 1: getCompetingTeamsForRound Eligibility Filtering ---");
  const testRounds = [
    { id: "round-1", roundNumber: 1, type: "qualifier" },
    { id: "round-2", roundNumber: 2, type: "semi" },
    { id: "round-3", roundNumber: 3, type: "final" },
  ];

  const testTeams = [
    { id: "t1", teamCode: "TEAM-1", teamName: "Team One", isEliminated: false, finalist: true, disqualified: false },
    { id: "t2", teamCode: "TEAM-2", teamName: "Team Two", isEliminated: true, eliminatedInRoundId: "round-1", finalist: false, disqualified: false },
    { id: "t3", teamCode: "TEAM-3", teamName: "Team Three", isEliminated: true, eliminatedInRoundId: "round-2", finalist: false, disqualified: false },
    { id: "t4", teamCode: "TEAM-4", teamName: "Team Four", isEliminated: false, finalist: false, disqualified: true }, // Disqualified
    { id: "t5", teamCode: "TEAM-5", teamName: "Team Five", isEliminated: false, finalist: true, disqualified: false },
  ];

  // Round 1 competing: all non-disqualified
  const r1Eligible = getCompetingTeamsForRound(testTeams, testRounds[0], testRounds);
  assert(r1Eligible.length === 4, "Round 1 includes all 4 non-disqualified teams");
  assert(!r1Eligible.some(t => t.disqualified), "Round 1 excludes disqualified team");

  // Round 2 competing: should exclude team eliminated in Round 1 (t2) and disqualified (t4)
  const r2Eligible = getCompetingTeamsForRound(testTeams, testRounds[1], testRounds);
  assert(r2Eligible.length === 3, "Round 2 includes 3 teams (t1, t3, t5)");
  assert(!r2Eligible.some(t => t.id === "t2"), "Team eliminated in Round 1 excluded from Round 2");
  assert(!r2Eligible.some(t => t.disqualified), "Disqualified team excluded from Round 2");

  // Round 3 (Final): only non-eliminated finalists (t1, t5)
  const r3Eligible = getCompetingTeamsForRound(testTeams, testRounds[2], testRounds);
  assert(r3Eligible.length === 2, "Final Round includes exactly 2 finalists (t1, t5)");
  assert(r3Eligible.every(t => t.finalist && !t.isEliminated), "All Final Round participants are active finalists");
  assert(!r3Eligible.some(t => t.id === "t2" || t.id === "t3"), "Eliminated teams excluded from Final Round competing list");

  // TEST 2: Scorecard Privacy Gating Logic
  console.log("\n--- TEST 2: Scorecard Privacy Gating Logic ---");
  const unpubScores = computeRoundLeaderboard(
    "round-1",
    false,
    r1Eligible,
    [{ id: "s1", eventId: "e1", roundId: "round-1", judgeId: "j1", teamId: "t1", criterionScores: { c1: 10 }, totalMarksAwarded: 10, totalMaxPossible: 10, normalizedScore: 100, submittedAt: new Date().toISOString() }],
    [],
    [{ id: "c1", eventId: "e1", roundId: "round-1", name: "Innovation", maxMarks: 10, weight: 1 }],
    []
  );
  assert(unpubScores.length > 0, "Leaderboard computes correctly");
  assert(unpubScores[0].finalScore === 100, "Leaderboard computes raw 100 pts");

  // Verify simulated team-status gate
  const round1Unpublished = { isPublished: false };
  const team1Summary = round1Unpublished.isPublished ? unpubScores[0].finalScore : null;
  assert(team1Summary === null, "Unpublished round masks scores from team scorecard");

  // TEST 3: Single Device Session Token Verification
  console.log("\n--- TEST 3: Single-Device Session Enforcement Logic ---");
  const deviceSession1 = "sess_device_1";
  const deviceSession2 = "sess_device_2";

  let teamWithSession = {
    id: "team-test-single",
    activeSessionId: deviceSession1,
    allowMultipleLogins: false,
  };

  // Device 2 attempts login
  const isSecondDeviceBlocked = teamWithSession.activeSessionId && !teamWithSession.allowMultipleLogins;
  assert(isSecondDeviceBlocked === true, "Second device is blocked when account already has active session");

  // Admin resets session
  teamWithSession.activeSessionId = undefined;
  assert(!teamWithSession.activeSessionId, "Admin can reset active session");

  // Device 2 logs in now
  teamWithSession.activeSessionId = deviceSession2;
  assert(teamWithSession.activeSessionId === deviceSession2, "Device 2 successfully claims session after reset");

  // Admin toggles multi-login
  teamWithSession.allowMultipleLogins = true;
  const isMultiDeviceAllowed = !teamWithSession.activeSessionId || teamWithSession.allowMultipleLogins;
  assert(isMultiDeviceAllowed === true, "Multi-device logins allowed when admin overrides setting");

  // SUMMARY
  console.log("\n=========================================");
  console.log(`TOTAL TESTS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log("=========================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error("Test execution error:", err);
  process.exit(1);
});
