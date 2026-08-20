import { NextResponse } from "next/server";
import { getGallerySections, saveGallerySections, GallerySection } from "@/lib/data";

export async function GET() {
  const sections = await getGallerySections();
  return NextResponse.json(sections);
}

export async function PUT(request: Request) {
  try {
    const sections = (await request.json()) as GallerySection[];
    if (!Array.isArray(sections)) {
      return NextResponse.json({ error: "Invalid gallery sections payload" }, { status: 400 });
    }
    await saveGallerySections(sections);
    return NextResponse.json({ success: true, sections });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
