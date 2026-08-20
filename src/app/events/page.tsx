import React from "react";
import { getEvents } from "@/lib/data";
import { EventsCatalogClient } from "@/components/ui/events-catalog-client";
import { Sparkles } from "lucide-react";

export const metadata = {
  title: "Events & Hackathons | AI Foundry - Dayananda Sagar University",
  description: "Browse upcoming hackathons, AI workshops, guest lectures, and symposiums at DSU.",
};

export default async function EventsPage() {
  const events = await getEvents();

  return (
    <main className="subpage-container subpage-bg font-mono text-white">
      <div className="subpage-inner">
        {/* Page Header */}
        <section className="text-center space-y-4 max-w-3xl mx-auto w-full">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-cyan-500/40 bg-cyan-950/60 text-cyan-300 text-xs font-bold uppercase tracking-widest shadow-sm backdrop-blur-md">
            <Sparkles className="size-3.5 text-cyan-400" />
            <span>Hackathons &amp; Masterclasses</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white">
            EVENTS &amp; HACKATHONS
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 normal-case leading-relaxed font-sans">
            From 24-hour rapid prototyping sprints to specialized agentic workflow bootcamps, discover hands-on initiatives designed to elevate your engineering and venture skills.
          </p>
        </section>

        {/* Events Client Catalog */}
        <div className="w-full">
          <EventsCatalogClient events={events} />
        </div>
      </div>
    </main>
  );
}
