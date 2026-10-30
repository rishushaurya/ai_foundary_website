import { NextResponse } from "next/server";
import { SignJWT } from "jose";
import { getSettings } from "@/lib/data";
import { logAdminAction } from "@/lib/audit-logger";
import { clientIp, getJwtSecret } from "@/lib/auth";
import { checkSharedRateLimit } from "@/lib/rate-limiter";

const GOOGLE_ISSUERS = new Set(["accounts.google.com", "https://accounts.google.com"]);

export async function POST(request: Request) {
  const ip = clientIp(request);

  const rate = await checkSharedRateLimit(`google-login-${ip}`, 20, 60_000);
  if (!rate.allowed) {
    return NextResponse.json(
      { error: `Too many sign-in attempts. Try again in ${rate.retryAfterSeconds}s.` },
      { status: 429 }
    );
  }

  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON request payload." }, { status: 400 });
  }

  const { credential } = body || {};

  if (!credential || typeof credential !== "string") {
    return NextResponse.json(
      { error: "Google authentication token (credential) is required." },
      { status: 400 }
    );
  }

  try {
    // 1. Cryptographically verify Google ID Token with Google's official OAuth2 endpoint
    const googleVerifyRes = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`
    );

    if (!googleVerifyRes.ok) {
      const errorData = await googleVerifyRes.json().catch(() => ({}));
      await logAdminAction({
        adminEmail: "unknown",
        ip,
        action: "Google Auth Verification Failed",
        details: errorData.error_description || "Google rejected the token signature",
        status: "error",
      });

      return NextResponse.json(
        { error: "Google verification failed: Invalid or expired Google ID token." },
        { status: 401 }
      );
    }

    const googlePayload = await googleVerifyRes.json();
    const { email, email_verified, name, sub: googleId, aud, iss } = googlePayload;

    // 2. Ensure the email is verified by Google
    if (!email || (email_verified !== "true" && email_verified !== true)) {
      return NextResponse.json(
        { error: "Google account email is not verified." },
        { status: 403 }
      );
    }

    // 3. The token must have been issued by Google FOR THIS APP. Without this check, an ID token
    //    the admin handed to any other Google-login site could be replayed here.
    const expectedClientId = (
      process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
      process.env.GOOGLE_CLIENT_ID ||
      ""
    ).trim();

    if (!expectedClientId) {
      return NextResponse.json(
        { error: "Google sign-in is not configured on the server (NEXT_PUBLIC_GOOGLE_CLIENT_ID)." },
        { status: 503 }
      );
    }
    if (typeof aud !== "string" || aud.trim() !== expectedClientId || !GOOGLE_ISSUERS.has(iss)) {
      console.warn(`[auth/google] Rejected token: aud='${aud}', iss='${iss}'`);
      return NextResponse.json(
        { error: "Google token was not issued for this application." },
        { status: 403 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const settings = await getSettings();
    const allowedEmails = [...(settings.adminEmails || []), ...(settings.rootAdminEmails || [])].map((e) =>
      e.trim().toLowerCase()
    );

    const isWhitelisted = allowedEmails.includes(cleanEmail);

    if (!isWhitelisted) {
      await logAdminAction({
        adminEmail: cleanEmail,
        ip,
        action: "Unauthorized Google Login Attempt",
        details: `Google ID: ${googleId} - Email '${cleanEmail}' is not in the administrator whitelist`,
        status: "error",
      });

      return NextResponse.json(
        {
          error: `Access Denied: Google account (${cleanEmail}) is not in the approved administrator whitelist. Contact the club president to authorize your Google email.`,
        },
        { status: 403 }
      );
    }

    // 4. Generate signed JWT session valid for 7 days
    const token = await new SignJWT({
      email: cleanEmail,
      name: name || cleanEmail,
      googleId,
      role: "admin",
      authProvider: "google",
      issuedAt: Date.now(),
    })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("7d")
      .sign(getJwtSecret());

    await logAdminAction({
      adminEmail: cleanEmail,
      ip,
      action: "Google Admin Login Successful",
      details: `Authenticated via Google OAuth (Name: ${name || "N/A"})`,
      status: "success",
    });

    const response = NextResponse.json({
      success: true,
      message: "Google authentication verified successfully",
      user: { email: cleanEmail, name, role: "admin" },
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
    return NextResponse.json(
      { error: err.message || "Failed to process Google authentication." },
      { status: 500 }
    );
  }
}
