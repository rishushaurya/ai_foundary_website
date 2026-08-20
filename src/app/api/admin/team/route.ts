import { NextResponse } from "next/server";
import { getTeamMembers, saveTeamMembers, TeamMember } from "@/lib/data";

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
    return NextResponse.json({ success: true, member: newMember });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();

    // Supports both full array update (reordering) or single member update
    if (Array.isArray(body)) {
      await saveTeamMembers(body);
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
    const filtered = members.filter((m) => m.id !== id);
    await saveTeamMembers(filtered);
    return NextResponse.json({ success: true, id });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
