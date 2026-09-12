import * as XLSX from "xlsx";
import {
  HackathonEvent,
  HackathonRound,
  HackathonCriteria,
  HackathonTeam,
  HackathonJudge,
  HackathonScore,
  HackathonVote,
  HackathonTiebreaker,
} from "./constants";
import { computeRoundLeaderboard, TeamScoreSummary } from "./scoring";

/**
 * Creates an Excel workbook Buffer for Teams.
 * Includes 2 sheets:
 * 1. "Teams - Public Directory" (Safe to share, no passkeys)
 * 2. "Credentials - Confidential" (Team Code, Team Name, and Secret Passkeys)
 */
export function generateTeamsWorkbook(teams: HackathonTeam[], mode: "full" | "public_only" | "credentials_only" = "full"): Buffer {
  const wb = XLSX.utils.book_new();

  if (mode === "full" || mode === "public_only") {
    const publicData = teams.map((t, idx) => ({
      "Sl No": idx + 1,
      "Team Code": t.teamCode || "",
      "Team Name": t.teamName || "",
      "Leader Name": t.leaderName || "N/A",
      "Leader Email": t.leaderEmail || "N/A",
      "Leader Phone": t.leaderPhone || "N/A",
      "Team Members": Array.isArray(t.members) ? t.members.join(", ") : "",
      "Status": t.disqualified ? "Disqualified" : t.isEliminated ? "Eliminated" : "Active",
      "Stage": t.finalist ? "Finalist" : "Standard",
      "Registered At": t.createdAt ? new Date(t.createdAt).toLocaleString() : "",
    }));

    const wsPublic = XLSX.utils.json_to_sheet(publicData);
    wsPublic["!cols"] = [
      { wch: 8 },  // Sl No
      { wch: 14 }, // Team Code
      { wch: 25 }, // Team Name
      { wch: 20 }, // Leader Name
      { wch: 26 }, // Leader Email
      { wch: 16 }, // Leader Phone
      { wch: 35 }, // Members
      { wch: 14 }, // Status
      { wch: 12 }, // Stage
      { wch: 22 }, // Registered At
    ];
    XLSX.utils.book_append_sheet(wb, wsPublic, "Teams - Public Roster");
  }

  if (mode === "full" || mode === "credentials_only") {
    const credsData = teams.map((t, idx) => ({
      "Sl No": idx + 1,
      "Team Code": t.teamCode || "",
      "Team Name": t.teamName || "",
      "Secret Passkey": t.passkey || "Not Set",
      "Device Session": t.activeSessionId ? "1 Active Device" : "No Session Active",
      "Multi-Device Allowed": t.allowMultipleLogins ? "Yes (Override)" : "No (1 Device Max)",
      "Last Login": t.lastLoginAt ? new Date(t.lastLoginAt).toLocaleString() : "Never",
    }));

    const wsCreds = XLSX.utils.json_to_sheet(credsData);
    wsCreds["!cols"] = [
      { wch: 8 },  // Sl No
      { wch: 14 }, // Team Code
      { wch: 25 }, // Team Name
      { wch: 20 }, // Secret Passkey
      { wch: 20 }, // Device Session
      { wch: 24 }, // Multi-Device Allowed
      { wch: 22 }, // Last Login
    ];
    XLSX.utils.book_append_sheet(wb, wsCreds, "Credentials - Passkeys");
  }

  const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
  return Buffer.isBuffer(buf) ? buf : Buffer.from(buf);
}

/**
 * Creates an Excel workbook Buffer for Judges.
 */
export function generateJudgesWorkbook(judges: HackathonJudge[]): Buffer {
  const wb = XLSX.utils.book_new();

  const judgesData = judges.map((j, idx) => ({
    "Sl No": idx + 1,
    "Judge Name": j.name || "",
    "Email": j.email || "",
    "Access Code / Passkey": j.accessCode || "Encrypted",
    "Status": j.active ? "Active" : "Inactive",
    "Assigned Event ID": j.eventId || "",
    "Created At": j.createdAt ? new Date(j.createdAt).toLocaleString() : "",
  }));

  const ws = XLSX.utils.json_to_sheet(judgesData);
  ws["!cols"] = [
    { wch: 8 },  // Sl No
    { wch: 24 }, // Judge Name
    { wch: 30 }, // Email
    { wch: 24 }, // Access Code
    { wch: 12 }, // Status
    { wch: 28 }, // Assigned Event ID
    { wch: 22 }, // Created At
  ];
  XLSX.utils.book_append_sheet(wb, ws, "Judges Directory");

  const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
  return Buffer.isBuffer(buf) ? buf : Buffer.from(buf);
}

/**
 * Creates an Excel workbook Buffer for a specific Round's Marks, Scores & Rankings.
 */
export function generateMarksWorkbook(
  event: HackathonEvent,
  round: HackathonRound,
  criteria: HackathonCriteria[],
  scores: HackathonScore[],
  teams: HackathonTeam[],
  votes: HackathonVote[],
  tiebreakers: HackathonTiebreaker[],
  judges: HackathonJudge[]
): Buffer {
  const wb = XLSX.utils.book_new();

  const isFinal = round.type === "final";
  const leaderboard = computeRoundLeaderboard(
    round.id,
    isFinal,
    teams,
    scores,
    votes,
    criteria,
    tiebreakers
  );

  const judgeMap = new Map(judges.map((j) => [j.id, j.name]));
  const roundCriteria = criteria.filter((c) => !c.roundId || c.roundId === round.id);

  const marksData = leaderboard.map((summary: TeamScoreSummary) => {
    const team = teams.find((t) => t.id === summary.teamId);
    const scoreRec = scores.find((s) => s.roundId === round.id && s.teamId === summary.teamId);
    const judgeName = scoreRec ? judgeMap.get(scoreRec.judgeId) || scoreRec.judgeId : "Unassigned";

    const row: Record<string, any> = {
      "Official Rank": summary.rank ?? "N/A",
      "Team Code": summary.teamCode,
      "Team Name": summary.teamName,
      "Status": summary.disqualified
        ? "Disqualified"
        : team?.isEliminated
        ? "Eliminated"
        : "Active",
    };

    // Include criterion scores
    roundCriteria.forEach((crit) => {
      const mark = scoreRec?.criterionScores?.[crit.id];
      row[`${crit.name} (Max: ${crit.maxMarks})`] = mark !== undefined ? mark : "Pending";
    });

    row["Evaluator Marks (/100)"] = summary.avgJudgeScore;

    if (isFinal) {
      row["Audience Votes Count"] = summary.votesCount;
      row["Audience Vote Pct (%)"] = summary.voteScore;
      row["Final Weighted Score (70% Judge + 30% Votes)"] = summary.finalScore;
    } else {
      row["Final Round Score (/100)"] = summary.finalScore;
    }

    row["Evaluator Judge"] = judgeName;
    row["Judge Remarks / Feedback"] = scoreRec?.feedback || "None";
    row["Score Status"] = scoreRec?.changeRequested
      ? "Revision Requested"
      : scoreRec
      ? "Evaluated"
      : "Not Scored";

    return row;
  });

  const ws = XLSX.utils.json_to_sheet(marksData);
  XLSX.utils.book_append_sheet(wb, ws, `Round ${round.roundNumber} Marks`);

  const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
  return Buffer.isBuffer(buf) ? buf : Buffer.from(buf);
}

/**
 * Creates an Excel workbook Buffer for Audience Votes.
 */
export function generateVotesWorkbook(
  votes: HackathonVote[],
  teams: HackathonTeam[]
): Buffer {
  const wb = XLSX.utils.book_new();

  const teamMap = new Map(teams.map((t) => [t.id, t]));

  const votesData = votes.map((v, idx) => {
    const voterTeam = teamMap.get(v.voterTeamId);
    const candidateTeam = teamMap.get(v.candidateTeamId);

    return {
      "Sl No": idx + 1,
      "Timestamp": v.submittedAt ? new Date(v.submittedAt).toLocaleString() : "",
      "Voter Team Code": voterTeam?.teamCode || v.voterTeamId,
      "Voter Team Name": voterTeam?.teamName || "Unknown",
      "Candidate Voted For (Code)": candidateTeam?.teamCode || v.candidateTeamId,
      "Candidate Voted For (Name)": candidateTeam?.teamName || "Unknown",
      "Voter IP Address": v.ipAddress || "Unknown",
    };
  });

  const ws = XLSX.utils.json_to_sheet(votesData);
  ws["!cols"] = [
    { wch: 8 },  // Sl No
    { wch: 22 }, // Timestamp
    { wch: 18 }, // Voter Team Code
    { wch: 25 }, // Voter Team Name
    { wch: 26 }, // Candidate Voted For (Code)
    { wch: 26 }, // Candidate Voted For (Name)
    { wch: 18 }, // Voter IP Address
  ];
  XLSX.utils.book_append_sheet(wb, ws, "Audience Votes Audit");

  const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
  return Buffer.isBuffer(buf) ? buf : Buffer.from(buf);
}
