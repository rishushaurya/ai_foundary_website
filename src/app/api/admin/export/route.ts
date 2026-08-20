import { NextResponse } from "next/server";
import { getEvents, getRecruitmentEntries } from "@/lib/data";

// Helper to escape and sanitize CSV fields against CSV injection formulas
function sanitizeCSV(field: any): string {
  if (field === null || field === undefined) return '""';
  let str = String(field).replace(/"/g, '""');
  // If field starts with =, +, -, @, prepend a quote to prevent Excel formula execution
  if (/^[=+\-@]/.test(str)) {
    str = `'${str}`;
  }
  return `"${str}"`;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "events";
    const eventId = searchParams.get("eventId");

    if (type === "recruitment") {
      const entries = await getRecruitmentEntries();
      const headers = ["ID", "Name", "Email", "Phone", "Year", "Branch", "Preferred Team", "Skills", "Portfolio", "Why Join", "Date", "Status"];
      const rows = entries.map((e) => [
        sanitizeCSV(e.id),
        sanitizeCSV(e.name),
        sanitizeCSV(e.email),
        sanitizeCSV(e.phone),
        sanitizeCSV(e.year),
        sanitizeCSV(e.branch),
        sanitizeCSV(e.preferredTeam),
        sanitizeCSV(e.skills),
        sanitizeCSV(e.portfolioUrl || ""),
        sanitizeCSV(e.whyJoin),
        sanitizeCSV(e.timestamp),
        sanitizeCSV(e.status),
      ]);

      const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

      return new NextResponse(csvContent, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="aifoundry-recruitment-${Date.now()}.csv"`,
        },
      });
    }

    // Default: Event Registrations
    const events = await getEvents();
    let registrationsToExport: Array<{
      eventTitle: string;
      regId: string;
      name: string;
      email: string;
      phone: string;
      college: string;
      branch: string;
      timestamp: string;
    }> = [];

    events.forEach((evt) => {
      if (!eventId || evt.id === eventId) {
        (evt.registrations || []).forEach((reg) => {
          registrationsToExport.push({
            eventTitle: evt.title,
            regId: reg.id,
            name: reg.name,
            email: reg.email,
            phone: reg.phone,
            college: reg.college,
            branch: reg.branch,
            timestamp: reg.timestamp,
          });
        });
      }
    });

    const headers = ["Event Title", "Registration ID", "Name", "Email", "Phone", "College", "Branch", "Registration Time"];
    const rows = registrationsToExport.map((r) => [
      sanitizeCSV(r.eventTitle),
      sanitizeCSV(r.regId),
      sanitizeCSV(r.name),
      sanitizeCSV(r.email),
      sanitizeCSV(r.phone),
      sanitizeCSV(r.college),
      sanitizeCSV(r.branch),
      sanitizeCSV(r.timestamp),
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="aifoundry-event-registrations-${Date.now()}.csv"`,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
