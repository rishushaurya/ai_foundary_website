"use client";

import React, { useState, useMemo } from "react";
import { EventData } from "@/lib/data";
import { RegistrationModal } from "@/components/ui/registration-modal";
import { normalizeImageUrl } from "@/lib/image-helper";
import {
  Calendar,
  MapPin,
  Sparkles,
  ArrowRight,
  ExternalLink,
  Search,
  CheckCircle2,
  Clock,
  Info,
  ChevronRight,
  X,
  FileText,
  Download,
  Share2,
} from "lucide-react";

interface EventsPageClientProps {
  events: EventData[];
}

export function EventsPageClient({ events = [] }: EventsPageClientProps) {
  const [activeTab, setActiveTab] = useState<"all" | "ongoing" | "upcoming" | "ended">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEvent, setSelectedEvent] = useState<EventData | null>(null);
  const [detailEvent, setDetailEvent] = useState<EventData | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Group events by status
  const ongoingEvents = useMemo(() => events.filter((e) => e.status === "ongoing"), [events]);
  const upcomingEvents = useMemo(() => events.filter((e) => e.status === "upcoming"), [events]);
  const endedEvents = useMemo(() => events.filter((e) => e.status === "ended"), [events]);

  // Filtered by active tab and search query
  const filteredEvents = useMemo(() => {
    let list: EventData[] = [];
    if (activeTab === "all") list = events;
    else if (activeTab === "ongoing") list = ongoingEvents;
    else if (activeTab === "upcoming") list = upcomingEvents;
    else if (activeTab === "ended") list = endedEvents;

    if (!searchQuery.trim()) return list;

    const q = searchQuery.toLowerCase();
    return list.filter(
      (e) =>
        e.title.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q) ||
        e.venue.toLowerCase().includes(q)
    );
  }, [events, ongoingEvents, upcomingEvents, endedEvents, activeTab, searchQuery]);

  const getEventRegistrationStatus = (evt: EventData) => {
    const isEnded = evt.status === "ended" || evt.isRegistrationOpen === false;
    const isFutureStart =
      evt.isRegistrationOpen === false &&
      !!evt.registrationStartDate &&
      new Date(evt.registrationStartDate).getTime() > Date.now();
    const isPastDeadline =
      !isFutureStart &&
      evt.registrationDeadline &&
      new Date(evt.registrationDeadline).getTime() < Date.now();

    if (isEnded || isPastDeadline) {
      return {
        canApply: false,
        label: evt.closedMessage || "Applications Closed",
        reason: "closed",
      };
    }
    if (isFutureStart) {
      return { canApply: false, label: "Opening Soon", reason: "future" };
    }
    return {
      canApply: true,
      label: evt.registrationMode === "external" ? "Register (External)" : "Register Now",
      reason: "open",
    };
  };

  const handleRegisterClick = (evt: EventData, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const regStatus = getEventRegistrationStatus(evt);
    if (!regStatus.canApply) return;

    if (evt.registrationMode === "external" && (evt.externalRegistrationUrl || evt.googleFormUrl)) {
      window.open(evt.externalRegistrationUrl || evt.googleFormUrl, "_blank");
      return;
    }
    setSelectedEvent(evt);
  };

  const handleShare = (evt: EventData, e: React.MouseEvent) => {
    e.stopPropagation();
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(`${window.location.origin}/events#${evt.id}`);
      setCopiedId(evt.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const parseEventDate = (dateStr?: string) => {
    if (!dateStr) return { month: "OCT", day: "25", year: "2026" };
    try {
      const d = new Date(dateStr);
      if (!isNaN(d.getTime())) {
        return {
          month: d.toLocaleString("default", { month: "short" }).toUpperCase(),
          day: String(d.getDate()).padStart(2, "0"),
          year: String(d.getFullYear()),
        };
      }
      const parts = dateStr.split(" ");
      if (parts.length >= 2) {
        return {
          month: parts[0].substring(0, 3).toUpperCase(),
          day: parts[1].replace(/[^0-9]/g, "") || "15",
          year: parts[2] || "2026",
        };
      }
    } catch {}
    return { month: "NOV", day: "02", year: "2026" };
  };

  return (
    <div className="w-full bg-[#FFFFE9] text-[#2D2E2A] selection:bg-[#ECFF17] selection:text-[#000000]">
      <main className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-16 pt-32 sm:pt-40 pb-24 space-y-16">
        {/* ===== HERO MASTHEAD ===== */}
        <section className="flex flex-col items-start space-y-4 border-b border-[#C6CCBD]/70 pb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ECFF17]/30 border border-[#2D2E2A]/15 text-[#2D2E2A] text-[11px] font-jetbrains font-bold uppercase tracking-wider">
            <Sparkles className="size-3 text-[#2D2E2A]" />
            <span>DAYANANDA SAGAR UNIVERSITY • RAISE AI CLUB</span>
          </div>

          <h1 className="font-libre text-5xl sm:text-7xl lg:text-8xl font-normal tracking-tight text-[#2D2E2A] leading-none select-none">
            Elevated Experiences
          </h1>

          <p className="font-inter text-base sm:text-xl text-[#5E6059] max-w-3xl font-normal leading-relaxed">
            Immerse yourself in high-caliber hackathons, intense deep-dive workshops, and visionary keynotes. Where intelligence meets execution.
          </p>

          {/* Quick Metrics Bar */}
          <div className="flex flex-wrap items-center gap-6 pt-4 text-xs font-jetbrains text-[#5E6059]">
            <span className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
              <strong className="text-[#2D2E2A] font-bold">{ongoingEvents.length}</strong> Ongoing
            </span>
            <span className="text-[#C6CCBD]">•</span>
            <span className="flex items-center gap-2">
              <strong className="text-[#2D2E2A] font-bold">{upcomingEvents.length}</strong> Upcoming
            </span>
            <span className="text-[#C6CCBD]">•</span>
            <span className="flex items-center gap-2">
              <strong className="text-[#2D2E2A] font-bold">{endedEvents.length}</strong> Archived
            </span>
          </div>
        </section>

        {/* ===== CONTROLS: TABS & SEARCH BAR ===== */}
        <section className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* Tab buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {[
              { key: "all", label: "All Events", count: events.length },
              { key: "ongoing", label: "Ongoing Events", count: ongoingEvents.length },
              { key: "upcoming", label: "Upcoming Events", count: upcomingEvents.length },
              { key: "ended", label: "Archive", count: endedEvents.length },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`px-4 py-2 rounded-full text-xs font-jetbrains uppercase tracking-wider font-semibold transition-all cursor-pointer flex items-center gap-2 ${
                  activeTab === tab.key
                    ? "bg-[#2D2E2A] text-[#FFFFE9] shadow-sm"
                    : "bg-white/80 text-[#5E6059] hover:text-[#2D2E2A] hover:bg-white border border-[#C6CCBD]/60"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                    activeTab === tab.key
                      ? "bg-[#ECFF17] text-black font-bold"
                      : "bg-[#2D2E2A]/5 text-[#5E6059]"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Search input */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-[#7A836F]" />
            <input
              type="text"
              placeholder="Search hackathons, topics, venues..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-full bg-white/90 border border-[#C6CCBD] text-xs font-inter text-[#2D2E2A] placeholder-[#8A8F82] focus:outline-none focus:border-[#2D2E2A] transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#7A836F] hover:text-[#2D2E2A]"
              >
                Clear
              </button>
            )}
          </div>
        </section>

        {/* ===== ONGOING EVENTS SPOTLIGHT (IF APPLICABLE) ===== */}
        {activeTab === "ongoing" && ongoingEvents.length === 0 && (
          <div className="rounded-3xl border border-[#C6CCBD] bg-white/60 p-12 text-center space-y-3">
            <div className="size-12 rounded-2xl bg-[#FFFFE9] border border-[#C6CCBD] flex items-center justify-center mx-auto text-[#2D2E2A]">
              <Clock className="size-6 text-[#7A836F]" />
            </div>
            <h2 className="font-libre text-2xl font-bold text-[#2D2E2A]">No events at the moment</h2>
            <p className="font-inter text-sm text-[#5E6059] max-w-md mx-auto">
              There are currently no live ongoing events. Explore our upcoming hackathons or browse the visual archive.
            </p>
          </div>
        )}

        {/* ===== MAIN EVENTS GRID ===== */}
        {filteredEvents.length === 0 && activeTab !== "ongoing" ? (
          <div className="rounded-3xl border border-[#C6CCBD] bg-white/60 p-16 text-center space-y-3">
            <Info className="size-8 text-[#7A836F] mx-auto" />
            <h2 className="font-libre text-2xl font-bold text-[#2D2E2A]">No Matching Events Found</h2>
            <p className="font-inter text-sm text-[#5E6059] max-w-md mx-auto">
              No events matched your search query. Try clearing the filter or exploring other categories.
            </p>
            <button
              onClick={() => {
                setActiveTab("all");
                setSearchQuery("");
              }}
              className="mt-2 px-5 py-2 rounded-full bg-[#2D2E2A] text-[#FFFFE9] text-xs font-jetbrains font-bold uppercase tracking-wider hover:bg-black transition-all"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredEvents.map((evt) => {
              const regStatus = getEventRegistrationStatus(evt);
              const dateInfo = parseEventDate(evt.date);
              const isOngoing = evt.status === "ongoing";

              return (
                <div
                  key={evt.id}
                  id={evt.id}
                  onClick={() => setDetailEvent(evt)}
                  className={`group relative rounded-3xl border bg-white/80 transition-all duration-300 flex flex-col justify-between overflow-hidden cursor-pointer shadow-xs hover:shadow-xl hover:-translate-y-1 ${
                    isOngoing ? "border-[#2D2E2A] ring-2 ring-[#ECFF17]" : "border-[#C6CCBD] hover:border-[#2D2E2A]/50"
                  }`}
                >
                  <div>
                    {/* Event Cover Image */}
                    <div className="relative w-full h-56 overflow-hidden bg-[#2D2E2A]">
                      <img
                        src={normalizeImageUrl(evt.image, "/images/rectangle-899.png")}
                        alt={evt.title}
                        className={`w-full h-full ${evt.imageFit === 'contain' ? 'object-contain' : 'object-cover'} ${evt.imagePosition === 'top' ? 'object-top' : evt.imagePosition === 'bottom' ? 'object-bottom' : 'object-center'} group-hover:scale-105 transition-transform duration-700`}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

                      {/* Top Badges */}
                      <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
                        {/* Status pill */}
                        <span
                          className={`px-3 py-1 rounded-full text-[10px] font-jetbrains font-bold uppercase tracking-wider shadow-sm ${
                            isOngoing
                              ? "bg-[#ECFF17] text-black"
                              : evt.status === "upcoming"
                              ? "bg-[#2D2E2A] text-[#FFFFE9] border border-white/20"
                              : "bg-[#767574] text-white"
                          }`}
                        >
                          {evt.status === "ongoing"
                            ? "● LIVE NOW"
                            : evt.status === "upcoming"
                            ? "UPCOMING"
                            : "ARCHIVED"}
                        </span>

                        {/* Share Button */}
                        <button
                          type="button"
                          onClick={(e) => handleShare(evt, e)}
                          title="Share event link"
                          className="size-8 rounded-full bg-black/50 backdrop-blur-md border border-white/20 text-white flex items-center justify-center hover:bg-[#ECFF17] hover:text-black transition-colors pointer-events-auto"
                        >
                          {copiedId === evt.id ? (
                            <CheckCircle2 className="size-3.5 text-emerald-400" />
                          ) : (
                            <Share2 className="size-3.5" />
                          )}
                        </button>
                      </div>

                      {/* Floating Date Badge */}
                      <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-md rounded-2xl px-3.5 py-1.5 border border-white/60 shadow-sm text-center">
                        <span className="block font-jetbrains text-[9px] font-bold text-[#7A836F] uppercase leading-none">
                          {dateInfo.month}
                        </span>
                        <span className="block font-libre text-xl font-bold text-[#2D2E2A] leading-tight">
                          {dateInfo.day}
                        </span>
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-6 sm:p-7 space-y-4">
                      {/* Venue / Timing */}
                      <div className="flex items-center gap-4 text-xs font-inter text-[#5E6059]">
                        <span className="inline-flex items-center gap-1.5 line-clamp-1">
                          <MapPin className="size-3.5 text-[#2D2E2A] shrink-0" />
                          <span>{evt.venue || "DSU Bengaluru"}</span>
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="font-libre text-2xl font-bold text-[#2D2E2A] leading-snug group-hover:text-black transition-colors line-clamp-2">
                        {evt.title}
                      </h3>

                      {/* Description */}
                      <p className="font-inter text-xs text-[#5E6059] leading-relaxed line-clamp-3">
                        {evt.description}
                      </p>

                      {/* Deadline indicator if upcoming */}
                      {evt.status === "upcoming" && evt.registrationDeadline && (
                        <div className="pt-1 flex items-center gap-2 font-jetbrains text-[11px] text-[#7A836F]">
                          <Clock className="size-3.5" />
                          <span>Deadline: {evt.registrationDeadline}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card Footer / Action Button */}
                  <div className="p-6 sm:p-7 pt-0 border-t border-[#C6CCBD]/40 flex items-center justify-between gap-3 mt-4">
                    {regStatus.canApply ? (
                      <button
                        type="button"
                        onClick={(e) => handleRegisterClick(evt, e)}
                        className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-5 rounded-full bg-[#2D2E2A] text-[#FFFFE9] text-xs font-jetbrains font-bold uppercase tracking-wider hover:bg-black transition-all shadow-xs group/btn cursor-pointer"
                      >
                        <span>{regStatus.label}</span>
                        {evt.registrationMode === "external" ? (
                          <ExternalLink className="size-3.5" />
                        ) : (
                          <ArrowRight className="size-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
                        )}
                      </button>
                    ) : (
                      <div className="flex-1 py-3 px-4 rounded-full bg-[#2D2E2A]/5 text-[#7A836F] text-xs font-jetbrains font-bold uppercase tracking-wider text-center border border-[#C6CCBD]/60">
                        {regStatus.label}
                      </div>
                    )}

                    {/* Info trigger */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDetailEvent(evt);
                      }}
                      className="size-10 rounded-full border border-[#C6CCBD] bg-white text-[#2D2E2A] flex items-center justify-center hover:bg-[#2D2E2A] hover:text-white transition-colors"
                      title="View full event details"
                    >
                      <ChevronRight className="size-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* ===== EVENT DETAILS DRAWER / MODAL ===== */}
      {detailEvent && (
        <div
          className="fixed inset-0 z-[100000] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setDetailEvent(null)}
        >
          <div
            className="relative w-full max-w-2xl max-h-[90vh] bg-[#FFFFE9] border border-[#C6CCBD] rounded-3xl shadow-2xl overflow-y-auto p-6 sm:p-8 space-y-6 text-[#2D2E2A]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setDetailEvent(null)}
              className="absolute top-6 right-6 size-9 rounded-full bg-white/80 border border-[#C6CCBD] flex items-center justify-center text-[#2D2E2A] hover:bg-black hover:text-white transition-colors"
            >
              <X className="size-4" />
            </button>

            {/* Header / Media */}
            <div className="space-y-4">
              <div className="relative w-full h-64 rounded-2xl overflow-hidden border border-[#C6CCBD] bg-black">
                <img
                  src={normalizeImageUrl(detailEvent.image, "/images/rectangle-899.png")}
                  alt={detailEvent.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 rounded-full text-[10px] font-jetbrains font-bold uppercase tracking-wider bg-[#ECFF17] text-black shadow-sm">
                    {detailEvent.status.toUpperCase()}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-jetbrains text-[#7A836F]">
                  <Calendar className="size-3.5" />
                  <span>{detailEvent.date}</span>
                  <span>•</span>
                  <MapPin className="size-3.5" />
                  <span>{detailEvent.venue}</span>
                </div>
                <h2 className="font-libre text-3xl font-bold text-[#2D2E2A]">
                  {detailEvent.title}
                </h2>
              </div>
            </div>

            {/* Full Description */}
            <div className="border-t border-[#C6CCBD]/60 pt-4 space-y-3">
              <h4 className="font-jetbrains text-xs font-bold uppercase tracking-wider text-[#7A836F]">
                About This Event
              </h4>
              <p className="font-inter text-sm text-[#424440] leading-relaxed whitespace-pre-line">
                {detailEvent.description}
              </p>
            </div>

            {/* Downloads / Resources (if any) */}
            {detailEvent.downloads && detailEvent.downloads.length > 0 && (
              <div className="border-t border-[#C6CCBD]/60 pt-4 space-y-3">
                <h4 className="font-jetbrains text-xs font-bold uppercase tracking-wider text-[#7A836F]">
                  Downloads &amp; Materials
                </h4>
                <div className="space-y-2">
                  {detailEvent.downloads.map((d, i) => (
                    <a
                      key={i}
                      href={d.url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-between p-3 rounded-xl bg-white border border-[#C6CCBD] text-xs font-jetbrains hover:bg-[#2D2E2A] hover:text-white transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <FileText className="size-4" />
                        <span>{d.name}</span>
                      </span>
                      <Download className="size-3.5" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Action Bar inside Drawer */}
            <div className="border-t border-[#C6CCBD]/60 pt-4 flex flex-col sm:flex-row items-center gap-3">
              {getEventRegistrationStatus(detailEvent).canApply ? (
                <button
                  type="button"
                  onClick={() => {
                    const evt = detailEvent;
                    setDetailEvent(null);
                    handleRegisterClick(evt);
                  }}
                  className="w-full sm:flex-1 py-3 px-6 rounded-full bg-[#2D2E2A] text-[#FFFFE9] text-xs font-jetbrains font-bold uppercase tracking-wider hover:bg-black transition-all text-center flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>{getEventRegistrationStatus(detailEvent).label}</span>
                  <ArrowRight className="size-3.5" />
                </button>
              ) : (
                <div className="w-full sm:flex-1 py-3 px-6 rounded-full bg-[#2D2E2A]/5 text-[#7A836F] text-xs font-jetbrains font-bold uppercase tracking-wider text-center border border-[#C6CCBD]/60">
                  {getEventRegistrationStatus(detailEvent).label}
                </div>
              )}
              <button
                type="button"
                onClick={() => setDetailEvent(null)}
                className="w-full sm:w-auto py-3 px-6 rounded-full border border-[#C6CCBD] bg-white text-xs font-jetbrains font-bold uppercase tracking-wider text-[#2D2E2A] hover:bg-gray-100 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== REGISTRATION MODAL ===== */}
      <RegistrationModal
        event={selectedEvent}
        isOpen={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
      />
    </div>
  );
}
