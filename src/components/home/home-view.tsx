"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { RegistrationModal } from "@/components/ui/registration-modal";
import { TeamMember, EventData, GallerySection, LandingCustomContent, SiteSocialLinks, VisiblePagesConfig } from "@/lib/data";
import { normalizeImageUrl } from "@/lib/image-helper";
import {
  Calendar,
  MapPin,
  ArrowRight,
  Sparkles,
  Rocket,
  Users,
  Compass,
} from "lucide-react";
import { LinkedinIcon, InstagramIcon, GithubIcon, TwitterIcon } from "@/components/ui/icons";

import { GravityCursorBackground } from "@/components/home/gravity-cursor-background";

interface HomeViewProps {
  events: EventData[];
  team: TeamMember[];
  gallerySections: GallerySection[];
  heroTagline: string;
  aboutText: string;
  landingContent?: LandingCustomContent;
  socialLinks?: SiteSocialLinks;
  visiblePages?: VisiblePagesConfig;
}

export function HomeView({
  events,
  team,
  gallerySections,
  heroTagline,
  aboutText,
  landingContent,
  socialLinks,
  visiblePages,
}: HomeViewProps) {
  const router = useRouter();
  const [selectedEvent, setSelectedEvent] = useState<EventData | null>(null);

  const navigateTo = (e: React.MouseEvent, href: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (href === "/about" || href === "#about-section") {
      const aboutEl = document.getElementById("about-section");
      if (aboutEl) {
        aboutEl.scrollIntoView({ behavior: "smooth" });
        return;
      }
    }
    router.push(href);
  };

  // Smooth Intersection Observer for Scroll-Reveal Animations
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Handle scroll to query param if present
    const urlParams = new URLSearchParams(window.location.search);
    const scrollToId = urlParams.get("scrollTo");
    if (scrollToId) {
      window.history.replaceState({}, document.title, window.location.pathname);
      if (scrollToId === "about") {
        setTimeout(() => {
          const aboutEl = document.getElementById("about-section");
          if (aboutEl) aboutEl.scrollIntoView({ behavior: "smooth" });
        }, 300);
      }
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-revealed");
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px -40px 0px",
      }
    );

    const elements = document.querySelectorAll(".reveal-on-scroll");
    elements.forEach((el) => observer.observe(el));

    return () => {
      elements.forEach((el) => observer.unobserve(el));
    };
  }, []);

  const facultyAdvisors = team.filter((m) => m.category === "faculty");

  // Collect all gallery images for the horizontal marquee
  const allGalleryImages = gallerySections.flatMap((sec) =>
    sec.items.map((item) => ({
      ...item,
      albumName: sec.name,
    }))
  );

  const marqueeImages =
    allGalleryImages.length > 0
      ? allGalleryImages
      : [
          { id: "img-1", name: "Event Photograph", url: "/images/rectangle-899.png", albumName: "Inaugural ceremony and teams" },
          { id: "img-2", name: "Event Photograph", url: "/images/rectangle-902.png", albumName: "Inaugural ceremony and teams" },
          { id: "img-3", name: "Event Photograph", url: "/images/rectangle-898.png", albumName: "Inaugural ceremony and teams" },
          { id: "img-4", name: "Team", url: "/images/image-1929.png", albumName: "Inaugural ceremony and teams" },
          { id: "img-5", name: "leads", url: "/images/rectangle-5.png", albumName: "Inaugural ceremony and teams" },
          { id: "img-6", name: "Event Photograph", url: "/images/rectangle-8.png", albumName: "Inaugural ceremony and teams" },
        ];

  // Dynamic Pillars
  const pillarsList = landingContent?.pillars && landingContent.pillars.length > 0
    ? landingContent.pillars
    : [
        {
          id: "p1",
          title: "Innovation",
          description: "We encourage groundbreaking ideas and provide GPU compute, lab access, and development toolkits for members to explore the frontiers of AI.",
          icon: "Rocket",
        },
        {
          id: "p2",
          title: "Collaboration",
          description: "We believe in the power of diverse minds working together, fostering a supportive cross-disciplinary environment for peer learning and growth.",
          icon: "Users",
        },
        {
          id: "p3",
          title: "Impact",
          description: "Our projects aim to solve real-world problems, making a tangible difference across healthcare, robotics, education, and venture incubation.",
          icon: "Compass",
        },
      ];

  // Dynamic Approach Steps (5 Steps)
  const approachList = landingContent?.approach && landingContent.approach.length > 0
    ? landingContent.approach
    : [
        {
          id: "app1",
          title: "1. Ideation",
          description: "We guide members from initial concepts to well-defined project proposals, encouraging creative problem-solving and venture scoping.",
          image: "/images/rectangle-5.png",
        },
        {
          id: "app2",
          title: "2. Development",
          description: "Providing tools, GPU compute clusters, mentorship, and a collaborative space for building production-grade AI solutions.",
        },
        {
          id: "app3",
          title: "3. Launch",
          description: "Supporting projects through deployment, venture accelerator pitch demo days, and continuous real-world user testing.",
          image: "/images/map.png",
        },
        {
          id: "app4",
          title: "4. Mentorship",
          description: "Connecting students with faculty advisors and industry executives for deep architectural and venture guidance.",
        },
        {
          id: "app5",
          title: "5. Community & Growth",
          description: "Building a strong, lifelong alumni and student network across Bangalore's tech ecosystem, fostering peer collaboration and opportunities.",
          image: "/images/rectangle-8.png",
        },
      ];

  // Dynamic Process Steps (4 Steps)
  const processList = landingContent?.process && landingContent.process.length > 0
    ? landingContent.process
    : [
        { num: "01", title: "Idea Generation", desc: "Brainstorming and refining concepts within our collaborative workshops and 24-hour hackathons." },
        { num: "02", title: "Team Formation", desc: "Connecting students with complementary technical and design skills to form interdisciplinary squads." },
        { num: "03", title: "Project Incubation", desc: "Providing GPU compute, mentorship, and a supportive environment for full-stack prototype development." },
        { num: "04", title: "Showcase & Launch", desc: "Presenting completed projects to the tech community, investors, and supporting venture deployment." },
      ];

  // Dynamic Stats (6 Metrics)
  const statsConfig = landingContent?.stats || {
    members: "50+",
    membersLabel: "Active Members",
    projects: "15+",
    projectsLabel: "Successful Sprints",
    duration: "1 Year",
    durationLabel: "Since Inception",
    mentors: "20+",
    mentorsLabel: "Industry Mentors",
    costReduction: "50%",
    costReductionLabel: "Build Time Saved",
    innovationHours: "500+ hrs",
    innovationHoursLabel: "Innovation Time",
  };

  // Dynamic Team Members for Landing Page
  const leadershipList = landingContent?.teamMembers && landingContent.teamMembers.length > 0
    ? landingContent.teamMembers
    : [
        {
          id: "tm-1",
          name: facultyAdvisors[0]?.name || "Dr. Jayavrinda Vrindavanam",
          role: facultyAdvisors[0]?.role || "Club Coordinator & Chairperson CSE (AI & ML)",
          image: "/images/rectangle-899.png",
        },
        {
          id: "tm-2",
          name: facultyAdvisors[1]?.name || "Dr. M Lakshmanan",
          role: facultyAdvisors[1]?.role || "Club Advisor",
          image: "/images/rectangle-898.png",
        },
        {
          id: "tm-3",
          name: "Dr. A. A. Nippun Kumaar",
          role: "Club Advisor",
          image: "/images/rectangle-902.png",
        },
      ];

  // Social URLs
  const linkedinUrl = socialLinks?.linkedin || "https://linkedin.com/";
  const instagramUrl = socialLinks?.instagram || "https://instagram.com/";
  const githubUrl = socialLinks?.github || "https://github.com/";
  const twitterUrl = socialLinks?.twitter || "https://x.com/";
  const emailContact = socialLinks?.email || "info@aifoundry.com";

  return (
    <div className="relative min-h-screen bg-[#F8FAFC] text-slate-900 overflow-x-hidden selection:bg-cyan-500 selection:text-black">
      {/* Interactive Physics Gravity & Cursor Attractor Background */}
      <GravityCursorBackground />

      {/* Background Ambient Radial Mesh */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-blue-200/30 rounded-full blur-[120px]" />
        <div className="absolute top-1/3 -right-40 w-[550px] h-[550px] bg-indigo-200/25 rounded-full blur-[130px]" />
        <div className="absolute -bottom-40 left-1/3 w-[650px] h-[650px] bg-cyan-200/20 rounded-full blur-[140px]" />
      </div>

      <div className="relative z-10 w-full">
        {/* ===== SLIDE 1: HERO SECTION ===== */}
        <section className="relative min-h-[92vh] flex flex-col justify-between items-center px-4 sm:px-8 pt-32 pb-12 max-w-7xl mx-auto w-full">
          {/* Top subtle badge */}
          <div className="reveal-on-scroll is-revealed inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold bg-white/90 text-blue-700 border border-slate-200 shadow-sm backdrop-blur-md mb-6 tracking-wide">
            <Sparkles className="size-3.5 text-blue-600 animate-pulse" />
            <span>{landingContent?.heroBadge || "DSU PREMIER AI & VENTURE ACCELERATOR"}</span>
          </div>

          {/* Main Hero Title & Tagline */}
          <div className="flex flex-col items-center text-center max-w-5xl my-auto space-y-6">
            <h1 className="reveal-on-scroll reveal-delay-100 is-revealed text-4xl sm:text-6xl md:text-7xl font-extrabold text-slate-950 tracking-tight leading-[1.08]">
              {landingContent?.heroTagline || heroTagline || "FORGING THE FUTURE OF ENTREPRENEURSHIP & ARTIFICIAL INTELLIGENCE"}
            </h1>

            <p className="reveal-on-scroll reveal-delay-200 is-revealed text-slate-600 text-base sm:text-lg md:text-xl font-normal max-w-2xl leading-relaxed">
              {landingContent?.heroSubtext ||
                "Dayananda Sagar University's flagship innovation hub empowering student founders, engineers, and researchers to build and launch cutting-edge AI ventures."}
            </p>

            {/* Action Buttons */}
            <div className="reveal-on-scroll reveal-delay-300 is-revealed flex flex-wrap items-center justify-center gap-4 pt-4">
              {visiblePages?.recruit !== false && (
                <a
                  href="/recruit"
                  onClick={(e) => navigateTo(e, "/recruit")}
                  className="no-underline cursor-pointer transition-all hover:scale-105 inline-flex items-center gap-2.5 px-8 py-4 bg-slate-900 text-white font-bold text-sm sm:text-base rounded-xl shadow-xl shadow-slate-900/15 hover:bg-slate-800"
                >
                  <span>Join AI Foundry</span>
                  <ArrowRight className="size-4" />
                </a>
              )}

              {visiblePages?.events !== false && (
                <a
                  href="/events"
                  onClick={(e) => navigateTo(e, "/events")}
                  className="no-underline cursor-pointer transition-all hover:scale-105 inline-flex items-center gap-2.5 px-8 py-4 bg-white/90 text-slate-900 font-bold text-sm sm:text-base rounded-xl border border-slate-200 shadow-sm hover:bg-white backdrop-blur-md"
                >
                  <span>Explore Events</span>
                  <Calendar className="size-4 text-blue-600" />
                </a>
              )}
            </div>
          </div>

          {/* Bottom Indicators */}
          <div className="reveal-on-scroll reveal-delay-400 is-revealed w-full flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t border-slate-200/60 text-xs text-slate-500 font-mono">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping"></span>
              <span className="font-semibold uppercase tracking-widest text-slate-600">Scroll down to explore</span>
            </div>
            <div className="text-center sm:text-right font-medium max-w-md">
              {landingContent?.heroDepartment || "School of Engineering • Department of AI & Robotics • DSU Bengaluru"}
            </div>
          </div>
        </section>

        {/* ===== SLIDE 2: ABOUT US SECTION ===== */}
        <section id="about-section" className="py-24 px-4 sm:px-8 max-w-7xl mx-auto w-full">
          <div className="reveal-on-scroll bg-white/90 backdrop-blur-xl border border-slate-200/90 rounded-3xl p-8 sm:p-14 shadow-xl shadow-slate-100/70 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-blue-100/40 via-amber-100/30 to-transparent rounded-full blur-3xl -z-10" />

            <div className="max-w-4xl space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-widest bg-amber-50 text-amber-700 border border-amber-200 font-mono">
                {landingContent?.aboutBadge || "ABOUT AI FOUNDRY"}
              </div>

              <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
                {landingContent?.aboutHeading ||
                  aboutText ||
                  "AI Foundry is the premier student innovation ecosystem established under the Department of Computer Science & Engineering (AI & ML) at Dayananda Sagar University (DSU), Bengaluru."}
              </h2>

              <p className="text-slate-600 text-base sm:text-lg leading-relaxed font-normal">
                {landingContent?.aboutSecondaryText ||
                  landingContent?.aboutText ||
                  "AI Foundry is Dayananda Sagar University's flagship technology accelerator and student innovation hub. We bridge the gap between academic exploration and high-impact AI ventures by providing hands-on mentorship, enterprise GPU compute, and a collaborative workspace."}
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-4">
                {visiblePages?.recruit !== false && (
                  <a
                    href="/recruit"
                    onClick={(e) => navigateTo(e, "/recruit")}
                    className="no-underline cursor-pointer transition-transform hover:scale-105 inline-flex items-center gap-2 px-6 py-3.5 bg-slate-900 text-white font-bold text-sm rounded-xl shadow-md hover:bg-slate-800"
                  >
                    <span>Join Our Community</span>
                    <ArrowRight className="size-4" />
                  </a>
                )}
                {visiblePages?.team !== false && (
                  <a
                    href="/team"
                    onClick={(e) => navigateTo(e, "/team")}
                    className="no-underline cursor-pointer transition-transform hover:scale-105 inline-flex items-center gap-2 px-6 py-3.5 bg-white text-slate-800 font-bold text-sm rounded-xl border border-slate-200 shadow-sm hover:bg-slate-50"
                  >
                    <span>Meet The Leadership</span>
                    <Users className="size-4 text-blue-600" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ===== SLIDE 3: UPCOMING EVENTS & HACKATHONS ===== */}
        <section className="py-20 px-4 sm:px-8 max-w-7xl mx-auto w-full">
          <div className="reveal-on-scroll flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-widest bg-blue-50 text-blue-700 border border-blue-200 font-mono mb-3">
                UPCOMING EVENTS &amp; SPRINTS
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
                Hackathons, Workshops &amp; Sprints
              </h2>
            </div>
            {visiblePages?.events !== false && (
              <Link
                href="/events"
                className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors uppercase tracking-wider font-mono group"
              >
                <span>View All Events</span>
                <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            )}
          </div>

          {/* Event Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events
              .filter((e) => e.showOnHome !== false)
              .slice(0, 3)
              .map((evt, idx) => {
                const dateStr = new Date(evt.date).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                });

                const isEnded = evt.status === "ended" || evt.isRegistrationOpen === false;
                const isFutureStart = evt.registrationStartDate && new Date(evt.registrationStartDate).getTime() > Date.now();
                const isPastDeadline = evt.registrationDeadline && new Date(evt.registrationDeadline).getTime() < Date.now();
                const isClosed = isEnded || isPastDeadline;

                return (
                  <div
                    key={evt.id}
                    className={`reveal-on-scroll reveal-delay-${(idx + 1) * 100} min-h-[480px] flex flex-col justify-between p-7 sm:p-8 rounded-3xl bg-white/90 backdrop-blur-xl border border-slate-200/90 shadow-lg shadow-slate-100/60 transition-all duration-300 hover:shadow-2xl hover:border-blue-300 group`}
                  >
                    <div className="w-full flex flex-col">
                      {/* Status & Date */}
                      <div className="flex items-center justify-between w-full mb-4">
                        <span
                          className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider font-mono shadow-sm ${
                            isClosed
                              ? "bg-slate-100 text-slate-600 border border-slate-200"
                              : "bg-blue-50 text-blue-700 border border-blue-200"
                          }`}
                        >
                          {evt.status}
                        </span>
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono font-medium">
                          <Calendar className="size-3.5 text-blue-600" />
                          <span>{dateStr}</span>
                        </div>
                      </div>

                      {/* Title */}
                      <h3 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug group-hover:text-blue-600 transition-colors line-clamp-2 mb-4">
                        {evt.title}
                      </h3>

                      {/* Image */}
                      <div className="relative w-full h-44 rounded-2xl overflow-hidden mb-4 border border-slate-200 bg-slate-100 shadow-inner">
                        <img
                          src={normalizeImageUrl(evt.image)}
                          alt={evt.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>

                      {/* Description */}
                      <p className="text-slate-600 text-xs sm:text-sm font-normal leading-relaxed line-clamp-3 mb-4">
                        {evt.description}
                      </p>

                      {/* Venue */}
                      <div className="flex items-center gap-1.5 text-xs text-slate-600 font-mono font-medium mb-2">
                        <MapPin className="size-3.5 text-blue-600 flex-shrink-0" />
                        <span className="truncate">{evt.venue}</span>
                      </div>
                    </div>

                    {/* Registration Button / Status */}
                    <div className="pt-4 mt-2 border-t border-slate-100 w-full flex justify-center">
                      {isClosed ? (
                        <button
                          disabled
                          className="w-full flex items-center justify-center gap-2 py-3.5 px-6 bg-slate-200 text-slate-500 rounded-xl font-bold text-sm cursor-not-allowed border-none shadow-none"
                        >
                          <span>{evt.closedMessage || "Applications Closed"}</span>
                        </button>
                      ) : isFutureStart ? (
                        <button
                          disabled
                          className="w-full flex items-center justify-center gap-2 py-3.5 px-6 bg-amber-50 text-amber-800 border border-amber-200 rounded-xl font-bold text-sm cursor-not-allowed"
                        >
                          <span>Opening Soon</span>
                        </button>
                      ) : evt.registrationMode === "external" && (evt.externalRegistrationUrl || evt.googleFormUrl) ? (
                        <a
                          href={evt.externalRegistrationUrl || evt.googleFormUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="no-underline cursor-pointer transition-transform hover:scale-105 w-full flex items-center justify-center gap-2 py-3.5 px-6 bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-md font-bold text-sm"
                        >
                          <span>Register (External)</span>
                          <ArrowRight className="size-4" />
                        </a>
                      ) : (
                        <button
                          onClick={() => setSelectedEvent(evt)}
                          className="cursor-pointer transition-transform hover:scale-105 w-full flex items-center justify-center gap-2 py-3.5 px-6 bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-md font-bold text-sm border-none"
                        >
                          <span>Register Now</span>
                          <ArrowRight className="size-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        </section>

        {/* ===== SLIDE 4: OUR PILLARS ===== */}
        <section className="py-20 px-4 sm:px-8 max-w-7xl mx-auto w-full">
          <div className="reveal-on-scroll flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-widest bg-amber-50 text-amber-700 border border-amber-200 font-mono mb-3">
                OUR PILLARS
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
                {landingContent?.pillarsHeading || "Our approach to innovation is built on three core strategies."}
              </h2>
            </div>
            <p className="text-slate-600 text-sm sm:text-base max-w-md font-normal">
              {landingContent?.pillarsSubtext || "Empowering students to lead in AI and entrepreneurship, fostering real-world impact and future-ready skills."}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pillarsList.map((pillar, pIdx) => {
              const iconStyles = [
                { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-600", Icon: Rocket },
                { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-600", Icon: Users },
                { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-600", Icon: Compass },
              ][pIdx % 3];

              const IconComponent = iconStyles.Icon;

              return (
                <div
                  key={pillar.id || pIdx}
                  className={`reveal-on-scroll reveal-delay-${(pIdx + 1) * 100} bg-white/90 backdrop-blur-xl border border-slate-200/90 rounded-3xl p-8 shadow-lg shadow-slate-100/60 flex flex-col justify-between transition-transform hover:scale-105`}
                >
                  <div className={`w-12 h-12 rounded-2xl ${iconStyles.bg} border ${iconStyles.border} flex items-center justify-center mb-6 ${iconStyles.text}`}>
                    <IconComponent className="size-6" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-3">{pillar.title}</h3>
                    <p className="text-slate-600 text-sm leading-relaxed">
                      {pillar.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ===== SLIDE 5: MOMENTS & ARCHIVES (HORIZONTAL MARQUEE) ===== */}
        <section className="py-20 px-4 sm:px-8 max-w-7xl mx-auto w-full">
          <div className="reveal-on-scroll flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-widest bg-blue-50 text-blue-700 border border-blue-200 font-mono mb-3">
                MOMENTS &amp; ARCHIVES
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
                Life at AI Foundry
              </h2>
            </div>
            {visiblePages?.gallery !== false && (
              <Link
                href="/gallery"
                className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors uppercase tracking-wider font-mono group"
              >
                <span>View Full Gallery</span>
                <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            )}
          </div>

          {/* Marquee Track Container */}
          <div className="reveal-on-scroll reveal-delay-200 w-full overflow-hidden py-4">
            <div className="flex gap-6 animate-[marquee_25s_linear_infinite] hover:[animation-play-state:paused] w-max">
              {[...marqueeImages, ...marqueeImages].map((img, idx) => (
                <div
                  key={`${img.id}-${idx}`}
                  className="flex-shrink-0 w-72 sm:w-80 h-52 rounded-2xl border border-slate-200/90 overflow-hidden relative group transition-transform duration-300 hover:scale-105 shadow-md bg-white"
                >
                  <img
                    src={normalizeImageUrl(img.url)}
                    alt={img.name || "Club Moment"}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent flex flex-col justify-end p-4 transition-opacity duration-300">
                    <span className="text-xs font-bold text-white uppercase tracking-wider font-mono drop-shadow-sm">
                      {img.name || "Club Moment"}
                    </span>
                    {img.albumName && (
                      <span className="text-[10px] text-cyan-300 font-mono font-semibold mt-0.5">
                        {img.albumName}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== SLIDE 6: OUR APPROACH & JOURNEY ===== */}
        <section className="py-20 px-4 sm:px-8 max-w-7xl mx-auto w-full">
          <div className="reveal-on-scroll mb-12">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-widest bg-amber-50 text-amber-700 border border-amber-200 font-mono mb-3">
              OUR APPROACH
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
              {landingContent?.approachHeading || "Where your ambition meets innovation."}
            </h2>
            <p className="text-slate-600 text-base max-w-2xl mt-4 font-normal">
              {landingContent?.approachSubtext || "We foster a dynamic environment where students can transform their ideas into impactful AI and entrepreneurial ventures."}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {approachList.map((step, sIdx) => {
              const isWide = sIdx === 4;
              return (
                <div
                  key={step.id || sIdx}
                  className={`reveal-on-scroll reveal-delay-${(sIdx + 1) * 100} bg-white/90 backdrop-blur-xl border border-slate-200/90 rounded-3xl p-6 shadow-md hover:shadow-xl transition-all ${
                    isWide ? "md:col-span-2 lg:col-span-2" : ""
                  }`}
                >
                  {step.image ? (
                    <div className="relative w-full h-40 rounded-2xl overflow-hidden mb-4 border border-slate-200">
                      <img src={step.image} alt={step.title} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center mb-4 text-blue-600 font-bold font-mono">
                      {String(sIdx + 1).padStart(2, "0")}
                    </div>
                  )}
                  <h3 className="text-xl font-bold text-slate-900 mb-2">{step.title}</h3>
                  <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                    {step.description}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* ===== SLIDE 7: PROCESS ===== */}
        <section className="py-20 px-4 sm:px-8 max-w-7xl mx-auto w-full">
          <div className="reveal-on-scroll mb-12">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-widest bg-blue-50 text-blue-700 border border-blue-200 font-mono mb-3">
              OUR PROCESS
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
              {landingContent?.processHeading || "How we forge the future."}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {processList.map((p, idx) => (
              <div
                key={p.id || idx}
                className={`reveal-on-scroll reveal-delay-${(idx + 1) * 100} bg-white/90 backdrop-blur-xl border border-slate-200/90 rounded-3xl p-6 shadow-md hover:shadow-xl transition-all flex flex-col justify-between`}
              >
                <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center font-mono font-bold text-blue-700 mb-6">
                  {p.num}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">{p.title}</h3>
                  <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ===== SLIDE 8: CLUB STATS ===== */}
        <section className="py-20 px-4 sm:px-8 max-w-7xl mx-auto w-full">
          <div className="reveal-on-scroll bg-white/90 backdrop-blur-xl border border-slate-200/90 rounded-3xl p-8 sm:p-14 shadow-xl shadow-slate-100/70">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
              <div>
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-widest bg-blue-50 text-blue-700 border border-blue-200 font-mono mb-3">
                  CLUB STATS
                </div>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
                  {landingContent?.statsHeading || "We're building a vibrant ecosystem."}
                </h2>
              </div>
              {visiblePages?.recruit !== false && (
                <a
                  href="/recruit"
                  onClick={(e) => navigateTo(e, "/recruit")}
                  className="no-underline cursor-pointer transition-transform hover:scale-105 inline-flex items-center gap-2 px-6 py-3.5 bg-slate-900 text-white font-bold text-sm rounded-xl shadow-md hover:bg-slate-800"
                >
                  <span>Join AI Foundry</span>
                  <ArrowRight className="size-4" />
                </a>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 text-center">
              {[
                { val: statsConfig.members || "50+", label: statsConfig.membersLabel || "Active Members", color: "text-slate-900" },
                { val: statsConfig.projects || "15+", label: statsConfig.projectsLabel || "Successful Sprints", color: "text-blue-600" },
                { val: statsConfig.duration || "1 Year", label: statsConfig.durationLabel || "Since Inception", color: "text-slate-900" },
                { val: statsConfig.mentors || "20+", label: statsConfig.mentorsLabel || "Industry Mentors", color: "text-amber-600" },
                { val: statsConfig.costReduction || "50%", label: statsConfig.costReductionLabel || "Build Time Saved", color: "text-slate-900" },
                { val: statsConfig.innovationHours || "500+ hrs", label: statsConfig.innovationHoursLabel || "Innovation Time", color: "text-indigo-600" },
              ].map((s, idx) => (
                <div
                  key={idx}
                  className={`reveal-on-scroll reveal-delay-${(idx + 1) * 100} bg-slate-50/90 border border-slate-200/80 rounded-2xl p-6 shadow-sm`}
                >
                  <div className={`text-3xl sm:text-4xl font-black ${s.color} tracking-tight mb-2 font-mono`}>
                    {s.val}
                  </div>
                  <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== SLIDE 9: LEADERSHIP & FACULTY ===== */}
        <section className="py-20 px-4 sm:px-8 max-w-7xl mx-auto w-full">
          <div className="reveal-on-scroll flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <p className="text-xs sm:text-sm font-mono text-slate-500 mb-1">Meet the minds behind AI Foundry</p>
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-widest bg-amber-50 text-amber-700 border border-amber-200 font-mono mb-3">
                {landingContent?.teamSubheading || "LEADERSHIP & ADVISORY"}
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
                {landingContent?.teamHeading || "Meet the minds behind AI Foundry."}
              </h2>
            </div>
            {visiblePages?.team !== false && (
              <Link
                href="/team"
                className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors uppercase tracking-wider font-mono group"
              >
                <span>View Full Team</span>
                <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {leadershipList.slice(0, 3).map((member, idx) => (
              <div
                key={member.id || idx}
                className={`reveal-on-scroll reveal-delay-${(idx + 1) * 100} bg-white/90 backdrop-blur-xl border border-slate-200/90 rounded-3xl p-6 shadow-lg shadow-slate-100/60 flex flex-col justify-between group transition-transform hover:scale-105`}
              >
                <div className="relative w-full h-64 rounded-2xl overflow-hidden mb-6 border border-slate-200 bg-slate-100">
                  <img
                    src={member.image || "/images/rectangle-899.png"}
                    alt={member.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                    {member.name}
                  </h3>
                  <p className="text-xs sm:text-sm font-mono text-slate-500 mt-1">
                    {member.role}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ===== SLIDE 10: CALL TO ACTION ===== */}
        <section className="py-20 px-4 sm:px-8 max-w-7xl mx-auto w-full">
          <div className="reveal-on-scroll bg-gradient-to-r from-blue-600 via-indigo-600 to-slate-900 rounded-3xl p-10 sm:p-16 text-center text-white shadow-2xl relative overflow-hidden">
            <div className="relative z-10 max-w-3xl mx-auto space-y-6">
              <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
                {landingContent?.ctaHeading || "Ready to forge the future?"}
              </h2>
              <p className="text-blue-100 text-base sm:text-lg max-w-xl mx-auto">
                {landingContent?.ctaDescription ||
                  "Join Dayananda Sagar University's premier venture and AI club. Build, collaborate, and launch alongside elite engineers."}
              </p>
              {visiblePages?.recruit !== false && (
                <div className="pt-4 flex justify-center">
                  <a
                    href="/recruit"
                    onClick={(e) => navigateTo(e, "/recruit")}
                    className="no-underline cursor-pointer transition-transform hover:scale-105 inline-flex items-center gap-2.5 px-8 py-4 bg-white text-slate-900 font-extrabold text-base rounded-xl shadow-xl hover:bg-slate-50"
                  >
                    <span>{landingContent?.ctaButtonText || "Apply to Join Us"}</span>
                    <ArrowRight className="size-5" />
                  </a>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ===== LIGHT GLASS FOOTER ===== */}
        <footer className="w-full border-t border-slate-200/90 bg-white/90 backdrop-blur-xl text-slate-800">
          <div className="max-w-7xl mx-auto w-full px-6 sm:px-10 lg:px-12 py-16 lg:py-20">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-16 pb-16 border-b border-slate-200">
              {/* Brand & College Info */}
              <div className="md:col-span-5 space-y-6">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-full overflow-hidden border border-blue-300 relative shadow-sm">
                    <img src="/club-logo.png" alt="AI Foundry" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <span className="text-2xl font-bold tracking-wider text-slate-900 font-mono block">
                      AI FOUNDRY
                    </span>
                    <span className="text-[11px] uppercase tracking-widest text-slate-500 font-mono">
                      RAISE AI CLUB &bull; DSU
                    </span>
                  </div>
                </div>

                <p className="text-slate-600 text-sm sm:text-base font-normal leading-relaxed max-w-md">
                  Dayananda Sagar University&apos;s flagship technology accelerator and student innovation hub, uniting engineers, researchers, and student founders.
                </p>

                <div className="space-y-2.5 text-xs text-slate-600 font-mono">
                  <div className="flex items-start gap-2.5">
                    <MapPin className="size-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span>School of Engineering &bull; Dept of AI &amp; Robotics<br />Innovation Center, Kudlu Gate, Hosur Road, Bengaluru - 560068</span>
                  </div>
                  <div className="flex items-center gap-2.5 pt-1">
                    <LinkedinIcon className="size-4 text-blue-600 flex-shrink-0" />
                    <a href={`mailto:${emailContact}`} className="hover:text-blue-600 text-slate-700 transition-colors no-underline">
                      {emailContact}
                    </a>
                  </div>
                </div>
              </div>

              {/* Navigation Column */}
              <div className="md:col-span-2 space-y-4">
                <p className="text-xs font-bold uppercase tracking-widest text-blue-600 font-mono">
                  Navigation
                </p>
                <ul className="space-y-3 text-sm text-slate-600 font-medium">
                  {visiblePages?.about !== false && (
                    <li>
                      <a href="/about" onClick={(e) => navigateTo(e, "/about")} className="hover:text-blue-600 transition-colors no-underline block py-0.5 cursor-pointer">
                        About Us
                      </a>
                    </li>
                  )}
                  {visiblePages?.events !== false && (
                    <li>
                      <a href="/events" onClick={(e) => navigateTo(e, "/events")} className="hover:text-blue-600 transition-colors no-underline block py-0.5 cursor-pointer">
                        Events &amp; Hackathons
                      </a>
                    </li>
                  )}
                  {visiblePages?.team !== false && (
                    <li>
                      <a href="/team" onClick={(e) => navigateTo(e, "/team")} className="hover:text-blue-600 transition-colors no-underline block py-0.5 cursor-pointer">
                        Leadership &amp; Faculty
                      </a>
                    </li>
                  )}
                  {visiblePages?.gallery !== false && (
                    <li>
                      <a href="/gallery" onClick={(e) => navigateTo(e, "/gallery")} className="hover:text-blue-600 transition-colors no-underline block py-0.5 cursor-pointer">
                        Media &amp; Archives
                      </a>
                    </li>
                  )}
                  {visiblePages?.recruit !== false && (
                    <li>
                      <a href="/recruit" onClick={(e) => navigateTo(e, "/recruit")} className="hover:text-blue-600 transition-colors no-underline block py-0.5 cursor-pointer">
                        Join AI Foundry
                      </a>
                    </li>
                  )}
                </ul>
              </div>

              {/* Initiatives Column */}
              <div className="md:col-span-2 space-y-4">
                <p className="text-xs font-bold uppercase tracking-widest text-blue-600 font-mono">
                  Initiatives
                </p>
                <ul className="space-y-3 text-sm text-slate-600 font-medium">
                  {visiblePages?.events !== false && (
                    <li>
                      <a href="/events" onClick={(e) => navigateTo(e, "/events")} className="hover:text-blue-600 transition-colors no-underline block py-0.5 cursor-pointer">
                        24h Hackathons
                      </a>
                    </li>
                  )}
                  {visiblePages?.recruit !== false && (
                    <li>
                      <a href="/recruit" onClick={(e) => navigateTo(e, "/recruit")} className="hover:text-blue-600 transition-colors no-underline block py-0.5 cursor-pointer">
                        AI Incubation Lab
                      </a>
                    </li>
                  )}
                  {visiblePages?.about !== false && (
                    <li>
                      <a href="/about" onClick={(e) => navigateTo(e, "/about")} className="hover:text-blue-600 transition-colors no-underline block py-0.5 cursor-pointer">
                        Student Research
                      </a>
                    </li>
                  )}
                  {visiblePages?.team !== false && (
                    <li>
                      <a href="/team" onClick={(e) => navigateTo(e, "/team")} className="hover:text-blue-600 transition-colors no-underline block py-0.5 cursor-pointer">
                        Mentorship Network
                      </a>
                    </li>
                  )}
                </ul>
              </div>

              {/* Socials & Connect */}
              <div className="md:col-span-3 space-y-4">
                <p className="text-xs font-bold uppercase tracking-widest text-blue-600 font-mono">
                  Connect &amp; Follow
                </p>
                <ul className="space-y-3 text-sm text-slate-600 font-medium">
                  <li>
                    <a href={linkedinUrl} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 transition-colors no-underline inline-flex items-center gap-2.5 py-0.5">
                      <LinkedinIcon className="size-4 text-blue-600" />
                      <span>LinkedIn</span>
                    </a>
                  </li>
                  <li>
                    <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 transition-colors no-underline inline-flex items-center gap-2.5 py-0.5">
                      <InstagramIcon className="size-4 text-blue-600" />
                      <span>Instagram</span>
                    </a>
                  </li>
                  <li>
                    <a href={githubUrl} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 transition-colors no-underline inline-flex items-center gap-2.5 py-0.5">
                      <GithubIcon className="size-4 text-blue-600" />
                      <span>GitHub</span>
                    </a>
                  </li>
                  <li>
                    <a href={twitterUrl} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 transition-colors no-underline inline-flex items-center gap-2.5 py-0.5">
                      <TwitterIcon className="size-4 text-blue-600" />
                      <span>X (Twitter)</span>
                    </a>
                  </li>
                </ul>
              </div>
            </div>

            {/* Bottom Copyright Bar */}
            <div className="pt-10 flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-slate-500 font-mono">
              <p>&copy; {new Date().getFullYear()} AI Foundry (RAISE AI CLUB). Dayananda Sagar University. All rights reserved.</p>
              <p className="text-blue-600 font-semibold">Forging Future Innovators in AI &amp; Entrepreneurship</p>
            </div>
          </div>
        </footer>
      </div>

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
