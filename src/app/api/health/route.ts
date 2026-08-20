import { NextResponse } from "next/server";
import { getSettings } from "@/lib/data";

export async function GET() {
  try {
    const settings = await getSettings();
    return NextResponse.json({
      status: "healthy",
      version: "1.0.0",
      timestamp: new Date().toISOString(),
      service: "AI Foundry (RAISE AI CLUB) Web Platform",
      checks: {
        database: "ok",
        siteTitle: settings.siteTitle,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { status: "degraded", error: err.message },
      { status: 500 }
    );
  }
}
