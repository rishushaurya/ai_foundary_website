import { NextResponse } from "next/server";
import {
  getHackathonJudges,
  getHackathonJudgeById,
  saveHackathonJudge,
  deleteHackathonJudge,
  logHackathonActivity,
} from "@/lib/hackathon/data";
import { sanitizeString, hashSecret, isValidEmail } from "@/lib/hackathon/validators";
import { HackathonJudge } from "@/lib/hackathon/constants";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const eventId = searchParams.get("eventId") || undefined;
  const judges = await getHackathonJudges(eventId);

  const safe = judges.map((j) => ({
    id: j.id,
    eventId: j.eventId,
    name: j.name,
    email: j.email,
    accessCode: j.accessCode || undefined, // Revealed only in admin panel via eye toggle
    active: j.active,
    assignedRoundIds: j.assignedRoundIds,
    createdAt: j.createdAt,
  }));

  return NextResponse.json({ judges: safe });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, eventId, name, email, accessCode, active, assignedRoundIds } = body;

    if (!eventId || !name || !email) {
      return NextResponse.json({ error: "eventId, name, and email are required." }, { status: 400 });
    }

    if (!isValidEmail(email)) {
      return NextResponse.json({ error: "Invalid email format." }, { status: 400 });
    }

    const judgeId = id || `judge-${eventId}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const existing = await getHackathonJudgeById(judgeId);

    let accessCodeHash = existing?.accessCodeHash || "";
    let effectiveCode: string | undefined = existing?.accessCode;

    if (accessCode && typeof accessCode === "string" && accessCode.trim().length > 0) {
      effectiveCode = accessCode.trim();
      accessCodeHash = await hashSecret(effectiveCode);
    } else if (!existing) {
      // Generate a 6-character clean code if none provided
      effectiveCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      accessCodeHash = await hashSecret(effectiveCode);
    }

    const judge: HackathonJudge = {
      id: judgeId,
      eventId,
      name: sanitizeString(name),
      email: sanitizeString(email).toLowerCase(),
      accessCodeHash,
      accessCode: effectiveCode,
      active: typeof active === "boolean" ? active : true,
      assignedRoundIds: Array.isArray(assignedRoundIds) ? assignedRoundIds : undefined,
      createdAt: existing?.createdAt || new Date().toISOString(),
    };

    const res = await saveHackathonJudge(judge);
    if (!res.ok) {
      return NextResponse.json({ error: res.error || "Failed to save judge." }, { status: 400 });
    }

    await logHackathonActivity({
      eventId,
      action: existing ? "Judge Updated" : "Judge Created",
      actorType: "admin",
      actorId: "admin",
      details: { name: judge.name, email: judge.email },
    });

    return NextResponse.json({
      success: true,
      judge: {
        id: judge.id,
        name: judge.name,
        email: judge.email,
        active: judge.active,
      },
      generatedAccessCode: effectiveCode,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to process judge." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Judge id is required." }, { status: 400 });
  }

  const existing = await getHackathonJudgeById(id);
  const ok = await deleteHackathonJudge(id);
  if (!ok) {
    return NextResponse.json({ error: "Failed to delete judge." }, { status: 500 });
  }

  if (existing) {
    await logHackathonActivity({
      eventId: existing.eventId,
      action: "Judge Deleted",
      actorType: "admin",
      actorId: "admin",
      details: { id, email: existing.email },
    });
  }

  return NextResponse.json({ success: true, message: "Judge removed." });
}
