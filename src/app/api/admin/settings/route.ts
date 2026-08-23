import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getSettings, saveSettings, SiteSettings } from "@/lib/data";
import { logAdminAction, getAdminEmailFromRequest } from "@/lib/audit-logger";

export async function GET() {
  const settings = await getSettings();
  return NextResponse.json(settings);
}

async function handleSaveSettings(request: Request) {
  try {
    const updated = (await request.json()) as Partial<SiteSettings>;
    const current = await getSettings();
    // Ensure permanent root admin is always present in admin whitelist
    const rootAdmin = "priyanshushaurya9431@gmail.com";
    const rawEmails = updated.adminEmails || current.adminEmails || [];
    const normalizedEmails = Array.from(
      new Set([rootAdmin, ...rawEmails.map((e) => e.trim().toLowerCase())])
    );

    const merged: SiteSettings = {
      ...current,
      ...updated,
      adminEmails: normalizedEmails,
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
    const adminEmail = await getAdminEmailFromRequest(request);
    await logAdminAction({
      adminEmail,
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
