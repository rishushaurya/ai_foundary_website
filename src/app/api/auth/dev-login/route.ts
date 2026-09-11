import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { error: "Endpoint disabled. Administrator access requires verified Google OAuth." },
    { status: 404 }
  );
}

export async function GET() {
  return NextResponse.json(
    { error: "Endpoint disabled. Administrator access requires verified Google OAuth." },
    { status: 404 }
  );
}
