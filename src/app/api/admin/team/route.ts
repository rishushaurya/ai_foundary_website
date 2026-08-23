import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getTeamMembers, saveTeamMembers, TeamMember } from "@/lib/data";
import { logAdminAction, getAdminEmailFromRequest } from "@/lib/audit-logger";

export async function GET() {
  const members = await getTeamMembers();
  return NextResponse.json(members);
}

export async function POST(request: Request) {
  try {
    const member = (await request.json()) as TeamMember;
    if (!member.name || !member.role) {
      return NextResponse.json({ error: "Name and role are mandatory" }, { status: 400 });
    }

    const members = await getTeamMembers();
    const newMember: TeamMember = {
      ...member,
      id: member.id || `team-${Date.now()}`,
      order: member.order ?? members.length + 1,
    };

    members.push(newMember);
    await saveTeamMembers(members);

    try {
      revalidatePath("/team");
      revalidatePath("/");
    } catch {}

    const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";
    const adminEmail = await getAdminEmailFromRequest(request);
    await logAdminAction({
      adminEmail,
      ip,
      action: "Added Team Member",
      target: newMember.name,
      details: `${newMember.role} (${newMember.category})`,
      status: "success",
    });

    return NextResponse.json({ success: true, member: newMember });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();

    if (Array.isArray(body)) {
      await saveTeamMembers(body);
      try {
        revalidatePath("/team");
        revalidatePath("/");
      } catch {}
      return NextResponse.json({ success: true, members: body });
    }

    const member = body as TeamMember;
    const members = await getTeamMembers();
    const index = members.findIndex((m) => m.id === member.id);

    if (index === -1) {
      return NextResponse.json({ error: "Team member not found" }, { status: 404 });
    }

    members[index] = { ...members[index], ...member };
    await saveTeamMembers(members);

    try {
      revalidatePath("/team");
      revalidatePath("/");
    } catch {}

    const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";
    const adminEmail = await getAdminEmailFromRequest(request);
    await logAdminAction({
      adminEmail,
      ip,
      action: "Updated Team Member",
      target: member.name,
      status: "success",
    });

    return NextResponse.json({ success: true, member: members[index] });
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

    const members = await getTeamMembers();
    const target = members.find((m) => m.id === id);
    const filtered = members.filter((e) => e.id !== id);
    await saveTeamMembers(filtered);

    try {
      revalidatePath("/team");
      revalidatePath("/");
    } catch {}

    const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";
    const adminEmail = await getAdminEmailFromRequest(request);
    await logAdminAction({
      adminEmail,
      ip,
      action: "Deleted Team Member",
      target: target?.name || id,
      status: "warning",
    });

    return NextResponse.json({ success: true, id });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
