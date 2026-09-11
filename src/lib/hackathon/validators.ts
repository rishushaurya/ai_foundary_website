import bcrypt from "bcryptjs";

// ---- String sanitization ----
export function sanitizeString(input: unknown): string {
  if (typeof input !== "string") return "";
  return input.trim().replace(/[<>]/g, ""); // basic XSS prevention
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ---- Passkey / Access code hashing ----
export async function hashSecret(secret: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(secret, salt);
}

export async function compareSecret(secret: string, hashed: string): Promise<boolean> {
  try {
    return await bcrypt.compare(secret, hashed);
  } catch {
    return false;
  }
}

// ---- CSV Parser for Bulk Teams ----
export interface ParsedTeamCSV {
  teamCode: string;
  teamName: string;
  leaderName: string;
  leaderEmail: string;
  leaderPhone?: string;
  members: string[];
  passkey: string;
}

export function parseTeamsCSV(csvContent: string): { teams: ParsedTeamCSV[]; errors: string[] } {
  const lines = csvContent
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length <= 1) {
    return { teams: [], errors: ["CSV file is empty or contains only a header line."] };
  }

  const header = lines[0].toLowerCase().split(",").map((h) => h.trim().replace(/^"|"$/g, ""));
  // Expected headers: team_code, team_name, leader_name, leader_email, leader_phone, members (comma or semicolon separated or member_1...), passkey
  const codeIdx = header.findIndex((h) => h.includes("code") || h === "teamcode" || h === "id");
  const nameIdx = header.findIndex((h) => h.includes("name") && !h.includes("leader"));
  const leaderNameIdx = header.findIndex((h) => h.includes("leader") && h.includes("name"));
  const leaderEmailIdx = header.findIndex((h) => h.includes("leader") && h.includes("email") || h === "email");
  const phoneIdx = header.findIndex((h) => h.includes("phone") || h.includes("mobile"));
  const passkeyIdx = header.findIndex((h) => h.includes("pass") || h.includes("code") || h.includes("secret") || h.includes("pin"));
  const membersIdx = header.findIndex((h) => h.includes("member"));

  const teams: ParsedTeamCSV[] = [];
  const errors: string[] = [];

  for (let i = 1; i < lines.length; i++) {
    const rawLine = lines[i];
    // Simple CSV parser handling quotes
    const cells: string[] = [];
    let inQuote = false;
    let curr = "";
    for (let c = 0; c < rawLine.length; c++) {
      const char = rawLine[c];
      if (char === '"') {
        inQuote = !inQuote;
      } else if (char === "," && !inQuote) {
        cells.push(curr.trim().replace(/^"|"$/g, ""));
        curr = "";
      } else {
        curr += char;
      }
    }
    cells.push(curr.trim().replace(/^"|"$/g, ""));

    const teamCode = sanitizeString(cells[codeIdx >= 0 ? codeIdx : 0]);
    const teamName = sanitizeString(cells[nameIdx >= 0 ? nameIdx : 1]);
    const leaderName = sanitizeString(cells[leaderNameIdx >= 0 ? leaderNameIdx : 2]);
    const leaderEmail = sanitizeString(cells[leaderEmailIdx >= 0 ? leaderEmailIdx : 3]);
    const leaderPhone = phoneIdx >= 0 ? sanitizeString(cells[phoneIdx]) : undefined;
    const passkey = passkeyIdx >= 0 ? sanitizeString(cells[passkeyIdx]) : Math.random().toString(36).substring(2, 8).toUpperCase();
    const rawMembers = membersIdx >= 0 ? cells[membersIdx] : "";
    const members = rawMembers
      ? rawMembers.split(/[;|]/).map((m) => sanitizeString(m)).filter(Boolean)
      : [];

    if (!teamCode || !teamName) {
      errors.push(`Row ${i + 1}: Missing teamCode or teamName.`);
      continue;
    }

    teams.push({
      teamCode,
      teamName,
      leaderName: leaderName || "Leader",
      leaderEmail: leaderEmail || "",
      leaderPhone,
      members,
      passkey: passkey || "AI2026",
    });
  }

  return { teams, errors };
}
