import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getAdminSessionFromToken } from "@/lib/auth";

export async function GET() {
  const cookieStore = await cookies();
  const admin = await getAdminSessionFromToken(cookieStore.get("admin-token")?.value);
  if (!admin) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  return NextResponse.json({
    authenticated: true,
    user: {
      email: admin.email,
      role: "admin",
      isRoot: admin.isRoot,
    },
  });
}
