"use client";

import React, { useState } from "react";
import { EventData } from "@/lib/data";
import { EventCountdown } from "@/components/ui/event-countdown";
import { RegistrationModal } from "@/components/ui/registration-modal";
import { Calendar, MapPin, ArrowRight, ExternalLink, Filter } from "lucide-react";

export function EventsCatalogClient({ events }: { events: EventData[] }) {
  const [selectedTab, setSelectedTab] = useState<"upcoming" | "all" | "ended">("upcoming");
  const [selectedEventForModal, setSelectedEventForModal] = useState<EventData | null>(null);

  const countdownEvent = events.find((e) => e.isCountdownEvent && e.status !== "ended") || events[0];

  const filteredEvents = events.filter((e) => {
    if (selectedTab === "upcoming") return e.status !== "ended";
    if (selectedTab === "ended") return e.status === "ended";
    return true;
  });

  return (
    <div className="space-y-12 w-full">
      {/* Featured Countdown Timer */}
      {countdownEvent && (
        <EventCountdown
          event={countdownEvent}
          onRegisterClick={() => setSelectedEventForModal(countdownEvent)}
        />
      )}

      {/* Filter Tabs */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-2">
          <Filter className="size-4 text-cyan-400" />
          <span className="text-xs uppercase font-bold tracking-widest text-slate-300 font-mono">
            Filter Initiatives:
          </span>
        </div>

        <div className="flex items-center gap-2">
          {(["upcoming", "all", "ended"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setSelectedTab(tab)}
              className={`px-4 py-1.5 rounded-full text-xs font-mono uppercase tracking-wider transition-all cursor-pointer ${
                selectedTab === tab
                  ? "font-bold bg-cyan-400 text-black shadow-[0_0_15px_rgba(0,210,255,0.4)]"
                  : "bg-white/5 text-slate-300 border border-white/10 hover:bg-white/15 hover:text-white"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Events Grid */}
      {filteredEvents.length === 0 ? (
        <div className="text-center py-16 px-4 rounded-3xl border border-dashed border-white/20 bg-black/40 backdrop-blur-xl font-mono text-xs text-slate-400 space-y-2">
          <Calendar className="size-8 mx-auto opacity-40 text-cyan-400" />
          <p>No events found matching the selected filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
          {filteredEvents.map((event) => {
            const formattedDate = new Date(event.date).toLocaleDateString("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            });

            const isEnded = event.status === "ended";

            return (
              <div
                key={event.id}
                className="group flex flex-col justify-between rounded-3xl border border-white/15 bg-black/40 backdrop-blur-xl p-6 sm:p-8 shadow-2xl hover:border-cyan-400/50 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="space-y-4">
                  {/* Status & Deadline Header */}
                  <div className="flex items-center justify-between">
                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-widest border ${
                        isEnded
                          ? "bg-slate-900 text-slate-500 border-slate-700"
                          : "bg-cyan-950/60 text-cyan-300 border-cyan-500/40"
                      }`}
                    >
                      {event.status}
                    </span>

                    {event.registrationMode === "google-form" && (
                      <span className="text-[10px] text-slate-400 uppercase flex items-center gap-1 font-mono">
                        <span>Google Form</span>
                        <ExternalLink className="size-2.5" />
                      </span>
                    )}
                  </div>

                  {/* Title & Description */}
                  <div className="space-y-2">
                    <h3 className="text-lg font-bold font-mono uppercase text-white group-hover:text-cyan-400 transition-colors">
                      {event.title}
                    </h3>
                    <p className="text-xs text-slate-300 font-sans leading-relaxed line-clamp-3">
                      {event.description}
                    </p>
                  </div>

                  {/* Metadata: Date & Venue */}
                  <div className="space-y-1.5 text-xs text-slate-400 font-mono border-t border-white/10 pt-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="size-3.5 text-cyan-400 flex-shrink-0" />
                      <span>{formattedDate}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="size-3.5 text-cyan-400 flex-shrink-0" />
                      <span className="truncate">{event.venue}</span>
                    </div>
                  </div>
                </div>

                {/* Bottom Trigger Action */}
                <div className="pt-6">
                  {isEnded ? (
                    <div className="text-center py-2.5 rounded-full border border-white/10 text-xs font-mono text-slate-500 uppercase bg-white/5">
                      Event Completed
                    </div>
                  ) : event.registrationMode === "google-form" && event.googleFormUrl ? (
                    <a
                      href={event.googleFormUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full py-3 rounded-full font-bold text-xs uppercase font-mono tracking-wider bg-white/10 text-cyan-300 border border-cyan-400/40 hover:bg-cyan-950/60 transition-all no-underline"
                    >
                      <span>Register via Google Form</span>
                      <ExternalLink className="size-3.5" />
                    </a>
                  ) : (
                    <button
                      onClick={() => setSelectedEventForModal(event)}
                      className="flex items-center justify-center gap-2 w-full py-3 rounded-full font-bold text-xs uppercase font-mono tracking-wider bg-cyan-400 hover:bg-cyan-300 text-black transition-all hover:scale-102 cursor-pointer shadow-[0_0_15px_rgba(0,210,255,0.4)]"
                    >
                      <span>Register Now</span>
                      <ArrowRight className="size-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Registration Modal */}
      <RegistrationModal
        event={selectedEventForModal}
        isOpen={Boolean(selectedEventForModal)}
        onClose={() => setSelectedEventForModal(null)}
      />
    </div>
  );
}
