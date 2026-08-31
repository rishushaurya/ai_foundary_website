"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Calendar,
  MapPin,
  ArrowUpRight,
  ArrowRight,
  Clock,
  Sparkles,
} from "lucide-react";
import {
  EventData,
  TeamMember,
  GallerySection,
  LandingCustomContent,
  SiteSettings,
} from "@/lib/data";
import { normalizeImageUrl } from "@/lib/image-helper";
import { RegistrationModal } from "@/components/ui/registration-modal";
import { LightFooter } from "@/components/ui/light-footer";

export interface HomeViewProps {
  events: EventData[];
  team: TeamMember[];
  gallerySections: GallerySection[];
  heroTagline: string;
  aboutText: string;
  landingContent?: LandingCustomContent;
  socialLinks?: SiteSettings["socialLinks"];
  visiblePages?: SiteSettings["visiblePages"];
}

export function HomeView({
  events = [],
  team = [],
  gallerySections = [],
  heroTagline,
  aboutText,
  landingContent,
  socialLinks,
  visiblePages,
}: HomeViewProps) {
  const router = useRouter();
  const [selectedEvent, setSelectedEvent] = useState<EventData | null>(null);

  // Smooth scroll to #about-section if requested via URL query (?scrollTo=about)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("scrollTo") === "about") {
        setTimeout(() => {
          const el = document.getElementById("about-section");
          if (el) {
            el.scrollIntoView({ behavior: "smooth" });
          }
        }, 150);
        // Clean URL without triggering reload
        window.history.replaceState({}, "", window.location.pathname);
      }
    }
  }, []);

  // Collect marquee images from gallerySections or provide curated fallbacks
  const marqueeImages = React.useMemo(() => {
    const collected: { id: string; url: string; name: string; albumName?: string }[] = [];
    gallerySections.forEach((section) => {
      section.items.forEach((item) => {
        if (item.type === "image" || !item.type) {
          collected.push({
            id: item.id,
            url: item.url,
            name: item.name,
            albumName: section.name,
          });
        }
      });
    });

    if (collected.length === 0) {
      return [
        { id: "def-1", url: "/images/Gemini_Generated_Image_arpro7arpro7arpr.png", name: "AI Hackathon Sprints", albumName: "Campus Moments" },
        { id: "def-2", url: "/images/ChatGPT Image Aug 14%2C 2026%2C 10_51_32 PM.png", name: "GPU Compute Labs", albumName: "Engineering" },
        { id: "def-3", url: "/images/collage_image_1_-.png", name: "Venture Incubation", albumName: "Founder Cohorts" },
        { id: "def-4", url: "/images/Gemini_Generated_Image_2pbwsu2pbwsu2pbw(1).png", name: "AI Robotics Workshop", albumName: "Workshops" },
      ];
    }
    return collected;
  }, [gallerySections]);

  // Extract leadership team members (prioritize faculty advisors & executive leadership)
  const leadershipList = React.useMemo(() => {
    if (landingContent?.teamMembers && landingContent.teamMembers.length > 0) {
      return landingContent.teamMembers;
    }
    if (team.length > 0) {
      return team.slice(0, 6).map((m) => ({
        id: m.id,
        name: m.name,
        role: m.role,
        image: m.image || "/images/rectangle-899.png",
      }));
    }
    return [
      {
        id: "tm-1",
        name: "Dr. Jayavrinda Vrindavanam",
        role: "Club Coordinator & Chairperson CSE (AI & ML)",
        image: "/images/rectangle-899.png",
      },
      {
        id: "tm-2",
        name: "Dr. M Lakshmanan",
        role: "Club Advisor",
        image: "/images/rectangle-898.png",
      },
      {
        id: "tm-3",
        name: "Dr. A. A. Nippun Kumaar",
        role: "Club Advisor",
        image: "/images/rectangle-902.png",
      },
    ];
  }, [landingContent, team]);

  // Active / dynamic events for Hackathons section
  const displayEvents = React.useMemo(() => {
    const active = events.filter((e) => e.showOnHome !== false);
    if (active.length > 0) return active;
    if (events.length > 0) return events.slice(0, 3);
    // Graceful fallbacks matching the user's template
    return [
      {
        id: "evt-escape-room",
        title: "Escape Room",
        description: "An adrenaline-fueled problem-solving challenge where teams decode cryptographic puzzles and test rapid AI logic under pressure.",
        date: new Date(Date.now() + 86400000 * 7).toISOString(),
        venue: "Innovation Hub, DSU Bengaluru",
        status: "upcoming" as const,
        image: "/images/Gemini_Generated_Image_arpro7arpro7arpr.png",
        isRegistrationOpen: true,
        registrationMode: "builtin" as const,
      },
      {
        id: "evt-24h-hackathon",
        title: "24 hour Hackothan",
        description: "A 24-hour team-based innovation challenge where DSU students identify a problem, develop a technology-driven solution, build a prototype, and present it to judges. It develops problem-solving, teamwork, innovation, time management, technical skills and communication through hands-on experience.",
        date: new Date(Date.now() + 86400000 * 14).toISOString(),
        venue: "Dept of CSE (AI & ML), DSU",
        status: "upcoming" as const,
        image: "/images/Gemini_Generated_Image_2pbwsu2pbwsu2pbw(1).png",
        isRegistrationOpen: true,
        registrationMode: "builtin" as const,
      },
    ];
  }, [events]);

  return (
    <div className="relative min-h-screen bg-[#FFFFE9] text-[#2D2E2A] selection:bg-[#ECFF17] selection:text-[#000000] font-inter">
      {/* ===== SECTION 2: BRAND MASTHEAD (RAISE AI) ===== */}
      <section
        id="comp-mtevbg5q"
        className="pt-28 sm:pt-36 pb-10 px-6 sm:px-12 lg:px-16 max-w-7xl mx-auto w-full flex flex-col md:flex-row items-center justify-between gap-8 border-b border-[#C6CCBD]/50"
      >
        <div className="flex-1 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ECFF17]/30 border border-[#2D2E2A]/15 text-[#2D2E2A] text-[11px] font-jetbrains font-bold uppercase tracking-wider">
            <Sparkles className="size-3 text-[#2D2E2A]" />
            <span>DAYANANDA SAGAR UNIVERSITY</span>
          </div>
          <h1 className="font-libre text-6xl sm:text-8xl lg:text-9xl font-normal tracking-tight text-[#2D2E2A] leading-none select-none">
            RAISE AI
          </h1>
        </div>

        {/* Brand Graphics & Badge */}
        <div className="flex items-center gap-6 sm:gap-8 shrink-0">
          <div className="relative w-36 sm:w-44 h-32 sm:h-36 rounded-3xl overflow-hidden border border-[#C6CCBD] bg-white/40 shadow-sm p-2 flex items-center justify-center">
            <img
              src="/images/Gemini_Generated_Image_2pbwsu2pbwsu2pbw(1).png"
              alt="RAISE AI Emblem"
              className="w-full h-full object-contain hover:scale-105 transition-transform duration-500"
            />
          </div>
          <div className="relative w-32 sm:w-40 h-28 sm:h-32 rounded-3xl overflow-hidden border border-[#C6CCBD] bg-white/40 shadow-sm p-2 flex items-center justify-center">
            <img
              src="/images/885b2a_a8bc1b62f8054b1d9ab6b20b04bb6afd~mv2.png"
              alt="AI Foundry Insignia"
              className="w-full h-full object-contain hover:scale-105 transition-transform duration-500"
            />
          </div>
        </div>
      </section>

      {/* ===== SECTION 3: HERO SECTION ===== */}
      <section
        id="comp-mtesnr40"
        className="py-16 sm:py-24 px-6 sm:px-12 lg:px-16 max-w-7xl mx-auto w-full space-y-8"
      >
        <div className="space-y-6 max-w-5xl">
          {landingContent?.heroBadge && landingContent.heroBadge.trim() !== "" && (
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#ECFF17]/40 border border-[#2D2E2A]/20 text-[#2D2E2A] text-[11px] font-jetbrains font-bold uppercase tracking-wider shadow-xs">
              <Sparkles className="size-3.5 text-[#2D2E2A]" />
              <span>{landingContent.heroBadge}</span>
            </div>
          )}

          <h2 className="font-libre text-3xl sm:text-5xl lg:text-6xl font-normal text-[#2D2E2A] leading-[1.15] tracking-tight uppercase">
            {landingContent?.heroTagline || heroTagline || "FORGING THE FUTURE OF ENTREPRENEURSHIP & ARTIFICIAL INTELLIGENCE"}
          </h2>

          <p className="font-inter text-base sm:text-xl text-[#424440] font-normal leading-relaxed max-w-3xl">
            {landingContent?.heroSubtext ||
              "Dayananda Sagar University's premier innovation ecosystem uniting engineers, designers, researchers, and student founders in artificial intelligence."}
          </p>

          <div className="pt-4 flex items-center gap-4">
            <Link
              href="/recruit"
              className="px-8 sm:px-10 py-4 rounded-full bg-[#2D2E2A] text-[#FFFFE9] font-jetbrains text-xs sm:text-sm font-bold uppercase tracking-widest hover:bg-[#000000] hover:scale-105 active:scale-95 transition-all duration-200 shadow-md inline-flex items-center gap-2.5 no-underline group"
            >
              <span>JoinUS</span>
              <ArrowUpRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>

            {visiblePages?.events !== false && (
              <Link
                href="/events"
                className="px-8 sm:px-10 py-4 rounded-full bg-white/60 border border-[#C6CCBD] text-[#2D2E2A] font-jetbrains text-xs sm:text-sm font-bold uppercase tracking-widest hover:bg-white hover:border-[#2D2E2A] hover:scale-105 active:scale-95 transition-all duration-200 shadow-xs inline-flex items-center gap-2 no-underline"
              >
                <span>Explore Events</span>
                <ArrowRight className="size-4" />
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* ===== SECTION 4: ABOUT US SECTION ===== */}
      <section
        id="about-section"
        className="py-16 sm:py-24 px-6 sm:px-12 lg:px-16 max-w-7xl mx-auto w-full border-t border-[#C6CCBD]/60"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-stretch">
          {/* Left Text Column */}
          <div className="lg:col-span-7 space-y-6 flex flex-col justify-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#2D2E2A]/5 border border-[#C6CCBD] text-[#2D2E2A] text-xs font-jetbrains font-semibold uppercase tracking-widest w-fit">
              <span>{landingContent?.aboutBadge || "ABOUT AI FOUNDRY"}</span>
            </div>

            <h2 className="font-libre text-3xl sm:text-5xl font-normal text-[#2D2E2A] tracking-tight">
              {landingContent?.aboutTitle || "About Us"}
            </h2>

            <div className="space-y-5 font-inter text-[#424440] text-sm sm:text-base leading-relaxed">
              <p>
                {landingContent?.aboutHeading ||
                  "AI Foundry is the go-to spot for student creators at Dayananda Sagar University. We turn cool campus ideas into real-world tech by giving you the right mentors, beastly GPU power, and a local community that helps you grow. It's where the future of AI hits the road."}
              </p>
              <p>
                {landingContent?.aboutSecondaryText ||
                  aboutText ||
                  "Whether you're fine-tuning custom LLMs, building autonomous agents, designing slick interfaces, or pitching your first venture, you won't be doing it alone. From late-night hackathons and hands-on build sprints to demo days in front of industry veterans, we give you the launchpad to stop just talking about AI and start shipping it."}
              </p>
            </div>
          </div>

          {/* Right Visual Column (Single featured image filling full space) */}
          <div className="lg:col-span-5 h-full flex">
            <div className="relative w-full h-80 sm:h-[420px] lg:h-full min-h-[360px] rounded-3xl overflow-hidden border border-[#C6CCBD] shadow-sm bg-white/40 group">
              <img
                src={normalizeImageUrl(landingContent?.aboutImage || "/images/Gemini_Generated_Image_arpro7arpro7arpr.png")}
                alt="About AI Foundry"
                className={`w-full h-full ${landingContent?.aboutImageFit === 'contain' ? 'object-contain' : 'object-cover'} ${landingContent?.aboutImagePosition === 'top' ? 'object-top' : landingContent?.aboutImagePosition === 'bottom' ? 'object-bottom' : 'object-center'} group-hover:scale-105 transition-transform duration-500`}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ===== SECTION 5: HACKATHONS, WORKSHOPS & SPRINTS ===== */}
      <section
        id="comp-mteq0t3g"
        className="py-16 sm:py-24 px-6 sm:px-12 lg:px-16 max-w-7xl mx-auto w-full border-t border-[#C6CCBD]/60"
      >
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
          <div className="space-y-2">
            <p className="font-jetbrains text-xs font-bold uppercase tracking-widest text-[#7A836F]">
              UPCOMING EVENTS &amp; SPRINTS
            </p>
            <h2 className="font-libre text-3xl sm:text-4xl lg:text-5xl font-bold text-[#2D2E2A] tracking-tight">
              Hackathons, Workshops &amp; Sprints
            </h2>
          </div>

          {visiblePages?.events !== false && (
            <Link
              href="/events"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full border border-[#C6CCBD] bg-white/60 hover:bg-white text-xs font-jetbrains font-bold uppercase tracking-wider text-[#2D2E2A] hover:scale-105 transition-all shadow-xs shrink-0 no-underline"
            >
              <span>View All Events</span>
              <ArrowRight className="size-3.5" />
            </Link>
          )}
        </div>

        {/* Dynamic Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {displayEvents.slice(0, 4).map((evt) => {
            const dateStr = new Date(evt.date).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            });

            const getEventRegistrationStatus = (e: EventData) => {
              const now = Date.now();
              if (e.status === "ended") {
                return { canApply: false, label: e.closedMessage || "Applications Closed", reason: "ended" };
              }
              if (e.registrationStartDate) {
                const startTime = new Date(e.registrationStartDate).getTime();
                if (!isNaN(startTime) && startTime > now) {
                  return { canApply: false, label: "Opening Soon", reason: "future" };
                }
              }
              if (e.registrationDeadline) {
                const deadlineTime = new Date(e.registrationDeadline).getTime();
                if (!isNaN(deadlineTime) && deadlineTime <= now) {
                  return { canApply: false, label: e.closedMessage || "Applications Closed", reason: "deadline_passed" };
                }
              }
              if (e.isRegistrationOpen === false) {
                return { canApply: false, label: e.closedMessage || "Applications Closed", reason: "closed" };
              }
              return {
                canApply: true,
                label: e.registrationMode === "external" ? "Register (External)" : "Register",
                reason: "open",
              };
            };

            const regStatus = getEventRegistrationStatus(evt);

            return (
              <div
                key={evt.id}
                className="bg-white/70 border border-[#C6CCBD] rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-sm hover:shadow-md transition-all duration-300 hover:border-[#2D2E2A]/40 group"
              >
                <div className="space-y-4">
                  {/* Top Badge & Date */}
                  <div className="flex items-center justify-between">
                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-jetbrains font-bold uppercase tracking-wider ${
                        !regStatus.canApply
                          ? "bg-[#2D2E2A]/10 text-[#5F6360]"
                          : "bg-[#ECFF17] text-[#2D2E2A] border border-[#2D2E2A]/20"
                      }`}
                    >
                      {evt.status}
                    </span>
                    <div className="flex items-center gap-1.5 text-xs text-[#5F6360] font-jetbrains">
                      <Calendar className="size-3.5" />
                      <span>{dateStr}</span>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="font-libre text-2xl sm:text-3xl font-bold text-[#2D2E2A] group-hover:underline underline-offset-4 leading-snug">
                    {evt.title}
                  </h3>

                  {/* Line Divider */}
                  <div className="w-full h-px bg-[#C6CCBD]/70 my-2" />

                  {/* Image */}
                  <div className="relative w-full h-52 sm:h-60 rounded-2xl overflow-hidden border border-[#C6CCBD]/80 bg-[#FFFFE9] shadow-inner">
                    <img
                      src={normalizeImageUrl(evt.homeImage || evt.image || "/images/Gemini_Generated_Image_arpro7arpro7arpr.png")}
                      alt={evt.title}
                      className={`w-full h-full ${evt.imageFit === 'contain' ? 'object-contain' : 'object-cover'} ${evt.imagePosition === 'top' ? 'object-top' : evt.imagePosition === 'bottom' ? 'object-bottom' : 'object-center'} group-hover:scale-105 transition-transform duration-500`}
                    />
                  </div>

                  {/* Description */}
                  <p className="font-inter text-xs sm:text-sm text-[#424440] leading-relaxed line-clamp-3">
                    {evt.description}
                  </p>

                  {/* Venue */}
                  <div className="flex items-center gap-1.5 text-xs text-[#5F6360] font-jetbrains pt-1">
                    <MapPin className="size-3.5 text-[#2D2E2A]" />
                    <span className="truncate">{evt.venue || "Dayananda Sagar University, Bengaluru"}</span>
                  </div>
                </div>

                {/* Registration Button */}
                <div className="pt-6 mt-4 border-t border-[#C6CCBD]/60">
                  {!regStatus.canApply ? (
                    <button
                      disabled
                      className={`w-full py-3 px-6 rounded-full font-jetbrains font-bold text-xs uppercase tracking-wider cursor-not-allowed ${
                        regStatus.reason === "future"
                          ? "bg-[#ECFF17]/40 text-[#2D2E2A] border border-[#2D2E2A]/20"
                          : "bg-[#C6CCBD]/40 text-[#7A836F] border-none"
                      }`}
                    >
                      <span>{regStatus.label}</span>
                    </button>
                  ) : evt.registrationMode === "external" && (evt.externalRegistrationUrl || evt.googleFormUrl) ? (
                    <a
                      href={evt.externalRegistrationUrl || evt.googleFormUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-3.5 px-6 rounded-full bg-[#2D2E2A] hover:bg-[#000000] text-[#FFFFE9] font-jetbrains font-bold text-xs uppercase tracking-wider shadow-sm hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 no-underline"
                    >
                      <span>Register (External)</span>
                      <ArrowUpRight className="size-4" />
                    </a>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setSelectedEvent(evt)}
                      className="w-full py-3.5 px-6 rounded-full bg-[#2D2E2A] hover:bg-[#000000] text-[#FFFFE9] font-jetbrains font-bold text-xs uppercase tracking-wider shadow-sm hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer border-none"
                    >
                      <span>Register</span>
                      <ArrowUpRight className="size-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ===== SECTION 6: LIFE AT AI FOUNDRY (ANIMATED MARQUEE GALLERY) ===== */}
      <section
        id="comp-mteq7uee"
        className="py-16 sm:py-24 border-t border-[#C6CCBD]/60 overflow-hidden"
      >
        <div className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-16 mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-2">
            <h2 className="font-libre text-3xl sm:text-4xl lg:text-5xl font-bold text-[#2D2E2A] tracking-tight">
              Life at AI Foundry
            </h2>
            <p className="font-jetbrains text-xs uppercase tracking-wider text-[#7A836F]">
              some compilation of images
            </p>
          </div>

          {visiblePages?.gallery !== false && (
            <Link
              href="/gallery"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full border border-[#C6CCBD] bg-white/60 hover:bg-white text-xs font-jetbrains font-bold uppercase tracking-wider text-[#2D2E2A] hover:scale-105 transition-all shadow-xs shrink-0 no-underline"
            >
              <span>View Full Gallery</span>
              <ArrowRight className="size-3.5" />
            </Link>
          )}
        </div>

        {/* Continuous Marquee Track */}
        <div className="w-full overflow-hidden py-4">
          <div className="flex gap-6 animate-marquee hover:[animation-play-state:paused] w-max">
            {[...marqueeImages, ...marqueeImages].map((img, idx) => (
              <div
                key={`${img.id}-${idx}`}
                className="flex-shrink-0 w-72 sm:w-88 h-64 sm:h-72 rounded-3xl border border-[#C6CCBD] overflow-hidden relative group bg-white/50 shadow-sm"
              >
                <img
                  src={normalizeImageUrl(img.url)}
                  alt={img.name || "AI Foundry Moment"}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#2D2E2A]/80 via-transparent to-transparent flex flex-col justify-end p-5 opacity-90 group-hover:opacity-100 transition-opacity">
                  <span className="font-libre text-sm font-bold text-[#FFFFE9] drop-shadow-sm line-clamp-1">
                    {img.name || "AI Foundry Moment"}
                  </span>
                  {img.albumName && (
                    <span className="font-jetbrains text-[10px] text-[#ECFF17] uppercase tracking-wider mt-0.5">
                      {img.albumName}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== SECTION 7: OUR APPROACH ===== */}
      <section
        id="comp-mob45nzu"
        className="py-16 sm:py-24 px-6 sm:px-12 lg:px-16 max-w-7xl mx-auto w-full border-t border-[#C6CCBD]/60 space-y-12"
      >
        <div className="space-y-3 max-w-3xl">
          <h3 className="font-jetbrains text-xs font-bold uppercase tracking-widest text-[#7A836F]">
            {landingContent?.approachHeading || "OUR APPROACH"}
          </h3>
          <h4 className="font-libre italic text-2xl sm:text-3xl lg:text-4xl text-[#2D2E2A] font-normal leading-snug">
            {landingContent?.approachSubtext ||
              "We foster a dynamic environment where students can transform their ideas into impactful AI and entrepreneurial ventures."}
          </h4>
        </div>

        {/* 4 Pillars Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {(landingContent?.approach && landingContent.approach.length > 0
            ? landingContent.approach
            : [
                {
                  id: "app1",
                  title: "Ideation & Problem Discovery",
                  description:
                    "We guide members from initial concepts to well-defined project proposals, encouraging creative problem-solving and patent exploration.",
                },
                {
                  id: "app2",
                  title: "Prototyping & GPU Compute",
                  description:
                    "Providing high-performance compute clusters, research lab access, and technical mentorship for rapid iteration.",
                },
                {
                  id: "app3",
                  title: "Venture Incubation & Launch",
                  description:
                    "Supporting student founders through legal incorporation, pitch deck polish, and demo day showcases to seed investors.",
                },
                {
                  id: "app4",
                  title: "Community & Knowledge Transfer",
                  description:
                    "Building an enduring alumni and mentor network, hosting weekly paper reading groups, and sharing open-source code.",
                },
              ]
          ).map((pillar, idx) => (
            <div
              key={pillar.id || idx}
              className="p-6 rounded-3xl bg-white/60 border border-[#C6CCBD] space-y-3 shadow-xs hover:border-[#2D2E2A]/40 transition-colors"
            >
              <span className="font-jetbrains text-xs font-bold text-[#7A836F] uppercase">
                {String(idx + 1).padStart(2, "0")}
              </span>
              <h4 className="font-libre text-xl font-bold text-[#2D2E2A]">
                {pillar.title}
              </h4>
              <p className="font-inter text-xs sm:text-sm text-[#424440] leading-relaxed">
                {pillar.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== SECTION 8: LEADERSHIP & ADVISORY ===== */}
      <section
        id="comp-mteqy7pu"
        className="py-16 sm:py-24 px-6 sm:px-12 lg:px-16 max-w-7xl mx-auto w-full border-t border-[#C6CCBD]/60 space-y-12"
      >
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-2">
            <p className="font-jetbrains text-xs font-bold uppercase tracking-widest text-[#7A836F]">
              MENTORSHIP &amp; GOVERNANCE
            </p>
            <h2 className="font-libre text-3xl sm:text-4xl lg:text-5xl font-bold text-[#2D2E2A] tracking-tight">
              LEADERSHIP &amp; ADVISORY
            </h2>
          </div>

          {visiblePages?.team !== false && (
            <Link
              href="/team"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full border border-[#C6CCBD] bg-white/60 hover:bg-white text-xs font-jetbrains font-bold uppercase tracking-wider text-[#2D2E2A] hover:scale-105 transition-all shadow-xs shrink-0 no-underline"
            >
              <span>View Full Team</span>
              <ArrowRight className="size-3.5" />
            </Link>
          )}
        </div>

        {/* Leadership Members Grid with Images & Typography */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {leadershipList.map((member) => (
            <div
              key={member.id}
              className="bg-white/70 border border-[#C6CCBD] rounded-3xl p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-all duration-300 hover:border-[#2D2E2A]/40 group"
            >
              <div className="relative w-full h-72 sm:h-80 rounded-2xl overflow-hidden mb-5 border border-[#C6CCBD]/70 bg-[#FFFFE9]">
                <img
                  src={normalizeImageUrl(member.image || "/images/rectangle-899.png")}
                  alt={member.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              <div className="space-y-1.5">
                <h4 className="font-libre text-xl sm:text-2xl font-bold text-[#2D2E2A] leading-snug">
                  {member.name}
                </h4>
                <p className="font-jetbrains text-xs font-semibold text-[#7A836F] uppercase tracking-wider">
                  {member.role}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== SECTION 9: FOOTER ===== */}
      <LightFooter visiblePages={visiblePages} socialLinks={socialLinks} />

      {/* Featured Event Registration Modal Dialog */}
      {selectedEvent && (
        <RegistrationModal
          event={selectedEvent}
          isOpen={true}
          onClose={() => setSelectedEvent(null)}
        />
      )}
    </div>
  );
}
