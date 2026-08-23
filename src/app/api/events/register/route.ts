import { NextResponse } from "next/server";
import { getEvents, saveEvents, EventRegistration } from "@/lib/data";
import { checkRateLimit } from "@/lib/rate-limiter";

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";

  // Rate limit: 5 event registrations per IP per 10 minutes
  const rateCheck = checkRateLimit(`event-reg:${ip}`, 5, 600000);
  if (!rateCheck.allowed) {
    return NextResponse.json(
      {
        error: `Rate limit exceeded: Too many registrations from this network. Please retry in ${rateCheck.retryAfterSeconds} seconds.`,
      },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const { eventId, name, email, phone, college, branch, customAnswers } = body;

    if (!eventId || !name || !email || !phone) {
      return NextResponse.json(
        { error: "Event ID, Full Name, Email, and Phone number are required." },
        { status: 400 }
      );
    }

    // Basic email format check
    if (!email.includes("@") || !email.includes(".")) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    const events = await getEvents();
    const eventIndex = events.findIndex((e) => e.id === eventId);

    if (eventIndex === -1) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const targetEvent = events[eventIndex];

    // Check if event is closed
    if (targetEvent.status === "ended") {
      return NextResponse.json(
        { error: "Registrations for this event have closed." },
        { status: 400 }
      );
    }

    const existingRegistrations = targetEvent.registrations || [];

    // Duplicate registration check
    const isDuplicate = existingRegistrations.some(
      (r) => r.email.toLowerCase() === email.trim().toLowerCase()
    );

    if (isDuplicate) {
      return NextResponse.json(
        { error: "This email address is already registered for this event." },
        { status: 409 }
      );
    }

    const newRegistration: EventRegistration = {
      id: `reg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      college: (college || "Dayananda Sagar University").trim(),
      branch: (branch || "CSE").trim(),
      timestamp: new Date().toISOString(),
      customAnswers: customAnswers || {},
    };

    existingRegistrations.push(newRegistration);
    events[eventIndex].registrations = existingRegistrations;

    await saveEvents(events);

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
