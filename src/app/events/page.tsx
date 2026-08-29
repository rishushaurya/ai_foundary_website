import React from "react";
import { notFound } from "next/navigation";
import { getEvents, getSettings } from "@/lib/data";
import { EventsPageClient } from "@/components/ui/events-page-client";
import { LightFooter } from "@/components/ui/light-footer";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "Events & Hackathons | AI Foundry - Dayananda Sagar University",
  description: "Browse upcoming hackathons, AI workshops, guest lectures, and symposiums at DSU.",
};

export default async function EventsPage() {
  const [events, settings] = await Promise.all([getEvents(), getSettings()]);

  if (settings.visiblePages?.events === false) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#FFFFE9] text-[#2D2E2A] flex flex-col justify-between selection:bg-[#ECFF17] selection:text-[#000000]">
      <EventsPageClient events={events} />
      <LightFooter visiblePages={settings.visiblePages} socialLinks={settings.socialLinks} />
    </div>
  );
}
