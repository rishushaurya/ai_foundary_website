import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getContent, saveContent, ContentSection } from "@/lib/data";
import { logAdminAction, getAdminEmailFromRequest } from "@/lib/audit-logger";

export async function GET() {
  const content = await getContent();
  return NextResponse.json(content);
}

async function handleSaveContent(request: Request) {
  try {
    const updated = (await request.json()) as ContentSection[];
    if (!Array.isArray(updated)) {
      return NextResponse.json({ error: "Invalid content array payload" }, { status: 400 });
    }
    const success = await saveContent(updated);
    if (!success) {
      return NextResponse.json({ error: "Failed to persist content" }, { status: 500 });
    }

    // Live on-demand cache revalidation
    try {
      revalidatePath("/");
      revalidatePath("/about");
    } catch {}

    // Security Audit Log
    const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";
    const adminEmail = await getAdminEmailFromRequest(request);
    await logAdminAction({
      adminEmail,
      ip,
      action: "Updated Landing & About Content",
      details: `Saved ${updated.length} content sections`,
      status: "success",
    });

    return NextResponse.json({ success: true, content: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  return handleSaveContent(request);
}

export async function POST(request: Request) {
  return handleSaveContent(request);
}
