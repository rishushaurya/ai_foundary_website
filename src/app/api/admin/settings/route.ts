import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getSettings, saveSettings, SiteSettings } from "@/lib/data";
import { logAdminAction } from "@/lib/audit-logger";

export async function GET() {
  const settings = await getSettings();
  return NextResponse.json(settings);
}

async function handleSaveSettings(request: Request) {
  try {
    const updated = (await request.json()) as Partial<SiteSettings>;
    const current = await getSettings();
    const merged: SiteSettings = {
      ...current,
      ...updated,
      visiblePages: {
        ...current.visiblePages,
        ...(updated.visiblePages || {}),
      },
      socialLinks: {
        ...current.socialLinks,
        ...(updated.socialLinks || {}),
      },
    };

    await saveSettings(merged);

    // Live on-demand cache revalidation
    try {
      revalidatePath("/");
      revalidatePath("/about");
      revalidatePath("/events");
      revalidatePath("/team");
      revalidatePath("/gallery");
      revalidatePath("/recruit");
    } catch {}

    // Security Audit Log
    const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";
    await logAdminAction({
      adminEmail: "admin@aifoundry.club",
      ip,
      action: "Updated Site Settings & Hero",
      details: `Hero: ${merged.heroTagline?.substring(0, 30)}...`,
      status: "success",
    });

    return NextResponse.json({ success: true, settings: merged });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  return handleSaveSettings(request);
}

export async function POST(request: Request) {
  return handleSaveSettings(request);
}
