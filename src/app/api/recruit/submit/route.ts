import { NextResponse } from "next/server";
import { addRecruitmentEntry, RecruitmentEntry } from "@/lib/data";
import { clientIp } from "@/lib/auth";
import { isValidEmail } from "@/lib/hackathon/validators";
import { randomUUID } from "crypto";
import { checkRateLimit } from "@/lib/rate-limiter";
import { logAdminAction } from "@/lib/audit-logger";

export async function POST(request: Request) {
  const ip = clientIp(request);

  try {
    const body = await request.json();
    const {
      name,
      email,
      phone,
      year,
      branch,
      preferredTeam,
      skills,
      portfolioUrl,
      whyJoin,
      botField,
    } = body;

    // 1. Silent Honeypot Trap (If bot fills the hidden field, return success without saving)
    if (botField && botField.trim() !== "") {
      return NextResponse.json({
        success: true,
        message: "Application processed successfully.",
      });
    }

    // 2. Smooth Sliding Window Rate Limiting (20 per applicant per minute, prevents campus Wi-Fi collisions)
    const rateKey = email ? `recruit-${email.trim().toLowerCase()}` : `recruit-${ip}`;
    const rateCheck = checkRateLimit(rateKey, 20, 60000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          error: `Too many submissions. Please wait ${rateCheck.retryAfterSeconds}s before retrying.`,
        },
        { status: 429 }
      );
    }

    // 3. Required Fields Validation
    if (!name || !email || !phone || !preferredTeam || !whyJoin) {
      return NextResponse.json(
        { error: "Name, Email, Phone, Preferred Wing, and Statement of Interest are required." },
        { status: 400 }
      );
    }

    // 4. Basic Email Format Check
    if (
      [name, email, phone, preferredTeam, whyJoin].some((v) => typeof v !== "string") ||
      !isValidEmail(email.trim()) ||
      whyJoin.length > 5000
    ) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    const newEntry: RecruitmentEntry = {
      id: `rec-${randomUUID()}`,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      year: String(year || "1st Year").slice(0, 50),
      branch: String(branch || "CSE").slice(0, 100),
      preferredTeam: preferredTeam.trim(),
      skills: String(skills || "").trim().slice(0, 2000),
      portfolioUrl: String(portfolioUrl || "").trim().slice(0, 500),
      whyJoin: whyJoin.trim(),
      timestamp: new Date().toISOString(),
      status: "pending",
    };

    await addRecruitmentEntry(newEntry);

    return NextResponse.json({
      success: true,
      message: "Application submitted successfully! Our executive board will review and reach out.",
      entry: newEntry,
    });
  } catch (err: any) {
    console.error("[recruit-api] Error:", err);
    return NextResponse.json(
      { error: "Failed to submit recruitment application. Please try again." },
      { status: 500 }
    );
  }
}
