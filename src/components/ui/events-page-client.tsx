"use client";

import React, { useState } from "react";
import { EventData } from "@/lib/data";
import { RegistrationModal } from "@/components/ui/registration-modal";
import { normalizeImageUrl } from "@/lib/image-helper";
import { Calendar, MapPin, Sparkles, Timer, Bookmark, ArrowRight, ExternalLink } from "lucide-react";

interface EventsPageClientProps {
  events: EventData[];
}

export function EventsPageClient({ events }: EventsPageClientProps) {
  const [selectedEvent, setSelectedEvent] = useState<EventData | null>(null);
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);

  const toggleBookmark = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setBookmarkedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleRegisterClick = (evt: EventData) => {
    if (evt.registrationMode === "external" && (evt.externalRegistrationUrl || evt.googleFormUrl)) {
      window.open(evt.externalRegistrationUrl || evt.googleFormUrl, "_blank");
      return;
    }
    setSelectedEvent(evt);
  };

  // Group events by status
  const featuredEvent = events.find((e) => e.status === "ongoing") || events[0];
  const ongoingEvents = events.filter((e) => e.status === "ongoing" && e.id !== featuredEvent?.id);
  const upcomingEvents = events.filter((e) => e.status === "upcoming" && e.id !== featuredEvent?.id);
  const pastEvents = events.filter((e) => e.status === "ended" && e.id !== featuredEvent?.id);

  const parseEventDate = (dateStr?: string) => {
    if (!dateStr) return { month: "OCT", day: "12" };
    try {
      const parts = dateStr.split(" ");
      if (parts.length >= 2) {
        return {
          month: parts[0].substring(0, 3).toUpperCase(),
          day: parts[1].replace(/[^0-9]/g, "") || "15",
        };
      }
      const d = new Date(dateStr);
      if (!isNaN(d.getTime())) {
        return {
          month: d.toLocaleString("default", { month: "short" }).toUpperCase(),
          day: String(d.getDate()).padStart(2, "0"),
        };
      }
    } catch {}
    return { month: "NOV", day: "02" };
  };

  return (
    <div className="w-full">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-36 sm:pt-44 pb-20 space-y-16">
        {/* ===== HERO SECTION ===== */}
        <section className="flex flex-col items-center text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-100/90 text-cyan-900 text-xs font-black uppercase tracking-wider border border-cyan-200 shadow-xs">
            <Sparkles className="size-3.5 text-cyan-700" />
            <span>AI Foundry Experiences</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-slate-900 font-['Hanken_Grotesk']">
            Elevated Experiences
          </h1>

          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto font-medium leading-relaxed">
            Immerse yourself in high-caliber hackathons, intense deep-dive workshops, and visionary keynotes. Where intelligence meets execution.
          </p>
        </section>

        {/* ===== FEATURED EVENT CARD ===== */}
        {featuredEvent && (
          <section className="relative group">
            <div className="glass-card rounded-3xl overflow-hidden transition-all duration-500 hover:scale-[1.005] hover:shadow-2xl flex flex-col md:flex-row relative z-10 border border-white/90 bg-white/80">
              <div className="w-full md:w-3/5 h-64 md:h-auto min-h-[300px] relative overflow-hidden bg-slate-900">
                <img
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  src={normalizeImageUrl(
                    featuredEvent.image,
                    "https://lh3.googleusercontent.com/aida-public/AB6AXuBqGXvsvKNg8FLCw2KFq974LERIA0x-ed5scbtG-vr7_Erz1LXF0Kxo6IqAt4jUJjdeQwylLItjc3ZIlWy4POUMjToItuEgSL3auk47bkOyypTKJlgIVp-zH_xOVI1B5rjO0mLjpM2L8SLv_2EXACmgePorX1RlrdDiyzJr2_mfCFS0OtkGutcJDkKw7PWNzbGl59kAK4Vn_VSR3N7VpPY09StkEzS5Wmj2LWXxcNiNMtKDurLLha5S"
                  )}
                  alt={featuredEvent.title}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/20 to-transparent md:bg-gradient-to-r"></div>
                <div className="absolute top-4 left-4 bg-red-600 text-white px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-md">
                  <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
                  {featuredEvent.status === "ongoing" ? "Live Now" : "Featured Spotlight"}
                </div>
              </div>

              <div className="p-6 sm:p-10 flex flex-col justify-center w-full md:w-2/5 bg-white/70 backdrop-blur-md">
                <div className="text-xs font-black text-cyan-700 mb-2 uppercase tracking-wider font-mono">
                  Masterclass &amp; Sprint
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-3 tracking-tight">
                  {featuredEvent.title}
                </h2>
                <p className="text-sm text-slate-600 mb-6 leading-relaxed line-clamp-3 font-medium">
                  {featuredEvent.description ||
                    "Join lead researchers as they deconstruct the latest breakthroughs in multi-modal foundational models and real-world deployment strategies."}
                </p>

                <div className="flex items-center gap-4 text-xs text-slate-600 mb-6 font-bold font-mono">
                  <div className="flex items-center gap-1">
                    <Calendar className="size-3.5 text-cyan-600" />
                    <span>{featuredEvent.date}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="size-3.5 text-cyan-600" />
                    <span>{featuredEvent.venue || "DSU Innovation Hall"}</span>
                  </div>
                </div>

                <div>
                  <button
                    onClick={() => handleRegisterClick(featuredEvent)}
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-full px-8 py-3.5 text-xs sm:text-sm font-black shadow-lg shadow-cyan-600/20 hover:scale-105 hover:from-cyan-500 hover:to-blue-500 transition-all duration-300 active:scale-95 cursor-pointer"
                  >
                    <span>
                      {featuredEvent.registrationMode === "external"
                        ? "Register (External)"
                        : "Register Now"}
                    </span>
                    {featuredEvent.registrationMode === "external" ? (
                      <ExternalLink className="size-4" />
                    ) : (
                      <ArrowRight className="size-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ===== ONGOING CHALLENGES SECTION ===== */}
        <section className="space-y-6">
          <div className="flex justify-between items-end border-b border-slate-200 pb-3">
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Ongoing Challenges
            </h3>
            <span className="text-xs font-black text-cyan-700 uppercase tracking-wider font-mono">
              {ongoingEvents.length} Active
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {ongoingEvents.length === 0 ? (
              <div className="col-span-full py-12 text-center rounded-3xl bg-white/70 border border-slate-200/80 text-slate-500 text-sm font-medium">
                No active live challenges currently running. Explore upcoming hackathons below.
              </div>
            ) : (
              ongoingEvents.map((evt) => (
                <div
                  key={evt.id}
                  onClick={() => handleRegisterClick(evt)}
                  className="glass-card rounded-3xl p-6 sm:p-7 transition-all duration-300 hover:scale-[1.01] hover:-translate-y-1 group cursor-pointer border border-white/90 bg-white/80"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="bg-purple-100 text-purple-900 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wide font-mono">
                      Hackathon
                    </div>
                    <div className="text-xs font-bold text-slate-500 flex items-center gap-1 font-mono">
                      <Timer className="size-3.5 text-cyan-600" />
                      <span>{evt.date}</span>
                    </div>
                  </div>

                  <h4 className="text-lg sm:text-xl font-black text-slate-900 mb-2 group-hover:text-cyan-700 transition-colors">
                    {evt.title}
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed mb-5 font-medium">
                    {evt.description}
                  </p>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    <span className="text-xs text-slate-500 font-semibold flex items-center gap-1">
                      <MapPin className="size-3.5 text-slate-400" />
                      <span>{evt.venue || "Campus Lab"}</span>
                    </span>
                    <span className="text-xs font-black text-cyan-700 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                      <span>Enter Sprint</span>
                      <ArrowRight className="size-3.5" />
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* ===== UPCOMING & ARCHIVE SECTION ===== */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-4 pb-8">
          {/* Upcoming Stack (2 cols) */}
          <section className="lg:col-span-2 space-y-6">
            <div className="border-b border-slate-200 pb-3 flex justify-between items-center">
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Upcoming Stack
              </h3>
              <span className="text-xs font-bold text-slate-500 font-mono">
                {upcomingEvents.length} Scheduled
              </span>
            </div>

            <div className="space-y-4">
              {upcomingEvents.length === 0 ? (
                <div className="py-10 text-center rounded-2xl bg-white/70 border border-slate-200/80 text-slate-500 text-sm font-medium">
                  All upcoming events will be announced shortly.
                </div>
              ) : (
                upcomingEvents.map((evt) => {
                  const dateBadge = parseEventDate(evt.date);
                  const isBookmarked = bookmarkedIds.includes(evt.id);
                  return (
                    <div
                      key={evt.id}
                      onClick={() => handleRegisterClick(evt)}
                      className="glass-card rounded-3xl p-5 sm:p-6 flex items-center gap-4 sm:gap-6 transition-all duration-300 hover:scale-[1.01] hover:shadow-lg cursor-pointer group border border-white/90 bg-white/80"
                    >
                      {/* Date Badge */}
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-cyan-100 text-cyan-950 flex flex-col items-center justify-center shrink-0 border border-cyan-200">
                        <span className="text-xs font-black uppercase tracking-wider font-mono">
                          {dateBadge.month}
                        </span>
                        <span className="text-xl sm:text-2xl font-black leading-none font-mono">
                          {dateBadge.day}
                        </span>
                      </div>

                      {/* Content */}
                      <div className="flex-grow">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[11px] font-black uppercase tracking-wider text-cyan-700 font-mono">
                            Upcoming
                          </span>
                        </div>
                        <h4 className="text-base sm:text-lg font-black text-slate-900 group-hover:text-cyan-700 transition-colors">
                          {evt.title}
                        </h4>
                        <p className="text-xs sm:text-sm text-slate-600 line-clamp-1 font-medium mt-0.5">
                          {evt.description}
                        </p>
                      </div>

                      {/* Bookmark action */}
                      <button
                        type="button"
                        onClick={(e) => toggleBookmark(e, evt.id)}
                        className={`p-2.5 rounded-full hover:bg-slate-100 transition-colors shrink-0 ${
                          isBookmarked ? "text-cyan-600" : "text-slate-400"
                        }`}
                        aria-label="Bookmark event"
                      >
                        <Bookmark className={`size-4 ${isBookmarked ? "fill-cyan-600" : ""}`} />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </section>

          {/* Past Events / Retrospectives */}
          <section className="space-y-6">
            <div className="border-b border-slate-200 pb-3 flex justify-between items-center">
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Archive
              </h3>
              <span className="text-xs font-bold text-slate-500 font-mono">
                {pastEvents.length} Past
              </span>
            </div>

            <div className="space-y-4">
              {pastEvents.length === 0 ? (
                <div className="py-8 text-center rounded-2xl bg-white/70 border border-slate-200/80 text-slate-400 text-xs font-medium">
                  No archived events recorded.
                </div>
              ) : (
                pastEvents.map((evt) => (
                  <div
                    key={evt.id}
                    className="glass-card rounded-2xl p-4 border border-white/80 bg-white/60 space-y-1"
                  >
                    <span className="text-[10px] font-bold text-slate-400 font-mono uppercase">
                      {evt.date}
                    </span>
                    <h5 className="text-xs font-black text-slate-800">{evt.title}</h5>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </main>

      {/* Registration Modal */}
      <RegistrationModal
        event={selectedEvent}
        isOpen={Boolean(selectedEvent)}
        onClose={() => setSelectedEvent(null)}
      />
    </div>
  );
}
