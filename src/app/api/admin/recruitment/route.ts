import { NextResponse } from "next/server";
import { clientIp, requireAdmin } from "@/lib/auth";
import {
  getRecruitmentEntries,
  updateRecruitmentStatus,
  deleteRecruitmentEntry,
  RECRUITMENT_STATUSES,
} from "@/lib/data";
import { logAdminAction, getAdminEmailFromRequest } from "@/lib/audit-logger";

export async function GET() {
  const gate = await requireAdmin();
  if (gate instanceof NextResponse) return gate;
  const entries = await getRecruitmentEntries();
  return NextResponse.json(entries);
}

export async function PUT(request: Request) {
  const gate = await requireAdmin();
  if (gate instanceof NextResponse) return gate;
  try {
    const { id, status } = await request.json();
    if (!id || !status) {
      return NextResponse.json({ error: "ID and status are required" }, { status: 400 });
    }

    if (!RECRUITMENT_STATUSES.includes(status)) {
      return NextResponse.json({ error: `status must be one of: ${RECRUITMENT_STATUSES.join(", ")}` }, { status: 400 });
    }

    const applicant = await updateRecruitmentStatus(id, status);
    if (!applicant) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    const ip = clientIp(request);
    const adminEmail = await getAdminEmailFromRequest(request);
    await logAdminAction({
      adminEmail,
      ip,
      action: "Updated Applicant Status",
      target: `${applicant.name} (${applicant.email})`,
      details: `Status set to '${status}' for ${applicant.preferredTeam}`,
      status: "success",
    });

    return NextResponse.json({ success: true, entry: applicant });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const gate = await requireAdmin();
  if (gate instanceof NextResponse) return gate;
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID query parameter required" }, { status: 400 });
    }

    const target = await deleteRecruitmentEntry(id);

    const ip = clientIp(request);
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
