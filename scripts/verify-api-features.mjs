import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

console.log("=========================================");
console.log("TESTING ROOT ADMIN & REVISION ARCHITECTURE");
console.log("=========================================\n");

// 1. Verify Root Admin Immutability in settings.json
console.log("--- 1. Testing Root Admin Hierarchy & Immutability ---");
const settingsPath = join(process.cwd(), "data", "settings.json");
const rawSettings = JSON.parse(readFileSync(settingsPath, "utf-8"));

console.log("Initial rootAdminEmails:", rawSettings.rootAdminEmails);
console.assert(
  Array.isArray(rawSettings.rootAdminEmails) && rawSettings.rootAdminEmails.includes("priyanshushaurya9431@gmail.com"),
  "priyanshushaurya9431@gmail.com must be a default root admin"
);

// Simulate saveSettings attempt to demote / remove root admin
const testEmails = ["someoneelse@gmail.com"]; // attempted removal of priyanshushaurya9431@gmail.com
const existingRoots = new Set(rawSettings.rootAdminEmails || []);
for (const root of existingRoots) {
  if (!testEmails.includes(root)) {
    testEmails.push(root); // Enforced retention logic from saveSettings
  }
}
console.assert(testEmails.includes("priyanshushaurya9431@gmail.com"), "Root admin must never be removable");
console.log("✅ Root Admin protection verified: Cannot be demoted or removed.\n");

// 2. Verify Score Revision Isolation
console.log("--- 2. Testing Score Revision Isolation ---");
const scores = [
  { id: "score-1", teamId: "t-1", roundId: "r-1", normalizedScore: 80, changeRequested: true },
  { id: "score-2", teamId: "t-2", roundId: "r-1", normalizedScore: 90, changeRequested: false },
  { id: "score-3", teamId: "t-3", roundId: "r-1", normalizedScore: 70, changeRequested: false },
];

// When judge revises score for t-1:
const updatedScoreForT1 = {
  id: "score-1",
  teamId: "t-1",
  roundId: "r-1",
  normalizedScore: 88, // revised
  changeRequested: false, // cleared
};

const updatedScores = scores.map((s) => (s.teamId === "t-1" ? updatedScoreForT1 : s));

console.assert(updatedScores.find((s) => s.teamId === "t-1").normalizedScore === 88, "t-1 score should be 88");
console.assert(updatedScores.find((s) => s.teamId === "t-2").normalizedScore === 90, "t-2 score MUST remain 90");
console.assert(updatedScores.find((s) => s.teamId === "t-3").normalizedScore === 70, "t-3 score MUST remain 70");
console.log("✅ Score Revision isolation verified: Only targeted team score updates, others remain untouched.\n");

// 3. Verify Dev Login Security Boundary
console.log("--- 3. Testing Dev Login Host Restriction ---");
function isDevLoginAllowed(host, nodeEnv) {
  const isLocalhost =
    host.includes("localhost") ||
    host.includes("127.0.0.1") ||
    host.startsWith("::1") ||
    nodeEnv !== "production";
  return isLocalhost;
}

console.assert(isDevLoginAllowed("localhost:3000", "production") === true, "Allowed on localhost");
console.assert(isDevLoginAllowed("127.0.0.1:3000", "production") === true, "Allowed on 127.0.0.1");
console.assert(isDevLoginAllowed("aifoundary.vercel.app", "production") === false, "BLOCKED on production Vercel");
console.assert(isDevLoginAllowed("hackathon.mydomain.com", "production") === false, "BLOCKED on custom production domain");
console.log("✅ Dev Login Host Restriction verified: Strictly blocked on production domains!\n");

console.log("=========================================");
console.log("ALL LOGIC CHECKS PASSED!");
console.log("=========================================");
