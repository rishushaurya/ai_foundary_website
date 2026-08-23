import { NextResponse } from "next/server";
import { getSettings } from "@/lib/data";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const settings = await getSettings();
    return NextResponse.json({
      siteTitle: settings.siteTitle,
      visiblePages: settings.visiblePages,
      socialLinks: settings.socialLinks,
      heroTagline: settings.heroTagline,
      heroSubtext: settings.heroSubtext,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        visiblePages: {
          about: true,
          events: true,
          team: true,
          gallery: true,
          recruit: true,
        },
        socialLinks: {},
      },
      { status: 200 }
    );
  }
}
