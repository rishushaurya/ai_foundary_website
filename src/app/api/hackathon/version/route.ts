import { NextResponse } from "next/server";
import { syncHackathonVersion } from "@/lib/hackathon/data";

// Tiny change counter every live screen polls. It moves on every hackathon write, so clients only
// refetch real data when something actually changed. The CDN absorbs viewer load (1s cache).
export async function GET() {
  const version = await syncHackathonVersion();
  return NextResponse.json(
    { version },
    { headers: { "Cache-Control": "public, s-maxage=1, stale-while-revalidate=1" } }
  );
}
