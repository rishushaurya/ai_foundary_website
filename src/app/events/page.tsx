import React from "react";
import { getEvents } from "@/lib/data";
import { EventsPageClient } from "@/components/ui/events-page-client";
import { LightFooter } from "@/components/ui/light-footer";

export const metadata = {
  title: "Events & Hackathons | AI Foundry - Dayananda Sagar University",
  description: "Browse upcoming hackathons, AI workshops, guest lectures, and symposiums at DSU.",
};

export default async function EventsPage() {
  const events = await getEvents();

  return (
    <div className="mesh-bg min-h-screen flex flex-col justify-between">
      <EventsPageClient events={events} />
      <LightFooter />
    </div>
  );
}
