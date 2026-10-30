import { NextResponse } from "next/server";
import { clientIp, invalidateAdminWhitelist, requireAdmin } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { getSettings, saveSettings, SiteSettings } from "@/lib/data";
import { logAdminAction, getAdminEmailFromRequest } from "@/lib/audit-logger";

export async function GET() {
  const gate = await requireAdmin();
  if (gate instanceof NextResponse) return gate;
  const settings = await getSettings();
  return NextResponse.json(settings);
}

async function handleSaveSettings(request: Request) {
  try {
    const updated = (await request.json()) as Partial<SiteSettings>;
    const current = await getSettings();
    const adminEmail = await getAdminEmailFromRequest(request);
    const rootAdmins = (current.rootAdminEmails || ["priyanshushaurya9431@gmail.com"]).map((e) => e.trim().toLowerCase());
    const isCallerRoot = rootAdmins.some((e) => e === adminEmail.toLowerCase());

    // Every settings page sends the roots back unchanged; only an email that isn't root yet is a promotion.
    const requestedRoots = Array.isArray(updated.rootAdminEmails)
      ? updated.rootAdminEmails.filter((e): e is string => typeof e === "string").map((e) => e.trim().toLowerCase())
      : [];
    const promotions = requestedRoots.filter((e) => e && !rootAdmins.includes(e));
    if (promotions.length > 0 && !isCallerRoot) {
      return NextResponse.json(
        { error: "Unauthorized: Only an existing Root Administrator can promote administrators to Root Admin." },
        { status: 403 }
      );
    }
    // Irreversible: Can only add to rootAdminEmails, never remove existing roots
    const normalizedRoots = Array.from(new Set([...rootAdmins, ...promotions]));

    // Ensure permanent root admin is always present in admin whitelist
    const rootAdmin = "priyanshushaurya9431@gmail.com";
    const rawEmails = (Array.isArray(updated.adminEmails) ? updated.adminEmails : current.adminEmails || []).filter(
      (e): e is string => typeof e === "string" && e.includes("@")
    );
    const normalizedEmails = Array.from(
      new Set([rootAdmin, ...normalizedRoots, ...rawEmails.map((e) => e.trim().toLowerCase())])
    );

    const merged: SiteSettings = {
      ...current,
      ...updated,
      adminEmails: normalizedEmails,
      rootAdminEmails: normalizedRoots,
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
    invalidateAdminWhitelist();

    // Live on-demand cache revalidation
    try {
      revalidatePath("/");
      revalidatePath("/about");
      revalidatePath("/events");
      revalidatePath("/team");
      revalidatePath("/gallery");
      revalidatePath("/recruit");
    } catch {}

    const ip = clientIp(request);

    // Detect Root Admin Promotions
    const currentRoots = (current.rootAdminEmails || []).map((e) => e.trim().toLowerCase());
    const newlyPromotedRoots = normalizedRoots.filter((e) => !currentRoots.includes(e));

    if (newlyPromotedRoots.length > 0) {
      await logAdminAction({
        adminEmail,
        ip,
        action: "Promoted to Root Administrator",
        target: newlyPromotedRoots.join(", "),
        details: `${adminEmail} permanently promoted: ${newlyPromotedRoots.join(", ")} to Root Administrator status`,
        status: "success",
      });
    }

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
  const gate = await requireAdmin();
  if (gate instanceof NextResponse) return gate;
  return handleSaveSettings(request);
}

export async function POST(request: Request) {
  const gate = await requireAdmin();
  if (gate instanceof NextResponse) return gate;
  return handleSaveSettings(request);
}
