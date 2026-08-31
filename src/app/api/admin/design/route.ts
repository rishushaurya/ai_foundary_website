import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { getSettings, saveSettings } from "@/lib/data";
import { getAllDesigns, getDesign, isDesignAvailable } from "@/designs/registry";
import { logAdminAction } from "@/lib/audit-logger";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "dsu-ai-foundry-secure-jwt-key-2026"
);

async function verifyAdminAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin-token")?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as { email: string; role: string };
  } catch {
    return null;
  }
}

// GET /api/admin/design - List all available designs and active design status
export async function GET() {
  const admin = await verifyAdminAuth();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
  }

  const settings = await getSettings();
  const activeDesignId = settings.activeDesign || "ivory-light";
  const allDesigns = getAllDesigns();

  return NextResponse.json({
    activeDesign: activeDesignId,
    activeDesignMeta: getDesign(activeDesignId).meta,
    designs: allDesigns.map((d) => ({
      ...d,
      isActive: d.id === activeDesignId,
    })),
  });
}

// PUT /api/admin/design - Update active design
export async function PUT(req: NextRequest) {
  const admin = await verifyAdminAuth();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { activeDesign } = body;

    if (!activeDesign || typeof activeDesign !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid 'activeDesign' field." },
        { status: 400 }
      );
    }

    if (!isDesignAvailable(activeDesign)) {
      return NextResponse.json(
        { error: `Requested design '${activeDesign}' is not registered in the system.` },
        { status: 400 }
      );
    }

    const settings = await getSettings();
    const oldDesign = settings.activeDesign || "ivory-light";

    settings.activeDesign = activeDesign;
    const ok = await saveSettings(settings);

    if (!ok) {
      return NextResponse.json(
        { error: "Failed to persist active design to database." },
        { status: 500 }
      );
    }

    // Record audit event
    try {
      await logAdminAction({
        adminEmail: admin.email || "admin",
        action: "Switched Website UI Design",
        target: "Site Settings",
        details: `Live visual theme changed from '${oldDesign}' to '${activeDesign}'`,
        status: "success",
      });
    } catch {
      // Non-blocking
    }

    return NextResponse.json({
      success: true,
      message: `Active design successfully switched to '${getDesign(activeDesign).meta.name}'.`,
      activeDesign,
      meta: getDesign(activeDesign).meta,
    });
  } catch (err: any) {
    console.error("[api/admin/design] Error:", err);
    return NextResponse.json(
      { error: "Failed to update design: " + err.message },
      { status: 500 }
    );
  }
}
