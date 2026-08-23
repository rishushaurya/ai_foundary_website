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

    const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";
    const adminEmail = await getAdminEmailFromRequest(request);

    // Detect Whitelist Additions & Removals for Security Audit Trail
    const currentEmails = (current.adminEmails || []).map((e) => e.trim().toLowerCase());
    const addedEmails = normalizedEmails.filter((e) => !currentEmails.includes(e));
    const removedEmails = currentEmails.filter((e) => !normalizedEmails.includes(e));

    if (addedEmails.length > 0) {
      await logAdminAction({
        adminEmail,
        ip,
        action: "Authorized Admin Whitelist",
        target: addedEmails.join(", "),
        details: `Granted full administrative Google access to: ${addedEmails.join(", ")}`,
        status: "success",
      });
    }

    if (removedEmails.length > 0) {
      await logAdminAction({
        adminEmail,
        ip,
        action: "Revoked Admin Whitelist",
        target: removedEmails.join(", "),
        details: `Revoked administrative access from: ${removedEmails.join(", ")}`,
        status: "warning",
      });
    }

    if (addedEmails.length === 0 && removedEmails.length === 0) {
      await logAdminAction({
        adminEmail,
        ip,
        action: "Updated Global Site Settings",
        details: `Branding: ${merged.siteTitle} | Tagline: ${merged.heroTagline?.substring(0, 30)}...`,
        status: "success",
      });
    }

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
