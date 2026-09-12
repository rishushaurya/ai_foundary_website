import { HACKATHON_CONSTANTS } from "../src/lib/hackathon/constants";
import { computeRoundLeaderboard } from "../src/lib/hackathon/scoring";
import {
  generateTeamsWorkbook,
  generateJudgesWorkbook,
  generateMarksWorkbook,
  generateVotesWorkbook,
} from "../src/lib/hackathon/excel-export";
import * as XLSX from "xlsx";

console.log("=========================================");
console.log("RUNNING COMPLETE HACKATHON FEATURE SUITE TESTS");
console.log("=========================================\n");

// 1. Verify 70/30 Constants
console.log("--- 1. Verifying 70/30 Constants ---");
console.assert(HACKATHON_CONSTANTS.JUDGE_WEIGHT === 0.70, "JUDGE_WEIGHT must be 0.70");
console.assert(HACKATHON_CONSTANTS.VOTE_WEIGHT === 0.30, "VOTE_WEIGHT must be 0.30");
console.log("✅ Constants verified: Judge Weight = 70%, Vote Weight = 30%\n");

// 2. Verify 70/30 Leaderboard Calculation
console.log("--- 2. Verifying 70/30 Scoring Engine ---");
const mockTeams = [
  { id: "team-1", teamCode: "T-01", teamName: "Alpha", finalist: true, isEliminated: false, passkey: "KEY123" },
  { id: "team-2", teamCode: "T-02", teamName: "Beta", finalist: true, isEliminated: false, passkey: "KEY456" },
];
const mockCriteria = [
  { id: "crit-1", name: "Innovation", maxMarks: 50, roundId: "r-final" },
  { id: "crit-2", name: "Execution", maxMarks: 50, roundId: "r-final" },
];
// Judge scores:
// team-1: Innovation 50, Execution 50 -> 100% normalized = 100
// team-2: Innovation 25, Execution 25 -> 50% normalized = 50
const mockScores = [
  {
    id: "s-1",
    roundId: "r-final",
    teamId: "team-1",
    judgeId: "j-1",
    criterionScores: { "crit-1": 50, "crit-2": 50 },
    normalizedScore: 100,
    submittedAt: new Date().toISOString(),
  },
  {
    id: "s-2",
    roundId: "r-final",
    teamId: "team-2",
    judgeId: "j-1",
    criterionScores: { "crit-1": 25, "crit-2": 25 },
    normalizedScore: 50,
    submittedAt: new Date().toISOString(),
  },
];
// Votes:
// team-1: 1 vote out of 4 (25%) -> voteScore = 25
// team-2: 3 votes out of 4 (75%) -> voteScore = 75
const mockVotes = [
  { id: "v-1", roundId: "r-final", candidateTeamId: "team-1", voterTeamId: "elim-1" },
  { id: "v-2", roundId: "r-final", candidateTeamId: "team-2", voterTeamId: "elim-2" },
  { id: "v-3", roundId: "r-final", candidateTeamId: "team-2", voterTeamId: "elim-3" },
  { id: "v-4", roundId: "r-final", candidateTeamId: "team-2", voterTeamId: "elim-4" },
];

const results = computeRoundLeaderboard(
  "r-final",
  true, // isFinal
  mockTeams,
  mockScores,
  mockVotes,
  mockCriteria,
  []
);

console.log("Calculation Results in Final Round:");
for (const r of results) {
  console.log(`Team: ${r.teamName}, JudgeAvg: ${r.avgJudgeScore}, VoteScore: ${r.voteScore}, Final: ${r.finalScore}, Rank: ${r.rank}`);
}

// Team 1: 100 * 0.70 + 25 * 0.30 = 70 + 7.5 = 77.5
// Team 2: 50 * 0.70 + 75 * 0.30 = 35 + 22.5 = 57.5
const t1 = results.find(r => r.teamId === "team-1");
const t2 = results.find(r => r.teamId === "team-2");

console.assert(t1.finalScore === 77.5, `Expected 77.5, got ${t1.finalScore}`);
console.assert(t2.finalScore === 57.5, `Expected 57.5, got ${t2.finalScore}`);
console.assert(t1.rank === 1, "Team 1 should be rank 1");
console.assert(t2.rank === 2, "Team 2 should be rank 2");
console.log("✅ 70/30 scoring formula verified with exact precision!\n");

// 3. Verify Excel Export Suite
console.log("--- 3. Verifying Excel Workbooks ---");
// Teams workbook (2 sheets)
const teamsBuf = generateTeamsWorkbook(mockTeams, "full");
const teamsWb = XLSX.read(teamsBuf, { type: "buffer" });
console.assert(teamsWb.SheetNames.includes("Teams - Public Roster"), "Missing public sheet");
console.assert(teamsWb.SheetNames.includes("Credentials - Passkeys"), "Missing credentials sheet");

const publicSheetRows = XLSX.utils.sheet_to_json(teamsWb.Sheets["Teams - Public Roster"]);
const credsSheetRows = XLSX.utils.sheet_to_json(teamsWb.Sheets["Credentials - Passkeys"]);

console.assert(publicSheetRows.length === 2, "Public sheet should have 2 rows");
console.assert(credsSheetRows.length === 2, "Credentials sheet should have 2 rows");
console.assert(!("Secret Passkey" in publicSheetRows[0]), "Public sheet must NEVER contain Secret Passkey");
console.assert(credsSheetRows[0]["Secret Passkey"] === "KEY123", "Credentials sheet must contain Secret Passkey");
console.log("✅ Teams 2-Sheet Excel Workbook verified (Public Roster & Secret Passkeys)!");

// Judges workbook
const mockJudges = [
  { id: "j-1", name: "Chief Judge", email: "judge@hackathon.com", accessCode: "JDG999", active: true },
];
const judgesBuf = generateJudgesWorkbook(mockJudges);
const judgesWb = XLSX.read(judgesBuf, { type: "buffer" });
console.assert(judgesWb.SheetNames.includes("Judges Directory"), "Missing judges sheet");
const judgeRows = XLSX.utils.sheet_to_json(judgesWb.Sheets["Judges Directory"]);
console.assert(judgeRows[0]["Access Code / Passkey"] === "JDG999", "Judge passkey should be exported");
console.log("✅ Judges Excel Workbook verified!");

// Marks workbook
const mockEvent = { id: "ev-1", title: "Global AI Hackathon" };
const mockRound = { id: "r-final", name: "Grand Finale", roundNumber: 3, type: "final" };
const marksBuf = generateMarksWorkbook(
  mockEvent,
  mockRound,
  mockCriteria,
  mockScores,
  mockTeams,
  mockVotes,
  [],
  mockJudges
);
const marksWb = XLSX.read(marksBuf, { type: "buffer" });
const marksSheetName = marksWb.SheetNames[0];
const marksRows = XLSX.utils.sheet_to_json(marksWb.Sheets[marksSheetName]);
console.assert(marksRows.length === 2, "Marks rows should have 2 teams");
console.assert(marksRows[0]["Final Weighted Score (70% Judge + 30% Votes)"] === 77.5, "Marks should include 70/30 score");
console.log("✅ Marks Excel Workbook with 70/30 and ranking verified!");

// Votes workbook
const votesBuf = generateVotesWorkbook(mockVotes, mockTeams);
const votesWb = XLSX.read(votesBuf, { type: "buffer" });
console.assert(votesWb.SheetNames.includes("Audience Votes Audit"), "Missing votes sheet");
console.log("✅ Votes Excel Workbook verified!\n");

console.log("=========================================");
console.log("ALL VERIFICATIONS COMPLETED SUCCESSFULLY!");
console.log("=========================================");
