import { NextResponse } from "next/server";
import { clientIp, requireAdmin } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { getGallerySections, saveGallerySections, GallerySection } from "@/lib/data";
import { logAdminAction, getAdminEmailFromRequest } from "@/lib/audit-logger";

export async function GET() {
  const gate = await requireAdmin();
  if (gate instanceof NextResponse) return gate;
  const sections = await getGallerySections();
  return NextResponse.json(sections);
}

async function handleSaveGallery(request: Request) {
  try {
    const sections = (await request.json()) as GallerySection[];
    if (!Array.isArray(sections)) {
      return NextResponse.json({ error: "Invalid gallery sections payload" }, { status: 400 });
    }
    await saveGallerySections(sections);

    try {
      revalidatePath("/gallery");
      revalidatePath("/");
    } catch {}

    const ip = clientIp(request);
    const adminEmail = await getAdminEmailFromRequest(request);
    await logAdminAction({
      adminEmail,
      ip,
      action: "Updated Gallery Albums & Direct Links",
      details: `Saved ${sections.length} albums with ${sections.reduce((acc, s) => acc + s.items.length, 0)} total media items`,
      status: "success",
    });

    return NextResponse.json({ success: true, sections });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const gate = await requireAdmin();
  if (gate instanceof NextResponse) return gate;
  return handleSaveGallery(request);
}

export async function POST(request: Request) {
  const gate = await requireAdmin();
  if (gate instanceof NextResponse) return gate;
  return handleSaveGallery(request);
}
