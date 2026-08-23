import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    {
      error: "Master Passkey login is permanently disabled. Please authenticate via Google Identity Services.",
    },
    { status: 403 }
  );
}
