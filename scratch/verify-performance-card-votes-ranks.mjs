import fs from "fs";
import path from "path";

// Load .env.local manually
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

import { createParticipantToken } from "../src/lib/hackathon/sessions.ts";
import {
  getHackathonTeams,
  getHackathonEvents,
  getHackathonRounds,
  getHackathonVotes,
  saveHackathonTeam,
} from "../src/lib/hackathon/data.ts";

async function runTests() {
  console.log("==================================================================");
  console.log("=== VERIFYING PERFORMANCE CARD VOTES & ROUND RANK REQUIREMENTS ===");
  console.log("==================================================================\n");

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

  const baseUrl = "http://localhost:3000";
  const events = await getHackathonEvents();
  const event = events[0];
  const teams = await getHackathonTeams(event.id);
  const rounds = await getHackathonRounds(event.id);
  const votes = await getHackathonVotes(event.id);

  // Pick an active finalist team (not eliminated)
  const activeTeam = teams.find(t => !t.isEliminated && !t.disqualified) || teams[0];
  // Pick an eliminated team
  const eliminatedTeam = teams.find(t => t.isEliminated && !t.disqualified);

  // 1. TEST VOTES FOR ACTIVE (NON-ELIMINATED) TEAM
  console.log("--- TEST 1: Votes Count Visibility for Non-Eliminated Teams ---");
  const tokenActive = await createParticipantToken({
    teamId: activeTeam.id,
    eventId: event.id,
    teamCode: activeTeam.teamCode,
    teamName: activeTeam.teamName,
    isEliminated: false,
    finalist: activeTeam.finalist,
  });

  const resActive = await fetch(`${baseUrl}/api/leaderboard/team-status`, {
    headers: { Cookie: `participant-session=${tokenActive}` },
  });
  assert(resActive.status === 200, "Active team queries /api/leaderboard/team-status");
  const dataActive = await resActive.json();

  const expectedVotes = votes.filter(v => v.candidateTeamId === activeTeam.id).length;
  assert(
    dataActive.team.votesReceived === expectedVotes,
    `Active team sees exact dynamic votes count: ${dataActive.team.votesReceived} (expected ${expectedVotes})`
  );

  // 2. TEST VOTES NOT SHOWN FOR ELIMINATED TEAM
  if (eliminatedTeam) {
    console.log("\n--- TEST 2: Votes Count Omitted for Eliminated Teams ---");
    const tokenElim = await createParticipantToken({
      teamId: eliminatedTeam.id,
      eventId: event.id,
      teamCode: eliminatedTeam.teamCode,
      teamName: eliminatedTeam.teamName,
      isEliminated: true,
      finalist: false,
    });

    const resElim = await fetch(`${baseUrl}/api/leaderboard/team-status`, {
      headers: { Cookie: `participant-session=${tokenElim}` },
    });
    const dataElim = await resElim.json();
    assert(
      dataElim.team.votesReceived === undefined,
      "Eliminated team does not have votesReceived displayed"
    );
  }

  // 3. TEST RANK IN EACH ROUND FOR EVERYONE (INCLUDING ROUND 1 RANK FOR DISQUALIFIED)
  console.log("\n--- TEST 3: Round Ranks for Active Team ---");
  assert(dataActive.roundBreakdown.length > 0, "Round breakdown contains tournament rounds");
  for (const rb of dataActive.roundBreakdown) {
    if (rb.isPublished) {
      assert(
        typeof rb.rank === "number" && rb.rank >= 1,
        `Round ${rb.roundNumber} displays official rank #${rb.rank}`
      );
      assert(
        rb.statusBadge && rb.statusBadge.includes("Rank #"),
        `Round ${rb.roundNumber} status badge renders: "${rb.statusBadge}"`
      );
    }
  }

  console.log("\n--- TEST 4: Disqualified Team Round 1 Rank Exception & Round 2+ Blocking ---");
  // Temporarily set a test team to disqualified
  const origDisqualified = activeTeam.disqualified;
  try {
    await saveHackathonTeam({ ...activeTeam, disqualified: true });
    // Wait for 5.5s hotCache invalidation
    await new Promise(r => setTimeout(r, 5500));

    const resDisq = await fetch(`${baseUrl}/api/leaderboard/team-status`, {
      headers: { Cookie: `participant-session=${tokenActive}` },
    });
    const dataDisq = await resDisq.json();

    const round1Breakdown = dataDisq.roundBreakdown.find(r => r.roundNumber === 1);
    const round2Breakdown = dataDisq.roundBreakdown.find(r => r.roundNumber > 1);

    if (round1Breakdown && round1Breakdown.isPublished) {
      assert(
        typeof round1Breakdown.rank === "number" && round1Breakdown.rank >= 1,
        `Disqualified team CAN see Round 1 rank: #${round1Breakdown.rank}`
      );
      assert(
        round1Breakdown.statusBadge.includes("Rank #"),
        `Disqualified team Round 1 status badge shows: "${round1Breakdown.statusBadge}"`
      );
    }

    if (round2Breakdown && round2Breakdown.isPublished) {
      assert(
        round2Breakdown.rank === null,
        `Disqualified team CANNOT see rank for Round ${round2Breakdown.roundNumber} (rank === null)`
      );
      assert(
        round2Breakdown.statusBadge === "Disqualified",
        `Disqualified team Round ${round2Breakdown.roundNumber} status badge shows: "${round2Breakdown.statusBadge}"`
      );
    }
  } finally {
    // Restore team status
    await saveHackathonTeam({ ...activeTeam, disqualified: origDisqualified });
  }

  // -------------------------------------------------------------
  // SUMMARY
  // -------------------------------------------------------------
  console.log("\n==================================================================");
  console.log(`TOTAL TESTS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log("==================================================================\n");

  if (failed > 0) process.exit(1);
}

runTests().catch(err => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
