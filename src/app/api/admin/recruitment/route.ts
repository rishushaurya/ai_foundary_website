import { NextResponse } from "next/server";
import { getRecruitmentEntries, saveRecruitmentEntries } from "@/lib/data";

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

    entries[index].status = status;
    await saveRecruitmentEntries(entries);
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
    const filtered = entries.filter((e) => e.id !== id);
    await saveRecruitmentEntries(filtered);
    return NextResponse.json({ success: true, id });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
