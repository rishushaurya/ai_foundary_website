import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getAdminSessionFromToken, verifyRoleToken } from "@/lib/auth";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

function originHost(origin: string): string | null {
  try {
    return new URL(origin).host; // "null" (sandboxed frames) throws -> treated as cross-site
  } catch {
    return null;
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isApi = pathname.startsWith("/api/");

  // CSRF defence in depth: state-changing API calls must come from this site.
  if (isApi && !SAFE_METHODS.has(request.method)) {
    const origin = request.headers.get("origin");
    if (origin && originHost(origin) !== request.headers.get("host")) {
      return NextResponse.json({ error: "Cross-site request blocked." }, { status: 403 });
    }
  }

  // Protect /admin routes (except /admin/login) and ALL /api/admin routes
  if (
    (pathname.startsWith("/admin") && pathname !== "/admin/login") ||
    pathname.startsWith("/api/admin")
  ) {
    const admin = await getAdminSessionFromToken(request.cookies.get("admin-token")?.value);
    if (admin) return NextResponse.next();

    if (isApi) {
      return NextResponse.json(
        { error: "Unauthorized access: Administrator session required" },
        { status: 401 }
      );
    }
    const response = NextResponse.redirect(new URL("/admin/login", request.url));
    response.cookies.set("admin-token", "", { maxAge: 0, path: "/" });
    return response;
  }

  // Protect /judge routes (except /judge/login)
  if (pathname.startsWith("/judge") && pathname !== "/judge/login") {
    const judge = await verifyRoleToken(request.cookies.get("judge-session")?.value, "judge");
    if (judge) return NextResponse.next();

    const response = NextResponse.redirect(new URL("/judge/login", request.url));
    response.cookies.set("judge-session", "", { maxAge: 0, path: "/" });
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin",
    "/admin/:path*",
    "/api/admin",
    "/api/admin/:path*",
    "/judge",
    "/judge/:path*",
    "/api/judge/:path*",
    "/api/auth/:path*",
    "/api/leaderboard/vote",
    "/api/leaderboard/verify-team",
  ],
};
