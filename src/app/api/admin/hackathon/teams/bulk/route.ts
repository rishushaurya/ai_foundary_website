import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import {
  getHackathonEventById,
  getHackathonTeams,
  saveHackathonTeamsBatch,
  logHackathonActivity,
} from "@/lib/hackathon/data";
import { hashSecret, generateSecretCode } from "@/lib/hackathon/validators";
import { analyzeTeamImport, normalizeGrid, parseDelimitedText, type TeamImportAnalysis } from "@/lib/hackathon/team-import";
import { HackathonTeam } from "@/lib/hackathon/constants";
import { getAdminEmailFromRequest } from "@/lib/audit-logger";
import { randomUUID } from "crypto";

// Hashing 600+ passkeys takes a few seconds on the thread pool.
export const maxDuration = 60;

/** The analysis sent back to the admin: never echoes the passkeys typed in the sheet. */
const forClient = (analysis: TeamImportAnalysis) => ({
  ...analysis,
  rows: analysis.rows.map(({ passkey, ...row }) => ({ ...row, passkeyProvided: !!passkey })),
});

/**
 * POST { eventId, rows: string[][] | csvContent: string, dryRun?, skipInvalid? }
 * dryRun returns the analysis only. Otherwise every row must be valid, or skipInvalid imports just
 * the valid ones. Teams get generated codes/passkeys where the sheet leaves them empty.
 */
export async function POST(request: Request) {
  const gate = await requireAdmin();
  if (gate instanceof NextResponse) return gate;
  try {
    const adminEmail = await getAdminEmailFromRequest(request);
    const body = await request.json();
    const { eventId, rows, csvContent, dryRun, skipInvalid } = body || {};

    if (!eventId || typeof eventId !== "string") {
      return NextResponse.json({ error: "eventId is required." }, { status: 400 });
    }
    if (!(await getHackathonEventById(eventId))) {
      return NextResponse.json({ error: "Event not found." }, { status: 404 });
    }

    const grid = typeof csvContent === "string" ? parseDelimitedText(csvContent) : normalizeGrid(rows);
    if (!grid) {
      return NextResponse.json({ error: "Send the sheet as rows (array of arrays) or csvContent (text)." }, { status: 400 });
    }

    const analysis = analyzeTeamImport(grid, await getHackathonTeams(eventId));
    if (analysis.fatal) {
      return NextResponse.json({ error: analysis.fatal, analysis: forClient(analysis) }, { status: 400 });
    }
    if (dryRun) {
      return NextResponse.json({ success: true, analysis: forClient(analysis) });
    }

    const { invalid, valid } = analysis.summary;
    if (invalid > 0 && !skipInvalid) {
      return NextResponse.json(
        { error: `${invalid} row(s) have problems. Fix them, or import only the ${valid} valid team(s).`, analysis: forClient(analysis) },
        { status: 400 }
      );
    }
    const toImport = analysis.rows.filter((r) => r.errors.length === 0);
    if (toImport.length === 0) {
      return NextResponse.json({ error: "No valid teams to import.", analysis: forClient(analysis) }, { status: 400 });
    }

    const now = new Date().toISOString();
    const readyTeams: HackathonTeam[] = await Promise.all(
      toImport.map(async (r) => {
        const passkey = r.passkey || generateSecretCode();
        return {
          id: `team-${randomUUID()}`,
          eventId,
          teamCode: r.teamCode,
          teamName: r.teamName,
          leaderName: r.leaderName || undefined,
          leaderEmail: r.leaderEmail || undefined,
          leaderPhone: r.leaderPhone || undefined,
          members: r.members,
          verificationCodeHash: await hashSecret(passkey),
          passkey,
          isEliminated: false,
          finalist: false,
          disqualified: false,
          createdAt: now,
        };
      })
    );

    // Re-checks codes against the stored teams, so a concurrent import can't create duplicates.
    const res = await saveHackathonTeamsBatch(readyTeams);
    if (!res.ok) {
      return NextResponse.json({ error: res.error || "Batch insertion failed." }, { status: 409 });
    }

    await logHackathonActivity({
      eventId,
      action: "Bulk Teams Uploaded",
      actorType: "admin",
      actorId: adminEmail,
      details: {
        count: readyTeams.length,
        skippedRows: invalid,
        generatedCodes: analysis.summary.generatedCodes,
        generatedPasskeys: analysis.summary.generatedPasskeys,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Imported ${readyTeams.length} team(s)${invalid ? `, skipped ${invalid} row(s) with problems` : ""}.`,
      count: readyTeams.length,
      skipped: invalid,
      analysis: forClient(analysis),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Bulk teams upload failed." }, { status: 500 });
  }
}
