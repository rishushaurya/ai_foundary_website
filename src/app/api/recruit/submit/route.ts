import { NextResponse } from "next/server";
import { getRecruitmentEntries, saveRecruitmentEntries, RecruitmentEntry } from "@/lib/data";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, year, branch, preferredTeam, skills, portfolioUrl, whyJoin } = body;

    if (!name || !email || !phone || !preferredTeam || !whyJoin) {
      return NextResponse.json(
        { error: "Name, Email, Phone, Preferred Wing, and Statement of Interest are required." },
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
      { error: "Failed to submit recruitment application." },
      { status: 500 }
    );
  }
}
