import { NextResponse } from "next/server";
import { getSettings, saveSettings, SiteSettings } from "@/lib/data";

export async function GET() {
  const settings = await getSettings();
  return NextResponse.json(settings);
}

export async function PUT(request: Request) {
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
    return NextResponse.json({ success: true, settings: merged });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
