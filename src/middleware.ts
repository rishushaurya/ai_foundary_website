import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "ai-foundry-dev-jwt-secret-key-2026"
);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect /admin routes (except /admin/login) and ALL /api/admin routes
  if (
    (pathname.startsWith("/admin") && pathname !== "/admin/login") ||
    pathname.startsWith("/api/admin")
  ) {
    const token = request.cookies.get("admin-token")?.value;

    if (!token) {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json(
          { error: "Unauthorized access: Administrator session required" },
          { status: 401 }
        );
      }
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    try {
      await jwtVerify(token, JWT_SECRET);
      return NextResponse.next();
    } catch {
      // Token invalid or expired
      if (pathname.startsWith("/api/")) {
        return NextResponse.json(
          { error: "Unauthorized access: Session expired or invalid" },
          { status: 401 }
        );
      }
      const response = NextResponse.redirect(new URL("/admin/login", request.url));
      response.cookies.set("admin-token", "", { maxAge: 0, path: "/" });
      return response;
    }
  }

  // Protect /judge routes (except /judge/login)
  if (pathname.startsWith("/judge") && pathname !== "/judge/login") {
    const judgeToken = request.cookies.get("judge-session")?.value;
    if (!judgeToken) {
      return NextResponse.redirect(new URL("/judge/login", request.url));
    }
    try {
      const { payload } = await jwtVerify(judgeToken, JWT_SECRET);
      if (payload.role !== "judge") {
        throw new Error("Invalid role");
      }
      return NextResponse.next();
    } catch {
      const response = NextResponse.redirect(new URL("/judge/login", request.url));
      response.cookies.set("judge-session", "", { maxAge: 0, path: "/" });
      return response;
    }
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
  ],
};
