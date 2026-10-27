import { NextResponse } from "next/server";
import { getPublicEvents, addEventRegistration, EventRegistration } from "@/lib/data";
import { checkRateLimit } from "@/lib/rate-limiter";
import { clientIp } from "@/lib/auth";
import { isValidEmail } from "@/lib/hackathon/validators";
import { randomUUID } from "crypto";

export async function POST(request: Request) {
  const ip = clientIp(request);

  try {
    const body = await request.json();
    const { eventId, name, email, phone, college, branch, customAnswers } = body;

    if ([name, email, phone].some((v) => typeof v !== "string") || (customAnswers && typeof customAnswers !== "object")) {
      return NextResponse.json({ error: "Invalid registration payload." }, { status: 400 });
    }

    // Smooth Rate limit per participant email (20 per minute, prevents venue Wi-Fi collisions)
    const rateKey = email ? `event-reg:${email.trim().toLowerCase()}` : `event-reg:${ip}`;
    const rateCheck = checkRateLimit(rateKey, 20, 60000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          error: `Too many registration attempts. Please retry in ${rateCheck.retryAfterSeconds} seconds.`,
        },
        { status: 429 }
      );
    }

    if (!eventId || !name || !email || !phone) {
      return NextResponse.json(
        { error: "Event ID, Full Name, Email, and Phone number are required." },
        { status: 400 }
      );
    }

    // Basic email format check
    if (!isValidEmail(email.trim()) || email.length > 200 || name.length > 200 || phone.length > 40) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    const targetEvent = (await getPublicEvents()).find((e) => e.id === eventId);
    if (!targetEvent) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Check if event registration is disabled or ended
    if (targetEvent.status === "ended" || targetEvent.isRegistrationOpen === false) {
      return NextResponse.json(
        { error: targetEvent.closedMessage || "Applications for this event are currently closed." },
        { status: 400 }
      );
    }

    // Check start date window
    if (targetEvent.registrationStartDate && new Date(targetEvent.registrationStartDate).getTime() > Date.now()) {
      return NextResponse.json(
        { error: "Applications for this event have not opened yet." },
        { status: 400 }
      );
    }

    // Check deadline
    if (targetEvent.registrationDeadline && new Date(targetEvent.registrationDeadline).getTime() < Date.now()) {
      return NextResponse.json(
        { error: "The application deadline for this event has passed." },
        { status: 400 }
      );
    }

    const newRegistration: EventRegistration = {
      id: `reg-${randomUUID()}`,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      college: String(college || "Dayananda Sagar University").trim().slice(0, 200),
      branch: String(branch || "CSE").trim().slice(0, 100),
      timestamp: new Date().toISOString(),
      customAnswers: Object.fromEntries(
        Object.entries(customAnswers || {}).map(([k, v]) => [k.slice(0, 100), String(v).slice(0, 2000)])
      ),
    };

    // Atomic duplicate check: one registration per email per event, even under simultaneous submits.
    if (!(await addEventRegistration(targetEvent.id, newRegistration))) {
      return NextResponse.json(
        { error: "This email address is already registered for this event." },
        { status: 409 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Registration confirmed! See you at AI Foundry.",
      registration: newRegistration,
    });
  } catch (err: any) {
    console.error("[register-api] Error:", err);
    return NextResponse.json(
      { error: "Failed to process registration. Please try again." },
      { status: 500 }
    );
  }
}
