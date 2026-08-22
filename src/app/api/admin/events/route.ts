import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getEvents, saveEvents, EventData } from "@/lib/data";
import { logAdminAction } from "@/lib/audit-logger";

export async function GET() {
  const events = await getEvents();
  return NextResponse.json(events);
}

export async function POST(request: Request) {
  try {
    const event = (await request.json()) as EventData;
    if (!event.title || !event.date) {
      return NextResponse.json({ error: "Title and Date are mandatory" }, { status: 400 });
    }

    const events = await getEvents();
    const newEvent: EventData = {
      ...event,
      id: event.id || `evt-${Date.now()}`,
      status: event.status || "upcoming",
      registrationMode: event.registrationMode || "builtin",
      showOnHome: event.showOnHome ?? true,
      showOnEventPage: event.showOnEventPage ?? true,
      registrations: event.registrations || [],
    };

    events.push(newEvent);
    await saveEvents(events);

    try {
      revalidatePath("/events");
      revalidatePath("/");
    } catch {}

    const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";
    await logAdminAction({
      adminEmail: "admin@aifoundry.club",
      ip,
      action: "Created New Event",
      target: newEvent.title,
      status: "success",
    });

    return NextResponse.json({ success: true, event: newEvent });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();

    if (Array.isArray(body)) {
      await saveEvents(body);
      try {
        revalidatePath("/events");
        revalidatePath("/");
      } catch {}
      return NextResponse.json({ success: true, events: body });
    }

    const event = body as EventData;
    const events = await getEvents();
    const index = events.findIndex((e) => e.id === event.id);

    if (index === -1) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const existingRegs = events[index].registrations || [];
    events[index] = {
      ...events[index],
      ...event,
      registrations: event.registrations || existingRegs,
    };

    await saveEvents(events);

    try {
      revalidatePath("/events");
      revalidatePath("/");
    } catch {}

    const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";
    await logAdminAction({
      adminEmail: "admin@aifoundry.club",
      ip,
      action: "Updated Event",
      target: event.title,
      status: "success",
    });

    return NextResponse.json({ success: true, event: events[index] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID query parameter required" }, { status: 400 });
    }

    const events = await getEvents();
    const target = events.find((e) => e.id === id);
    const filtered = events.filter((e) => e.id !== id);
    await saveEvents(filtered);

    try {
      revalidatePath("/events");
      revalidatePath("/");
    } catch {}

    const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";
    await logAdminAction({
      adminEmail: "admin@aifoundry.club",
      ip,
      action: "Deleted Event",
      target: target?.title || id,
      status: "warning",
    });

    return NextResponse.json({ success: true, id });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
