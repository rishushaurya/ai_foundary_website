"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Trophy } from "lucide-react";
import { EventsPageProps } from "../types";
import { RegistrationModal } from "@/components/ui/registration-modal";
import { EventData } from "@/lib/data";
import { normalizeImageUrl } from "@/lib/image-helper";

export function WixBoldEventsPage({ events }: EventsPageProps) {
  const [activeTab, setActiveTab] = useState<"all" | "ongoing" | "upcoming" | "archive">("all");
  const [selectedRegEvent, setSelectedRegEvent] = useState<EventData | null>(null);

  const defaultEvents: EventData[] = [
    {
      id: "24h-build-sprint",
      title: "24-Hour AI Build Sprint",
      date: "Oct 24 - 25, 2026 • 09:00 AM",
      venue: "DSU Innovation Center & Compute Lab",
      status: "upcoming" as const,
      image: "/images/rectangle-5.png",
      description:
        "A 24-hour team-based innovation challenge where DSU students identify a problem, develop a technology-driven solution, build a prototype, and present it to judges. It develops problem-solving, teamwork, innovation, time management, technical skills and communication through hands-on experience.",
      registrationMode: "builtin" as const,
      isRegistrationOpen: true,
    },
    {
      id: "escape-room",
      title: "Escape Room: Logic & AI Heuristics",
      date: "Nov 12, 2026 • 10:00 AM",
      venue: "Main Campus Auditorium",
      status: "upcoming" as const,
      image: "/images/rectangle-3.png",
      description:
        "An intense collaborative challenge where multidisciplinary teams race against the clock to solve AI puzzles, decrypt neural weights, and breach simulated cybersecurity barriers.",
      registrationMode: "builtin" as const,
      isRegistrationOpen: true,
    },
    {
      id: "agentic-bootcamp",
      title: "Agentic Systems & LLM Fine-Tuning Bootcamp",
      date: "Nov 28, 2026 • 02:00 PM",
      venue: "Dept. of CSE (AI & ML) Lab 4",
      status: "upcoming" as const,
      image: "/images/rectangle-8.png",
      description:
        "Deep dive into open-source model weights, LoRA adapters, autonomous tool-use orchestration, and GPU inference optimization.",
      registrationMode: "builtin" as const,
      isRegistrationOpen: true,
    },
    {
      id: "inaugural-symposium",
      title: "AI Foundry Inaugural Symposium",
      date: "Aug 15, 2025 • Completed",
      venue: "Auditorium 1",
      status: "ended" as const,
      image: "/images/rectangle-898.png",
      description:
        "The ceremonial launch of AI Foundry bringing together university leaders, industry researchers, and 300+ students to inaugurate the innovation chapter.",
      registrationMode: "builtin" as const,
      isRegistrationOpen: false,
    },
  ];

  const eventList = events && events.length > 0 ? events : defaultEvents;

  const ongoingEvents = eventList.filter(
    (e) => (e.status || "").toLowerCase() === "ongoing"
  );
  const upcomingEvents = eventList.filter(
    (e) => (e.status || "").toLowerCase() === "upcoming" || !e.status
  );
  const pastEvents = eventList.filter(
    (e) =>
      (e.status || "").toLowerCase() === "past" ||
      (e.status || "").toLowerCase() === "completed" ||
      (e.status || "").toLowerCase() === "ended"
  );

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "TBA";
    if (dateStr.includes("•") || dateStr.includes("AM") || dateStr.includes("PM")) {
      return dateStr;
    }
    try {
      return new Date(dateStr).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const getImageAlignmentClass = (fit?: "cover" | "contain", pos?: "center" | "top" | "bottom") => {
    const fitClass = fit === "contain" ? "object-contain" : "object-cover";
    const posClass = pos === "top" ? "object-top" : pos === "bottom" ? "object-bottom" : "object-center";
    return `${fitClass} ${posClass}`;
  };

  const getEventRegistrationStatus = (evt: EventData) => {
    const now = Date.now();

    if (evt.status === "ended") {
      return {
        canApply: false,
        label: evt.closedMessage || "Applications Closed",
        reason: "ended",
      };
    }

    if (evt.registrationStartDate) {
      const startTime = new Date(evt.registrationStartDate).getTime();
      if (!isNaN(startTime) && startTime > now) {
        return {
          canApply: false,
          label: "Opening Soon",
          reason: "future",
        };
      }
    }

    if (evt.registrationDeadline) {
      const deadlineTime = new Date(evt.registrationDeadline).getTime();
      if (!isNaN(deadlineTime) && deadlineTime <= now) {
        return {
          canApply: false,
          label: evt.closedMessage || "Applications Closed",
          reason: "deadline_passed",
        };
      }
    }

    if (evt.isRegistrationOpen === false) {
      return {
        canApply: false,
        label: evt.closedMessage || "Applications Closed",
        reason: "closed",
      };
    }

    return {
      canApply: true,
      label: evt.registrationMode === "external" ? "Register (External)" : "Register Now",
      reason: "open",
    };
  };

  const handleRegister = (evt: EventData) => {
    const regStatus = getEventRegistrationStatus(evt);
    if (!regStatus.canApply) return;

    if (
      (evt.registrationMode === "external" ||
        evt.registrationMode === "google-form" ||
        (evt.registrationMode as string) === "google_form") &&
      (evt.externalRegistrationUrl || evt.googleFormUrl)
    ) {
      window.open(evt.externalRegistrationUrl || evt.googleFormUrl, "_blank");
      return;
    }

    setSelectedRegEvent(evt);
  };

  return (
    <div className="min-h-screen bg-[#FFFFE9] text-[#2D2E2A] selection:bg-[#2D2E2A] selection:text-[#FFFFE9] py-12 sm:py-20 font-sans">
      <div className="max-w-5xl mx-auto px-6 sm:px-8 space-y-16 sm:space-y-24">
        {/* Header Masthead */}
        <div className="space-y-4 max-w-2xl">
          <h1 className="text-3xl sm:text-5xl font-serif italic text-[#2D2E2A]">
            Elevated Experiences
          </h1>
          <p className="text-xs sm:text-sm text-[#2D2E2A] leading-relaxed font-normal">
            Immerse yourself in high-caliber hackathons, intense deep-dive workshops,
            and visionary keynotes. Where intelligence meets execution.
          </p>

          {/* Filter Pills */}
          <div className="flex flex-wrap gap-2 pt-4">
            {[
              { id: "all", label: "All Events" },
              { id: "ongoing", label: `Ongoing (${ongoingEvents.length})` },
              { id: "upcoming", label: `Upcoming (${upcomingEvents.length})` },
              { id: "archive", label: `Archive (${pastEvents.length})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`px-4 py-1.5 rounded-full text-xs font-medium uppercase tracking-wider transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? "bg-[#2D2E2A] text-[#FFFFE9]"
                    : "bg-[#C6CCBD]/40 text-[#2D2E2A] hover:bg-[#C6CCBD]"
                }`}
              >
                {tab.label}
              </button>
            ))}

            <Link
              href="/leaderboard"
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-[#ECFF17] text-[#2D2E2A] hover:bg-[#d8ea13] transition-all cursor-pointer shadow-xs"
            >
              <Trophy className="size-3" />
              <span>Live Leaderboard</span>
            </Link>
          </div>
        </div>

        {/* SECTION: ONGOING EVENTS */}
        {(activeTab === "all" || activeTab === "ongoing") && (
          <div className="space-y-8">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#2D2E2A]">
              Ongoing Events
            </h2>

            {ongoingEvents.length === 0 ? (
              <div className="py-12 border-y border-[#2D2E2A]/10 text-center">
                <p className="text-xs tracking-wider uppercase text-[#424440]">
                  No ongoing events at the moment
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 items-stretch">
                {ongoingEvents.map((ev) => {
                  const regStatus = getEventRegistrationStatus(ev);
                  return (
                    <div
                      key={ev.id || ev.title}
                      className="bg-[#C6CCBD] rounded-[28px] p-6 sm:p-8 flex flex-col justify-between border border-[#2D2E2A]/10 shadow-sm"
                    >
                      <div>
                        {(ev.homeImage || ev.image) && (
                          <div className="w-full h-44 sm:h-48 relative rounded-2xl overflow-hidden mb-5 border border-[#2D2E2A]/15 bg-[#FFFFE9]/50">
                            <img
                              src={normalizeImageUrl(ev.homeImage || ev.image)}
                              alt={ev.title}
                              className={`w-full h-full ${getImageAlignmentClass(ev.imageFit, ev.imagePosition)}`}
                            />
                          </div>
                        )}
                        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#2D2E2A]/20">
                          <h3 className="text-base font-semibold text-[#2D2E2A]">
                            {ev.title}
                          </h3>
                          <span className="font-mono text-[10px] sm:text-[11px] font-bold tracking-wider uppercase bg-[#2D2E2A] text-[#ECFF17] px-2.5 py-1 rounded-md shadow-xs">
                            [ {formatDate(ev.date)} ]
                          </span>
                        </div>
                        <p className="mt-4 text-xs text-[#2D2E2A] leading-relaxed">
                          {ev.description}
                        </p>
                      </div>
                      <div className="pt-6 mt-4">
                        <button
                          onClick={() => handleRegister(ev)}
                          disabled={!regStatus.canApply}
                          className={`inline-block w-full text-center py-2.5 px-6 rounded-full text-xs font-semibold uppercase tracking-wider transition-all shadow-sm ${
                            regStatus.canApply
                              ? "bg-[#2D2E2A] text-[#FFFFE9] hover:bg-[#424440] cursor-pointer"
                              : "bg-[#2D2E2A]/20 text-[#2D2E2A]/60 cursor-not-allowed border border-[#2D2E2A]/10"
                          }`}
                        >
                          {regStatus.label}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* SECTION: UPCOMING EVENTS */}
        {(activeTab === "all" || activeTab === "upcoming") && (
          <div className="space-y-8">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#2D2E2A]">
              Upcoming Events
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 items-stretch">
              {upcomingEvents.map((ev) => {
                const regStatus = getEventRegistrationStatus(ev);
                return (
                  <div
                    key={ev.id || ev.title}
                    className="bg-[#C6CCBD] rounded-[28px] p-6 sm:p-8 flex flex-col justify-between border border-[#2D2E2A]/10 shadow-sm transition-all hover:shadow-md"
                  >
                    <div>
                      {(ev.homeImage || ev.image) && (
                        <div className="w-full h-44 sm:h-48 relative rounded-2xl overflow-hidden mb-5 border border-[#2D2E2A]/15 bg-[#FFFFE9]/50">
                          <img
                            src={normalizeImageUrl(ev.homeImage || ev.image)}
                            alt={ev.title}
                            className={`w-full h-full ${getImageAlignmentClass(ev.imageFit, ev.imagePosition)}`}
                          />
                        </div>
                      )}

                      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#2D2E2A]/20">
                        <h3 className="text-base font-semibold text-[#2D2E2A]">
                          {ev.title}
                        </h3>
                        <span className="font-mono text-[10px] sm:text-[11px] font-bold tracking-wider uppercase bg-[#2D2E2A] text-[#ECFF17] px-2.5 py-1 rounded-md shadow-xs">
                          [ {formatDate(ev.date)} ]
                        </span>
                      </div>

                      <p className="mt-4 text-xs sm:text-sm text-[#2D2E2A] leading-relaxed font-normal whitespace-pre-line">
                        {ev.description}
                      </p>
                    </div>

                    <div className="pt-6 mt-4">
                      <button
                        onClick={() => handleRegister(ev)}
                        disabled={!regStatus.canApply}
                        className={`inline-block w-full text-center py-2.5 px-6 rounded-full text-xs font-semibold uppercase tracking-wider transition-all shadow-sm ${
                          regStatus.canApply
                            ? "bg-[#2D2E2A] text-[#FFFFE9] hover:bg-[#424440] cursor-pointer"
                            : "bg-[#2D2E2A]/20 text-[#2D2E2A]/60 cursor-not-allowed border border-[#2D2E2A]/10"
                        }`}
                      >
                        {regStatus.label}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* SECTION: ARCHIVE */}
        {(activeTab === "all" || activeTab === "archive") && (
          <div className="space-y-8">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#2D2E2A]">
              Archive &amp; Past Initiatives
            </h2>

            {pastEvents.length === 0 ? (
              <div className="py-12 border-y border-[#2D2E2A]/10 text-center">
                <p className="text-xs tracking-wider uppercase text-[#424440]">
                  No archived events yet
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {pastEvents.map((ev) => (
                  <div
                    key={ev.id || ev.title}
                    className="border border-[#2D2E2A]/20 p-6 rounded-2xl bg-[#FFFFE9] flex flex-col justify-between space-y-4 shadow-xs"
                  >
                    <div>
                      {(ev.homeImage || ev.image) && (
                        <div className="w-full h-40 relative rounded-xl overflow-hidden mb-4 border border-[#2D2E2A]/15 bg-[#C6CCBD]/20">
                          <img
                            src={normalizeImageUrl(ev.homeImage || ev.image)}
                            alt={ev.title}
                            className={`w-full h-full grayscale contrast-125 ${getImageAlignmentClass(ev.imageFit, ev.imagePosition)}`}
                          />
                        </div>
                      )}
                      <div className="flex items-center justify-between text-xs text-[#666864] mb-2">
                        <span className="font-mono text-[10px] font-bold uppercase tracking-wider bg-[#2D2E2A] text-[#FFFFE9] px-2 py-0.5 rounded">
                          [ {formatDate(ev.date)} ]
                        </span>
                        <span className="font-semibold uppercase tracking-wider text-[#2D2E2A]">
                          Completed
                        </span>
                      </div>
                      <h3 className="text-sm font-semibold text-[#2D2E2A]">
                        {ev.title}
                      </h3>
                      <p className="text-xs text-[#424440] mt-2 line-clamp-3">
                        {ev.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Registration Modal */}
      {selectedRegEvent && (
        <RegistrationModal
          event={selectedRegEvent}
          isOpen={!!selectedRegEvent}
          onClose={() => setSelectedRegEvent(null)}
        />
      )}
    </div>
  );
}
