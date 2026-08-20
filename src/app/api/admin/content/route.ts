import { NextResponse } from "next/server";
import { getContent, saveContent, ContentSection } from "@/lib/data";

export async function GET() {
  const content = await getContent();
  return NextResponse.json(content);
}

export async function PUT(request: Request) {
  try {
    const updated = (await request.json()) as ContentSection[];
    if (!Array.isArray(updated)) {
      return NextResponse.json({ error: "Invalid content array payload" }, { status: 400 });
    }
    const success = await saveContent(updated);
    if (!success) {
      return NextResponse.json({ error: "Failed to persist content" }, { status: 500 });
    }
    return NextResponse.json({ success: true, content: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
