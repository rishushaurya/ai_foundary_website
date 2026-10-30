// Team sheet import, shared by the admin preview (browser) and the import API (server).
// Keep it free of Node-only imports: passkeys are generated on the server, not here.

export type ImportField = "teamCode" | "teamName" | "leaderName" | "leaderEmail" | "leaderPhone" | "members" | "passkey";

export const MAX_IMPORT_ROWS = 3000;
const MAX_CELL_LENGTH = 1000;
const MAX_MEMBERS = 20;

// Headers are compared after lowercasing and dropping everything but letters and digits, and only
// exact matches count, so "passcode" can never be read as the team code. Most specific first.
const ALIASES: Record<ImportField, string[]> = {
  teamCode: ["teamcode", "code", "teamid", "id", "teamno", "teamnumber", "teamnum", "teamref", "registrationid", "regid", "regno"],
  teamName: ["teamname", "nameofteam", "team", "name"],
  leaderName: ["leadername", "teamleadername", "teamleader", "teamleadname", "teamlead", "leader", "leadname", "lead", "captainname", "captain"],
  leaderEmail: ["leaderemail", "teamleaderemail", "teamleademail", "leademail", "leadermail", "captainemail", "contactemail", "emailaddress", "emailid", "email", "mail"],
  leaderPhone: ["leaderphone", "teamleaderphone", "teamleadphone", "leadphone", "leadermobile", "phonenumber", "phoneno", "phone", "mobilenumber", "mobileno", "mobile", "contactnumber", "contactno", "contact", "whatsappnumber", "whatsapp"],
  members: ["teammembers", "teammembersnames", "membernames", "members", "member", "participants"],
  passkey: ["passkey", "teampasskey", "secretpasskey", "loginpasskey", "password", "passcode", "accesscode", "secretcode", "secret", "pass", "pin"],
};
const MEMBER_COLUMN = /^(teammember|member|participant)(name)?\d+(name)?$/;
const FIELD_LABELS: Record<ImportField, string> = {
  teamCode: "Team Code",
  teamName: "Team Name",
  leaderName: "Leader Name",
  leaderEmail: "Leader Email",
  leaderPhone: "Leader Phone",
  members: "Members",
  passkey: "Passkey",
};

export const TEAM_IMPORT_TEMPLATE =
  "Team Code,Team Name,Leader Name,Leader Email,Leader Phone,Members,Passkey\n" +
  'T-101,Neural Nexus,Alex Chen,alex@uni.edu,9876543210,"David, Sarah, Priya",\n';

export interface ImportedTeamRow {
  row: number; // spreadsheet row number (header is row 1)
  teamCode: string;
  teamName: string;
  leaderName: string;
  leaderEmail: string;
  leaderPhone: string;
  members: string[];
  passkey: string; // "" means the server generates one
  codeGenerated: boolean;
  errors: string[];
  warnings: string[];
}

export interface TeamImportAnalysis {
  fatal?: string;
  columns: Partial<Record<ImportField, string>>;
  memberColumns: string[];
  ignoredColumns: string[];
  rows: ImportedTeamRow[];
  summary: { total: number; valid: number; invalid: number; generatedCodes: number; generatedPasskeys: number; withWarnings: number };
}

const normHeader = (h: string) => h.toLowerCase().replace(/[^a-z0-9]/g, "");
const clean = (v: string) => v.replace(/[<>]/g, "").replace(/\s+/g, " ").trim();

/**
 * CSV / TSV / semicolon text (pasted from Excel or Google Sheets, or a saved file) to rows.
 * The delimiter is whichever of tab, comma or semicolon appears most in the first line.
 * Handles quoted cells, "" escapes and line breaks inside quotes.
 */
export function parseDelimitedText(text: string): string[][] {
  const src = text.replace(/^﻿/, "");
  const firstLine = src.split(/\r?\n/).find((l) => l.trim()) || "";
  const outsideQuotes = firstLine.replace(/"[^"]*"/g, "");
  const delimiter = ["\t", ",", ";"].reduce((best, d) =>
    outsideQuotes.split(d).length > outsideQuotes.split(best).length ? d : best
  );

  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;
  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (inQuotes) {
      if (ch === '"' && src[i + 1] === '"') {
        cell += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        cell += ch;
      }
    } else if (ch === '"' && cell.trim() === "") {
      inQuotes = true;
      cell = "";
    } else if (ch === delimiter) {
      row.push(cell);
      cell = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && src[i + 1] === "\n") i++;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += ch;
    }
  }
  if (cell !== "" || row.length > 0) {
    row.push(cell);
    rows.push(row);
  }
  return rows;
}

/** Untrusted request body to a bounded grid of strings, or null if it isn't one. */
export function normalizeGrid(input: unknown): string[][] | null {
  if (!Array.isArray(input) || input.length > MAX_IMPORT_ROWS + 1) return null;
  const grid: string[][] = [];
  for (const row of input) {
    if (!Array.isArray(row) || row.length > 100) return null;
    grid.push(row.map((c) => (c === null || c === undefined ? "" : String(c)).slice(0, MAX_CELL_LENGTH)));
  }
  return grid;
}

function mapColumns(header: string[]) {
  const normalized = header.map(normHeader);
  const columns: Partial<Record<ImportField, number>> = {};
  const used = new Set<number>();
  for (const field of Object.keys(ALIASES) as ImportField[]) {
    let best = -1;
    let bestRank = Infinity;
    normalized.forEach((h, idx) => {
      const rank = ALIASES[field].indexOf(h);
      if (rank >= 0 && rank < bestRank && !used.has(idx)) {
        best = idx;
        bestRank = rank;
      }
    });
    if (best >= 0) {
      columns[field] = best;
      used.add(best);
    }
  }
  const memberIdx: number[] = [];
  normalized.forEach((h, idx) => {
    if (!used.has(idx) && MEMBER_COLUMN.test(h)) {
      memberIdx.push(idx);
      used.add(idx);
    }
  });
  const ignored = header.filter((h, idx) => !used.has(idx) && h.trim());
  return { columns, memberIdx, ignored };
}

function nextGeneratedCode(used: Set<string>): string {
  let max = 0;
  for (const code of used) {
    const m = /^TEAM-(\d+)$/.exec(code);
    if (m) max = Math.max(max, Number(m[1]));
  }
  const code = `TEAM-${String(max + 1).padStart(3, "0")}`;
  used.add(code);
  return code;
}

/**
 * Checks every row before anything is saved. Errors block a row; warnings are informational.
 * `existing` is the event's current teams, so codes already in use are caught here too.
 */
export function analyzeTeamImport(
  grid: string[][],
  existing: { teamCode: string; teamName: string }[]
): TeamImportAnalysis {
  const empty: TeamImportAnalysis = {
    columns: {},
    memberColumns: [],
    ignoredColumns: [],
    rows: [],
    summary: { total: 0, valid: 0, invalid: 0, generatedCodes: 0, generatedPasskeys: 0, withWarnings: 0 },
  };
  const nonEmpty = grid
    .map((cells, idx) => ({ cells, row: idx + 1 }))
    .filter(({ cells }) => cells.some((c) => c.trim()));
  if (nonEmpty.length === 0) return { ...empty, fatal: "The sheet is empty." };

  const [headerRow, ...dataRows] = nonEmpty;
  if (dataRows.length > MAX_IMPORT_ROWS) {
    return { ...empty, fatal: `Too many rows (${dataRows.length}). Import at most ${MAX_IMPORT_ROWS} teams at a time.` };
  }
  const header = headerRow.cells.map((h) => h.trim());
  const { columns, memberIdx, ignored } = mapColumns(header);
  const columnNames = Object.fromEntries(
    Object.entries(columns).map(([field, idx]) => [field, header[idx as number]])
  ) as Partial<Record<ImportField, string>>;
  const base = { ...empty, columns: columnNames, memberColumns: memberIdx.map((i) => header[i]), ignoredColumns: ignored };

  if (columns.teamName === undefined) {
    return {
      ...base,
      fatal: `No "${FIELD_LABELS.teamName}" column found. The first row must be headers; found: ${
        header.filter(Boolean).join(", ") || "nothing"
      }.`,
    };
  }
  if (dataRows.length === 0) return { ...base, fatal: "The sheet has a header row but no teams." };

  const existingCodes = new Set(existing.map((t) => t.teamCode.trim().toUpperCase()));
  const existingNames = new Set(existing.map((t) => t.teamName.trim().toLowerCase()));
  const seenCodes = new Map<string, number>();
  const seenNames = new Map<string, number>();
  const seenEmails = new Map<string, number>();
  const get = (cells: string[], field: ImportField) => {
    const idx = columns[field];
    return idx === undefined ? "" : cells[idx] ?? "";
  };

  const rows: ImportedTeamRow[] = dataRows.map(({ cells, row }) => {
    const errors: string[] = [];
    const warnings: string[] = [];

    const teamCode = clean(get(cells, "teamCode")).toUpperCase().replace(/\s+/g, "-");
    if (teamCode) {
      if (!/^[A-Z0-9][A-Z0-9_-]{0,23}$/.test(teamCode)) {
        errors.push("Team code may only use letters, numbers, - and _ (max 24 characters).");
      } else if (existingCodes.has(teamCode)) {
        errors.push(`Team code ${teamCode} is already registered in this event.`);
      } else if (seenCodes.has(teamCode)) {
        errors.push(`Team code ${teamCode} is also on row ${seenCodes.get(teamCode)}.`);
      } else {
        seenCodes.set(teamCode, row);
      }
    }

    const teamName = clean(get(cells, "teamName"));
    if (!teamName) errors.push("Team name is missing.");
    else if (teamName.length > 100) errors.push("Team name is longer than 100 characters.");
    else {
      const key = teamName.toLowerCase();
      if (existingNames.has(key)) warnings.push("A team with this name already exists in the event.");
      else if (seenNames.has(key)) warnings.push(`Same team name as row ${seenNames.get(key)}.`);
      else seenNames.set(key, row);
    }

    const leaderName = clean(get(cells, "leaderName")).slice(0, 100);

    const leaderEmail = clean(get(cells, "leaderEmail")).toLowerCase();
    if (leaderEmail) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(leaderEmail) || leaderEmail.length > 200) {
        errors.push(`"${leaderEmail}" is not a valid email address.`);
      } else if (seenEmails.has(leaderEmail)) {
        warnings.push(`Same leader email as row ${seenEmails.get(leaderEmail)}.`);
      } else {
        seenEmails.set(leaderEmail, row);
      }
    }

    const leaderPhone = clean(get(cells, "leaderPhone")).slice(0, 40);
    if (leaderPhone) {
      if (/e\+?\d/i.test(leaderPhone)) {
        warnings.push("Phone looks like scientific notation (Excel). Format that column as Text and re-export.");
      } else {
        const digits = leaderPhone.replace(/\D/g, "").length;
        if (digits < 7 || digits > 15) warnings.push("Phone number has an unusual number of digits.");
      }
    }

    const rawMembers = [get(cells, "members"), ...memberIdx.map((i) => cells[i] ?? "")];
    const memberSet = new Map<string, string>();
    for (const part of rawMembers.flatMap((v) => v.split(/[;,|\n\r]+/))) {
      const name = clean(part).slice(0, 100);
      if (name && !memberSet.has(name.toLowerCase())) memberSet.set(name.toLowerCase(), name);
    }
    let members = [...memberSet.values()];
    if (members.length > MAX_MEMBERS) {
      warnings.push(`${members.length} members listed; only the first ${MAX_MEMBERS} are kept.`);
      members = members.slice(0, MAX_MEMBERS);
    }

    const passkey = get(cells, "passkey").trim();
    if (passkey && (passkey.length < 6 || passkey.length > 64 || /\s/.test(passkey))) {
      errors.push("Passkey must be 6-64 characters with no spaces (or leave it empty to generate one).");
    }

    return {
      row,
      teamCode,
      teamName,
      leaderName,
      leaderEmail,
      leaderPhone,
      members,
      passkey,
      codeGenerated: false,
      errors,
      warnings,
    };
  });

  // Codes are generated only after every typed code is known, so a generated code never collides.
  const usedCodes = new Set([...existingCodes, ...seenCodes.keys()]);
  for (const r of rows) {
    if (!r.teamCode && r.errors.length === 0) {
      r.teamCode = nextGeneratedCode(usedCodes);
      r.codeGenerated = true;
    }
  }

  const valid = rows.filter((r) => r.errors.length === 0);
  return {
    ...base,
    rows,
    summary: {
      total: rows.length,
      valid: valid.length,
      invalid: rows.length - valid.length,
      generatedCodes: valid.filter((r) => r.codeGenerated).length,
      generatedPasskeys: valid.filter((r) => !r.passkey).length,
      withWarnings: rows.filter((r) => r.warnings.length > 0).length,
    },
  };
}
