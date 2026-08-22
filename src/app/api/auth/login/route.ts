import { NextResponse } from "next/server";
import { SignJWT } from "jose";
import { getSettings } from "@/lib/data";
import { logAdminAction } from "@/lib/audit-logger";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "ai-foundry-dev-jwt-secret-key-2026"
);

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";

  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "A valid email address is required" }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    const settings = await getSettings();
    const allowedEmails = (settings.adminEmails || []).map((e) => e.trim().toLowerCase());

    const isEmailWhitelisted = allowedEmails.includes(cleanEmail);

    if (!isEmailWhitelisted) {
      await logAdminAction({
        adminEmail: cleanEmail,
        ip,
        action: "Unauthorized Admin Login Attempt",
        details: "Email not present in approved administrator whitelist",
        status: "error",
      });

      return NextResponse.json(
        {
          error: "Access Denied: Email address is not in the approved administrator whitelist.",
        },
        { status: 403 }
      );
    }

    // Verify Password / Passkey
    const validPassword = settings.adminPassword || process.env.ADMIN_PASSWORD || "admin";
    if (!password || password !== validPassword) {
      await logAdminAction({
        adminEmail: cleanEmail,
        ip,
        action: "Invalid Admin Password Attempt",
        details: "Incorrect administrator passkey supplied",
        status: "error",
      });

      return NextResponse.json(
        {
          error: "Authentication Failed: Incorrect administrator password / security key.",
        },
        { status: 401 }
      );
    }

    // Generate signed JWT session valid for 7 days
    const token = await new SignJWT({
      email: cleanEmail,
      role: "admin",
      issuedAt: Date.now(),
    })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("7d")
      .sign(JWT_SECRET);

    await logAdminAction({
      adminEmail: cleanEmail,
      ip,
      action: "Admin Login Successful",
      details: "JWT session generated with passkey verification (7 days)",
      status: "success",
    });

    const response = NextResponse.json({
      success: true,
      message: "Authentication successful",
      user: { email: cleanEmail, role: "admin" },
    });

    response.cookies.set({
      name: "admin-token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Login failed" }, { status: 500 });
  }
}
