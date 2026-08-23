import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getGallerySections, saveGallerySections, GallerySection } from "@/lib/data";
import { logAdminAction, getAdminEmailFromRequest } from "@/lib/audit-logger";

export async function GET() {
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

    const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";
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
  return handleSaveGallery(request);
}

export async function POST(request: Request) {
  return handleSaveGallery(request);
}
