import { NextResponse } from "next/server";
import { getRecruitmentEntries, saveRecruitmentEntries } from "@/lib/data";
import { logAdminAction, getAdminEmailFromRequest } from "@/lib/audit-logger";

export async function GET() {
  const entries = await getRecruitmentEntries();
  return NextResponse.json(entries);
}

export async function PUT(request: Request) {
  try {
    const { id, status } = await request.json();
    if (!id || !status) {
      return NextResponse.json({ error: "ID and status are required" }, { status: 400 });
    }

    const entries = await getRecruitmentEntries();
    const index = entries.findIndex((e) => e.id === id);
    if (index === -1) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    const applicant = entries[index];
    entries[index].status = status;
    await saveRecruitmentEntries(entries);

    const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";
    const adminEmail = await getAdminEmailFromRequest(request);
    await logAdminAction({
      adminEmail,
      ip,
      action: "Updated Applicant Status",
      target: `${applicant.name} (${applicant.email})`,
      details: `Status set to '${status}' for ${applicant.preferredTeam}`,
      status: "success",
    });

    return NextResponse.json({ success: true, entry: entries[index] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID query parameter required" }, { status: 400 });
    }

    const entries = await getRecruitmentEntries();
    const target = entries.find((e) => e.id === id);
    const filtered = entries.filter((e) => e.id !== id);
    await saveRecruitmentEntries(filtered);

    const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";
    const adminEmail = await getAdminEmailFromRequest(request);
    await logAdminAction({
      adminEmail,
      ip,
      action: "Deleted Recruitment Application",
      target: target ? `${target.name} (${target.email})` : id,
      status: "warning",
    });

    return NextResponse.json({ success: true, id });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
