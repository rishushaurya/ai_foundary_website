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
import { computeStandings, TeamScoreSummary } from "./scoring";

/**
 * Creates an Excel workbook Buffer for Teams.
 * Includes 2 sheets:
 * 1. "Teams - Public Directory" (Safe to share, no passkeys)
 * 2. "Credentials - Confidential" (Team Code, Team Name, and Secret Passkeys)
 */
export function generateTeamsWorkbook(
  teams: HackathonTeam[],
  mode: "full" | "public_only" | "credentials_only" = "full",
  liveSessions: Map<string, { lastLoginAt: string }> = new Map()
): Buffer {
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
      "Device Session": liveSessions.has(t.id) ? "1 Active Device" : "No Session Active",
      "Multi-Device Allowed": t.allowMultipleLogins ? "Yes (Override)" : "No (1 Device Max)",
      "Last Login": liveSessions.has(t.id)
        ? new Date(liveSessions.get(t.id)!.lastLoginAt).toLocaleString()
        : "No active session",
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

function marksRows(
  round: HackathonRound,
  standings: TeamScoreSummary[],
  criteria: HackathonCriteria[],
  scores: HackathonScore[],
  judgeMap: Map<string, string>
): Record<string, any>[] {
  const isFinal = round.type === "final";
  const roundCriteria = criteria.filter((c) => !c.roundId || c.roundId === round.id);

  return standings.map((summary) => {
    const scoreRec = scores.find((s) => s.roundId === round.id && s.teamId === summary.teamId);
    const judgeName = scoreRec ? judgeMap.get(scoreRec.judgeId) || scoreRec.judgeId : "Unassigned";

    const row: Record<string, any> = {
      "Official Rank": summary.disqualified ? "DQ" : summary.rank,
      "Tie": summary.isTie ? "Yes" : "",
      "Team Code": summary.teamCode,
      "Team Name": summary.teamName,
    };

    roundCriteria.forEach((crit) => {
      const mark = scoreRec?.criterionScores?.[crit.id];
      const label = crit.weight && crit.weight !== 1 ? `${crit.name} (Max ${crit.maxMarks}, x${crit.weight})` : `${crit.name} (Max ${crit.maxMarks})`;
      row[label] = mark !== undefined ? mark : "Pending";
    });

    row["Judge Score (/100)"] = summary.avgJudgeScore;
    if (isFinal) {
      row["Audience Votes"] = summary.votesCount ?? 0;
      row["Vote Share (%)"] = summary.voteScore ?? 0;
      row["Final Score (70% Judges + 30% Votes)"] = summary.finalScore;
    } else {
      row["Round Score (/100)"] = summary.finalScore;
    }
    row["Outcome"] = summary.disqualified
      ? "Disqualified"
      : isFinal
      ? summary.rank === 1
        ? "Winner"
        : summary.rank <= 3
        ? `Rank ${summary.rank}`
        : "Finalist"
      : summary.advanced === undefined
      ? "-"
      : summary.advanced
      ? "Advanced"
      : "Eliminated";
    row["Tiebreaker Note"] = summary.tiebreakerReason || "";
    row["Evaluator Judge"] = judgeName;
    row["Judge Remarks / Feedback"] = scoreRec?.feedback || "";
    row["Score Status"] = scoreRec?.changeRequested ? "Revision Requested" : scoreRec ? "Evaluated" : "Not Scored";
    return row;
  });
}

/**
 * Marks workbook. One sheet per round, and when exporting several rounds a first
 * "Results & Winners" sheet summarising who advanced each round and the final podium.
 */
export function generateMarksWorkbook(
  event: HackathonEvent,
  roundsToExport: HackathonRound[],
  allRounds: HackathonRound[],
  criteria: HackathonCriteria[],
  scores: HackathonScore[],
  teams: HackathonTeam[],
  votes: HackathonVote[],
  tiebreakers: HackathonTiebreaker[],
  judges: HackathonJudge[]
): Buffer {
  const wb = XLSX.utils.book_new();
  const judgeMap = new Map(judges.map((j) => [j.id, j.name]));

  const perRound = roundsToExport.map((round) => ({
    round,
    standings: computeStandings(
      round,
      allRounds,
      teams,
      scores.filter((s) => s.roundId === round.id),
      votes.filter((v) => v.roundId === round.id),
      criteria,
      tiebreakers.filter((t) => t.roundId === round.id)
    ),
  }));

  if (roundsToExport.length > 1) {
    const summary: Record<string, any>[] = [];
    for (const { round, standings } of perRound) {
      const active = standings.filter((s) => !s.disqualified);
      if (round.type === "final") {
        for (const s of active.slice(0, 3)) {
          summary.push({
            "Stage": `${round.name} (Final)`,
            "Result": s.rank === 1 ? "WINNER" : `Rank ${s.rank}`,
            "Team Code": s.teamCode,
            "Team Name": s.teamName,
            "Score": s.finalScore,
            "Status": round.status === "completed" ? "Final" : `Provisional (round ${round.status})`,
          });
        }
      } else {
        const advanced = active.filter((s) => s.advanced);
        summary.push({
          "Stage": round.name,
          "Result": `${advanced.length} advanced of ${active.length}`,
          "Team Code": advanced.map((s) => s.teamCode).join(", "),
          "Team Name": advanced.map((s) => s.teamName).join(", "),
          "Score": "",
          "Status": round.status,
        });
      }
    }
    const ws = XLSX.utils.json_to_sheet(summary.length ? summary : [{ Stage: "No rounds scored yet" }]);
    ws["!cols"] = [{ wch: 24 }, { wch: 22 }, { wch: 30 }, { wch: 40 }, { wch: 10 }, { wch: 26 }];
    XLSX.utils.book_append_sheet(wb, ws, "Results & Winners");
  }

  for (const { round, standings } of perRound) {
    const rows = marksRows(round, standings, criteria, scores, judgeMap);
    const ws = XLSX.utils.json_to_sheet(rows.length ? rows : [{ "Official Rank": "No competing teams" }]);
    XLSX.utils.book_append_sheet(wb, ws, `R${round.roundNumber} ${round.name}`.replace(/[\\/?*\[\]:]/g, " ").slice(0, 31));
  }

  const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
  void event;
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
