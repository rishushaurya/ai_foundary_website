import { NextResponse } from "next/server";
import {
  getContent,
  getPublicEvents,
  getTeamMembers,
  getSettings,
  getGallerySections,
} from "@/lib/data";

export async function GET() {
  try {
    const [content, events, team, settings, gallery] = await Promise.all([
      getContent(),
      getPublicEvents(),
      getTeamMembers(),
      getSettings(),
      getGallerySections(),
    ]);

    const { adminEmails: _admins, rootAdminEmails: _roots, ...safeSettings } = settings;

    return NextResponse.json({
      content,
      events,
      team,
      settings: safeSettings,
      gallery,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
