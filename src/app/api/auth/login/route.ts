import { NextResponse } from "next/server";
import { SignJWT } from "jose";
import { getSettings } from "@/lib/data";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "ai-foundry-dev-jwt-secret-key-2026"
);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "A valid email address is required" }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    const settings = await getSettings();
    const allowedEmails = (settings.adminEmails || []).map((e) => e.trim().toLowerCase());

    const isAuthorized = allowedEmails.includes(cleanEmail);

    if (!isAuthorized) {
      return NextResponse.json(
        {
          error:
            "Access Denied: This Google email address is not in the approved administrator whitelist.",
        },
        { status: 403 }
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
  } catch (error: any) {
    console.error("[auth-login] Error:", error);
    return NextResponse.json(
      { error: "Authentication failed. Please try again." },
      { status: 500 }
    );
  }
}
