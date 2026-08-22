import { NextResponse } from "next/server";
import { getRecruitmentEntries, saveRecruitmentEntries, getSettings, RecruitmentEntry } from "@/lib/data";
import { checkRateLimit } from "@/lib/rate-limiter";
import { logAdminAction } from "@/lib/audit-logger";

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";

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

    // 2. Sliding Window IP Rate Limiting (5 per IP per 10 mins)
    const rateCheck = checkRateLimit(ip, 5, 600000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          error: `Rate limit exceeded: Too many applications from your network. Please retry in ${rateCheck.retryAfterSeconds} seconds.`,
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
    if (!email.includes("@") || !email.includes(".")) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    const entries = await getRecruitmentEntries();
    const newEntry: RecruitmentEntry = {
      id: `rec-${Date.now()}`,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      year: year || "1st Year",
      branch: branch || "CSE",
      preferredTeam: preferredTeam.trim(),
      skills: (skills || "").trim(),
      portfolioUrl: (portfolioUrl || "").trim(),
      whyJoin: whyJoin.trim(),
      timestamp: new Date().toISOString(),
      status: "pending",
    };

    entries.push(newEntry);
    await saveRecruitmentEntries(entries);

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
