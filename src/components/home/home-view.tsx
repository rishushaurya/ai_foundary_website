"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Peach3DScene } from "@/components/3d/peach-3d-scene";
import { RegistrationModal } from "@/components/ui/registration-modal";
import { TeamMember, EventData, GallerySection, LandingCustomContent } from "@/lib/data";
import { normalizeImageUrl } from "@/lib/image-helper";
import { Calendar, MapPin, ArrowRight, Image as ImageIcon, MapPin as LocationIcon, Mail } from "lucide-react";
import { LinkedinIcon, InstagramIcon, GithubIcon, TwitterIcon } from "@/components/ui/icons";

interface HomeViewProps {
  events: EventData[];
  team: TeamMember[];
  gallerySections: GallerySection[];
  heroTagline: string;
  aboutText: string;
  landingContent?: LandingCustomContent;
}

export function HomeView({
  events,
  team,
  gallerySections,
  heroTagline,
  aboutText,
  landingContent,
}: HomeViewProps) {
  const router = useRouter();
  const [selectedEvent, setSelectedEvent] = useState<EventData | null>(null);
  
  // Instant Session Caching: If 3D has already loaded once in this session, skip preloader immediately (0ms delay)
  const isAlreadyLoaded = typeof window !== "undefined" && Boolean((window as any).__aifoundry3dInitialized);
  const [isLoading, setIsLoading] = useState(!isAlreadyLoaded);
  const [showPreloader, setShowPreloader] = useState(!isAlreadyLoaded);

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

  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const scrollToId = urlParams.get("scrollTo");
      if (scrollToId) {
        window.history.replaceState({}, document.title, window.location.pathname);
        if (scrollToId === "about") {
          setTimeout(() => {
            const aboutEl = document.getElementById("about-section");
            if (aboutEl) aboutEl.scrollIntoView({ behavior: "smooth" });
          }, 350);
        }
      } else {
        window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      }

      // If already initialized in this session, ensure instant 0ms reveal
      if ((window as any).__aifoundry3dInitialized) {
        setIsLoading(false);
        setShowPreloader(false);
        return;
      }
    }

    let isFinished = false;
    const startTime = Date.now();
    // Fast, responsive 3D initialization check
    const minLoadTime = 250;

    const finishLoading = () => {
      if (isFinished) return;
      isFinished = true;
      if (typeof window !== "undefined") {
        (window as any).__aifoundry3dInitialized = true;
      }
      requestAnimationFrame(() => {
        setIsLoading(false);
        setTimeout(() => setShowPreloader(false), 300);
      });
    };

    // Check if canvas exists with active WebGL draw dimensions
    const checkCanvasReady = () => {
      const sceneEl = document.getElementById("ijsk");
      if (sceneEl) {
        const canvas = sceneEl.querySelector("canvas");
        if (canvas && canvas.width > 0 && canvas.height > 0) {
          return true;
        }
      }
      return false;
    };

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      if (elapsed >= minLoadTime && checkCanvasReady()) {
        clearInterval(interval);
        finishLoading();
      }
    }, 40);

    // Fast safety fallback timer to guarantee seamless reveal
    const maxFallbackTimer = setTimeout(() => {
      clearInterval(interval);
      finishLoading();
    }, 600);

    return () => {
      clearInterval(interval);
      clearTimeout(maxFallbackTimer);
    };
  }, []);

  const facultyAdvisors = team.filter((m) => m.category === "faculty");
  const executiveLeads = team.filter((m) => m.category === "executive");

  // Collect all gallery images for the horizontal marquee
  const allGalleryImages = gallerySections.flatMap((sec) =>
    sec.items.map((item) => ({
      ...item,
      albumName: sec.name,
    }))
  );

  // Fallback images if gallery is empty
  const marqueeImages =
    allGalleryImages.length > 0
      ? allGalleryImages
      : [
          { id: "img-1", name: "AI Innovation Sprint", url: "/images/rectangle-899.png", albumName: "Hackathons" },
          { id: "img-2", name: "Robotics Workshop", url: "/images/rectangle-902.png", albumName: "Workshops" },
          { id: "img-3", name: "Faculty Keynote", url: "/images/rectangle-898.png", albumName: "Symposiums" },
          { id: "img-4", name: "Student Demo Day", url: "/images/image-1929.png", albumName: "Demo Day" },
          { id: "img-5", name: "Venture Accelerator", url: "/images/rectangle-5.png", albumName: "Incubation" },
          { id: "img-6", name: "Community Meetup", url: "/images/rectangle-8.png", albumName: "Community" },
        ];

  return (
    <div id="pwb-body-wrap" className="relative min-h-screen">
      {/* ===== FULL-PAGE SKELETON PRELOADER ===== */}
      <div
        className="fixed inset-0 z-[999999] flex flex-col justify-between p-6 sm:p-10 bg-white transition-opacity duration-700"
        style={{
          opacity: isLoading ? 1 : 0,
          pointerEvents: isLoading ? "auto" : "none",
          display: showPreloader ? "flex" : "none",
        }}
        suppressHydrationWarning
      >
        {/* Top Header Skeleton */}
        <div className="flex items-center justify-between max-w-7xl mx-auto w-full pt-4" suppressHydrationWarning>
          <div className="flex items-center gap-3" suppressHydrationWarning>
            <div className="w-8 h-8 rounded-full bg-slate-200 animate-pulse"></div>
            <div className="w-28 h-5 rounded-md bg-slate-200 animate-pulse"></div>
          </div>
          <div className="hidden md:flex items-center gap-6 px-8 py-3 rounded-full bg-slate-100/80 backdrop-blur-md" suppressHydrationWarning>
            <div className="w-12 h-3.5 rounded bg-slate-200 animate-pulse"></div>
            <div className="w-12 h-3.5 rounded bg-slate-200 animate-pulse"></div>
            <div className="w-12 h-3.5 rounded bg-slate-200 animate-pulse"></div>
            <div className="w-12 h-3.5 rounded bg-slate-200 animate-pulse"></div>
            <div className="w-12 h-3.5 rounded bg-slate-200 animate-pulse"></div>
          </div>
          <div className="w-24 h-9 rounded-full bg-slate-200 animate-pulse"></div>
        </div>

        {/* Central Hero Skeleton */}
        <div className="max-w-4xl mx-auto w-full my-auto space-y-8" suppressHydrationWarning>
          <div className="space-y-4" suppressHydrationWarning>
            <div className="w-full h-12 sm:h-16 rounded-xl bg-slate-200 animate-pulse"></div>
            <div className="w-4/5 h-12 sm:h-16 rounded-xl bg-slate-200 animate-pulse"></div>
            <div className="w-2/3 h-12 sm:h-16 rounded-xl bg-slate-200 animate-pulse"></div>
          </div>

          {/* Buttons Skeleton */}
          <div className="flex items-center gap-4 pt-4" suppressHydrationWarning>
            <div className="w-32 h-11 rounded-xl bg-slate-200 animate-pulse"></div>
            <div className="w-36 h-11 rounded-xl bg-slate-200 animate-pulse"></div>
          </div>
        </div>

        {/* Bottom Indicators Skeleton */}
        <div className="flex items-end justify-between max-w-7xl mx-auto w-full pb-4" suppressHydrationWarning>
          <div className="w-20 h-4 rounded bg-slate-200 animate-pulse"></div>
          <div className="w-64 h-4 rounded bg-slate-200 animate-pulse hidden sm:block"></div>
        </div>
      </div>

      {/* 3D WebGL Canvas Layer */}
      <Peach3DScene />

      {/* ===== WEBSITE CONTENT (SMOOTH SIMULTANEOUS FADE-IN ONCE 3D SCENE IS DRAWN) ===== */}
      <div
        className="relative w-full transition-opacity duration-700"
        style={{
          opacity: isLoading ? 0 : 1,
          pointerEvents: isLoading ? "none" : "auto",
        }}
      >
        {/* Anchor 1 */}
        <div className="pwb-anchor" id="i3owk"></div>

        {/* ===== SLIDE 1: HERO SECTION ===== */}
        <div className="pwb-flex-grid-wrap" id="i84ba">
          <div className="pwb-flex-grid-wrap" id="i1lwz-6">
            <div className="pwb-flex-grid-wrap" id="i1lwz-2-8-2">
              <div className="pwb-flex-grid-wrap" id="i1lwz-2-8-2-2">
                <h1
                  className="pw-user-text-style-6ae56f11-b178-4dd1-8bf0-1f16cb6f2a2e"
                  id="ispyh-2-2-5-2-2"
                >
                  {heroTagline ||
                    "FORGING THE FUTURE OF ENTREPRENEURSHIP & ARTIFICIAL INTELLIGENCE"}
                </h1>
                <div className="pwb-flex-grid-wrap" id="i1lwz-2-2-2-2-2-2-3" style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                  <a
                    href="/recruit"
                    onClick={(e) => navigateTo(e, "/recruit")}
                    className="no-underline cursor-pointer transition-transform hover:scale-105"
                    id="hero-cta-joinus"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      flexDirection: "row",
                      padding: "16px 24px",
                      justifyContent: "center",
                      backgroundColor: "#ffffff",
                      borderRadius: "8px",
                      gap: "8px",
                      height: "48px",
                      pointerEvents: "auto",
                      boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
                    }}
                  >
                    <p
                      className="pw-user-text-style-db4943d4-453d-474d-b88a-07d9ad351c62 font-bold"
                      id="hero-cta-joinus-text"
                      style={{ color: "#000000", fontWeight: 700, fontSize: "14px" }}
                    >
                      Join Us
                    </p>
                    <img
                      src="/images/group-1597882162.svg"
                      loading="lazy"
                      id="hero-cta-joinus-icon"
                      alt="arrow"
                      style={{ width: "20px", height: "20px" }}
                    />
                  </a>
                  <a
                    href="/events"
                    onClick={(e) => navigateTo(e, "/events")}
                    className="no-underline cursor-pointer transition-transform hover:scale-105"
                    id="hero-cta-events"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      flexDirection: "row",
                      padding: "16px 24px",
                      justifyContent: "center",
                      backgroundColor: "rgba(255, 255, 255, 0.1)",
                      borderRadius: "8px",
                      border: "1px solid rgba(255, 255, 255, 0.2)",
                      gap: "8px",
                      height: "48px",
                      backdropFilter: "blur(10px)",
                      pointerEvents: "auto",
                    }}
                  >
                    <p
                      className="pw-user-text-style-db4943d4-453d-474d-b88a-07d9ad351c62 font-bold"
                      id="hero-cta-events-text"
                      style={{ color: "#ffffff", fontWeight: 700, fontSize: "14px" }}
                    >
                      Explore Events
                    </p>
                  </a>
                </div>
              </div>
            </div>
            <div className="pwb-flex-grid-wrap" id="i1lwz-2-8-2-2-2">
              <p
                className="pw-user-text-style-db4943d4-453d-474d-b88a-07d9ad351c62"
                id="ispyh-2-2-2-3-3-2-3-2"
              >
                Scroll down
              </p>
              <p
                className="pw-user-text-style-3045d4e5-cceb-462e-a2d3-aff6a744df83"
                id="ispyh-2-2-2-3-3-2-3"
              >
                Dayananda Sagar University&apos;s premier innovation ecosystem uniting
                engineers, designers, researchers, and student founders.
              </p>
            </div>
          </div>
        </div>

        {/* ===== SLIDE 2: ABOUT US SECTION ===== */}
        <div className="pwb-anchor" id="about-section" style={{ position: "relative", top: "-80px" }}></div>
        <div className="pwb-flex-grid-wrap" id="ilwyn" style={{ pointerEvents: "auto", minHeight: "auto", padding: "100px 20px 60px" }}>
          <div className="pwb-flex-grid-wrap" id="i1lwz-2-4" style={{ pointerEvents: "auto", maxWidth: "1200px", width: "100%", margin: "0 auto" }}>
            <div className="pw-block-style w-full" id="i3n9rh-2-2" style={{ width: "100%", maxWidth: "1000px" }}>
              <p
                className="pw-user-text-style-47248e95-3515-4423-8189-0bbe15d8728f text-amber-500 font-bold uppercase tracking-widest text-sm mb-6"
                id="about-tagline"
              >
                ABOUT US
              </p>
              <h1
                className="pw-user-text-style-b1637bfe-8939-428c-b6b6-e73aa4f717d9 text-white font-medium text-3xl sm:text-4xl md:text-5xl lg:text-6xl leading-[1.15] tracking-tight"
                id="about-headline"
                style={{
                  fontFamily: '"68832fb0ffba9b1995adac75-helveticanowdisplay-medium", "Helvetica Neue", sans-serif',
                }}
              >
                {aboutText ||
                  "To cultivate a vibrant community at DSU, fostering innovation in AI and entrepreneurship through collaborative projects."}
              </h1>
              <p className="text-slate-300 text-base sm:text-lg md:text-xl font-normal leading-relaxed mt-6 max-w-3xl">
                Ai Foundry is Dayananda Sagar University&apos;s flagship technology accelerator and student innovation hub. We bridge the gap between academic exploration and high-impact AI ventures by providing mentorship, GPU compute, and a collaborative workspace.
              </p>
              <div className="flex flex-wrap items-center gap-4 mt-8">
                <a
                  href="/recruit"
                  onClick={(e) => navigateTo(e, "/recruit")}
                  className="no-underline cursor-pointer transition-transform hover:scale-105"
                  id="about-btn-join"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    flexDirection: "row",
                    padding: "16px 24px",
                    justifyContent: "center",
                    backgroundColor: "#ffffff",
                    borderRadius: "8px",
                    gap: "8px",
                    height: "48px",
                    pointerEvents: "auto",
                    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
                  }}
                >
                  <span style={{ color: "#000000", fontWeight: 700, fontSize: "14px" }}>Join Our Community</span>
                  <img src="/images/group-1597882162.svg" alt="arrow" style={{ width: "20px", height: "20px" }} />
                </a>
                <a
                  href="/team"
                  onClick={(e) => navigateTo(e, "/team")}
                  className="no-underline cursor-pointer transition-transform hover:scale-105"
                  id="about-btn-team"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    flexDirection: "row",
                    padding: "16px 24px",
                    justifyContent: "center",
                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                    borderRadius: "8px",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    gap: "8px",
                    height: "48px",
                    backdropFilter: "blur(10px)",
                    pointerEvents: "auto",
                  }}
                >
                  <span style={{ color: "#ffffff", fontWeight: 700, fontSize: "14px" }}>Meet The Team</span>
                </a>
              </div>
            </div>
          </div>
          <div className="pwb-flex-grid-wrap" id="ijh6l-3-2"></div>
        </div>

        {/* ===== SLIDE 3: UPCOMING EVENTS & HACKATHONS (FROSTED GLASS ON 3D BACKDROP) ===== */}
        <div className="pwb-flex-grid-wrap" id="ilwyn-4" style={{ pointerEvents: "auto", minHeight: "auto", padding: "60px 20px 100px" }}>
          <div className="pwb-flex-grid-wrap" id="i1lwz-2-4-4" style={{ pointerEvents: "auto", maxWidth: "1280px", width: "100%", margin: "0 auto" }}>
            <div className="pw-rows-style" id="i3oqmq-2" style={{ marginBottom: "40px", width: "100%" }}>
              <p
                className="pw-user-text-style-47248e95-3515-4423-8189-0bbe15d8728f text-cyan-400 font-bold uppercase tracking-widest text-sm mb-2"
                id="events-tagline"
              >
                UPCOMING EVENTS
              </p>
              <div className="flex flex-col md:flex-row md:items-end justify-between w-full">
                <h1
                  className="pw-user-text-style-9711fa5c-ea00-4752-8af0-945c28ef776e text-white text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight"
                  id="events-headline"
                  style={{
                    fontFamily: '"68832fb0ffba9b1995adac75-helveticanowdisplay-medium", "Helvetica Neue", sans-serif',
                  }}
                >
                  Hackathons, Workshops &amp; Sprints
                </h1>
                <Link
                  href="/events"
                  className="mt-4 md:mt-0 inline-flex items-center gap-2 text-sm font-bold text-cyan-400 hover:text-cyan-300 transition-colors no-underline uppercase tracking-wider font-mono group"
                >
                  <span>All Events</span>
                  <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>

            {/* Frosted Glass Large Event Cards (Exact Requested Hierarchy: Status+Date -> Title -> Image -> Desc -> Venue -> Register) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full" id="events-card-grid">
              {events
                .filter((e) => e.showOnHome !== false)
                .slice(0, 3)
                .map((evt) => {
                  const dateStr = new Date(evt.date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  });
                  return (
                    <div
                      key={evt.id}
                      className="min-h-[460px] flex flex-col justify-between p-7 sm:p-8 rounded-3xl border border-white/15 backdrop-blur-2xl transition-all duration-300 hover:border-cyan-400/60 hover:scale-[1.02] group"
                      style={{
                        backgroundColor: "rgba(255, 255, 255, 0.08)",
                        boxShadow: "0 12px 36px rgba(0, 0, 0, 0.35)",
                      }}
                    >
                      <div className="w-full flex flex-col">
                        {/* 1. Status Badge & Date Side-by-Side with Gap */}
                        <div className="flex items-center justify-between w-full mb-4">
                          <span className="px-3.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-cyan-950/90 text-cyan-300 border border-cyan-500/40 font-mono shadow-sm">
                            {evt.status}
                          </span>
                          <div className="flex items-center gap-1.5 text-xs text-slate-300 font-mono font-bold">
                            <Calendar className="size-3.5 text-cyan-400" />
                            <span>{dateStr}</span>
                          </div>
                        </div>

                        {/* 2. Event Title in Bold */}
                        <h3
                          className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight leading-snug group-hover:text-cyan-300 transition-colors line-clamp-2 mb-4"
                          style={{
                            fontFamily: '"68832fb0ffba9b1995adac75-helveticanowdisplay-medium", "Helvetica Neue", sans-serif',
                          }}
                        >
                          {evt.title}
                        </h3>

                        {/* 3. Event Image with Direct Image Normalization */}
                        <div className="relative w-full h-44 rounded-2xl overflow-hidden mb-4 border border-white/10 bg-black/40 shadow-inner">
                          <img
                            src={normalizeImageUrl(evt.image)}
                            alt={evt.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>

                        {/* 4. Event Description with Proper Gap */}
                        <p className="text-slate-300 text-xs sm:text-sm font-normal leading-relaxed line-clamp-3 mb-4">
                          {evt.description}
                        </p>

                        {/* 5. Location / Venue */}
                        <div className="flex items-center gap-1.5 text-xs text-cyan-300 font-mono font-semibold mb-2">
                          <MapPin className="size-3.5 text-cyan-400 flex-shrink-0" />
                          <span className="truncate">{evt.venue}</span>
                        </div>
                      </div>

                      {/* 6. Registration Button */}
                      <div className="pt-5 mt-4 border-t border-white/10 w-full flex justify-center">
                        {evt.registrationMode === "external" && (evt.externalRegistrationUrl || evt.googleFormUrl) ? (
                          <a
                            href={evt.externalRegistrationUrl || evt.googleFormUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="no-underline cursor-pointer transition-transform hover:scale-105 w-full flex items-center justify-center gap-2"
                            style={{
                              padding: "14px 24px",
                              backgroundColor: "#ffffff",
                              borderRadius: "12px",
                              height: "48px",
                              boxShadow: "0 4px 15px rgba(255, 255, 255, 0.2)",
                            }}
                          >
                            <span style={{ color: "#000000", fontWeight: 800, fontSize: "13px", letterSpacing: "0.5px" }}>
                              Register (External)
                            </span>
                            <img src="/images/group-1597882162.svg" alt="arrow" style={{ width: "18px", height: "18px" }} />
                          </a>
                        ) : (
                          <button
                            onClick={() => setSelectedEvent(evt)}
                            className="cursor-pointer transition-transform hover:scale-105 w-full flex items-center justify-center gap-2"
                            style={{
                              padding: "14px 24px",
                              backgroundColor: "#ffffff",
                              borderRadius: "12px",
                              height: "48px",
                              border: "none",
                              boxShadow: "0 4px 15px rgba(255, 255, 255, 0.2)",
                            }}
                          >
                            <span style={{ color: "#000000", fontWeight: 800, fontSize: "13px", letterSpacing: "0.5px" }}>
                              Register Now
                            </span>
                            <img src="/images/group-1597882162.svg" alt="arrow" style={{ width: "18px", height: "18px" }} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>

        <div className="pwb-flex-grid-wrap" id="injpw-2-2-3"></div>
        <div className="pwb-anchor" id="i3owk-2-3"></div>

        {/* ===== SLIDE 4: OUR PILLARS (WHITE BACKGROUND AS IN ORIGINAL DESIGN) ===== */}
        <div className="pwb-flex-grid-wrap" id="ilwyn-2">
          <div className="pwb-flex-grid-wrap" id="i1lwz-5">
            <p
              className="pw-user-text-style-47248e95-3515-4423-8189-0bbe15d8728f"
              id="ispyh-2-3-2-3-2-2-2-3-2"
            >
              OUR PILLARS
            </p>
            <div className="pwb-flex-grid-wrap" id="i1lwz-2-6-3">
              <div className="pwb-flex-grid-wrap" id="i1lwz-2-6-3-4">
                <h1
                  className="pw-user-text-style-9711fa5c-ea00-4752-8af0-945c28ef776e"
                  id="ispyh-2-2-2-3-3-3"
                >
                  Our approach to innovation is built on three core strategies.
                </h1>
                <p
                  className="pw-user-text-style-3045d4e5-cceb-462e-a2d3-aff6a744df83"
                  id="ispyh-2-2-2-3-3-2-2"
                >
                  Empowering students to lead in AI and entrepreneurship, fostering
                  real-world impact and future-ready skills.
                </p>
              </div>
              <div className="pwb-flex-grid-wrap" id="i1lwz-2-6-3-3">
                <a
                  href="/recruit"
                  onClick={(e) => navigateTo(e, "/recruit")}
                  className="no-underline cursor-pointer transition-transform hover:scale-105"
                  id="pillars-cta-joinus"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    flexDirection: "row",
                    padding: "16px 24px",
                    justifyContent: "center",
                    backgroundColor: "#1a1a1a",
                    borderRadius: "8px",
                    gap: "8px",
                    height: "48px",
                    pointerEvents: "auto",
                  }}
                >
                  <p
                    className="pw-user-text-style-db4943d4-453d-474d-b88a-07d9ad351c62 font-bold"
                    id="pillars-cta-joinus-text"
                    style={{ color: "#ffffff", fontWeight: 700, fontSize: "14px" }}
                  >
                    Join Us
                  </p>
                  <img
                    src="/images/group-1597882163.svg"
                    loading="lazy"
                    id="pillars-cta-joinus-icon"
                    alt="arrow"
                    style={{ width: "20px", height: "20px" }}
                  />
                </a>
              </div>
            </div>
          </div>
          <div className="pwb-flex-grid-wrap" id="i1lwz-2-4-2-3-4">
            <div className="pwb-flex-grid-wrap" id="i1lwz-2-4-2-2-3-5">
              <div className="pw-block-style" id="ipkvji-4-6">
                <img
                  className="pw-image-style"
                  src="/images/asterisk-streamline-unicons.svg"
                  loading="lazy"
                  id="ixgrmc"
                  alt="Innovation icon"
                />
              </div>
              <div className="pw-block-style" id="ipkvji-4-3-5">
                <h3
                  className="pw-user-text-style-68210bff-519a-4c4d-8aa2-b3b5be3cb987"
                  id="ispyh-2-2-2-2-2-2-3-5"
                >
                  Innovation
                </h3>
                <p
                  className="pw-user-text-style-24b64575-cd02-447f-8652-42c6ba02cfec"
                  id="ispyh-2-2-2-4-4-2-5"
                >
                  We encourage groundbreaking ideas and provide the resources for
                  members to explore the frontiers of AI and business.
                </p>
              </div>
            </div>
            <div className="pwb-flex-grid-wrap" id="i1lwz-2-4-2-2-3-2-4">
              <div className="pw-block-style" id="ipkvji-4-2-4">
                <img
                  className="pw-image-style"
                  src="/images/channel-streamline-unicons.svg"
                  loading="lazy"
                  id="ixgrmc-2"
                  alt="Collaboration icon"
                />
              </div>
              <div className="pw-block-style" id="ipkvji-4-3-2-4">
                <h3
                  className="pw-user-text-style-68210bff-519a-4c4d-8aa2-b3b5be3cb987"
                  id="ispyh-2-2-2-2-2-2-3-2-4"
                >
                  Collaboration
                </h3>
                <p
                  className="pw-user-text-style-24b64575-cd02-447f-8652-42c6ba02cfec"
                  id="ispyh-2-2-2-4-4-2-2-4"
                >
                  We believe in the power of diverse minds working together,
                  fostering a supportive environment for shared learning and
                  growth.
                </p>
              </div>
            </div>
            <div className="pwb-flex-grid-wrap" id="i1lwz-2-4-2-2-3-2-2-4">
              <div className="pw-block-style" id="ipkvji-4-2-2-4">
                <img
                  className="pw-image-style"
                  src="/images/border-vertical-streamline-unicons.svg"
                  loading="lazy"
                  id="ixgrmc-3"
                  alt="Impact icon"
                />
              </div>
              <div className="pw-block-style" id="ipkvji-4-3-2-2-4">
                <h3
                  className="pw-user-text-style-68210bff-519a-4c4d-8aa2-b3b5be3cb987"
                  id="ispyh-2-2-2-2-2-2-3-2-2-4"
                >
                  Impact
                </h3>
                <p
                  className="pw-user-text-style-24b64575-cd02-447f-8652-42c6ba02cfec"
                  id="ispyh-2-2-2-4-4-2-2-2-4"
                >
                  Our projects aim to solve real-world problems, making a tangible
                  difference in the community and beyond.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ===== SLIDE 5: OUR GALLERY (HORIZONTAL SMOOTH MARQUEE RIGHT->LEFT ON WHITE BACKDROP) ===== */}
        <div className="pwb-flex-grid-wrap" id="ilwyn-2-3">
          <div className="pwb-flex-grid-wrap" id="i1lwz-5-3" style={{ pointerEvents: "auto" }}>
            <div className="pwb-flex-grid-wrap" id="i1lwz-2-6-3-2">
              <p
                className="pw-user-text-style-47248e95-3515-4423-8189-0bbe15d8728f"
                id="ispyh-2-3-2-3-2-2-2-3-2-3"
              >
                MOMENTS &amp; ARCHIVES
              </p>
              <div className="pwb-flex-grid-wrap" id="i1lwz-2-6-3-2-2">
                <div className="pwb-flex-grid-wrap" id="i1lwz-2-6-3-2-2-3">
                  <h1
                    className="pw-user-text-style-9711fa5c-ea00-4752-8af0-945c28ef776e"
                    id="ispyh-2-2-2-3-3-3-2-3"
                  >
                    Life at AI Foundry
                  </h1>
                  <p
                    className="pw-user-text-style-3045d4e5-cceb-462e-a2d3-aff6a744df83"
                    id="ispyh-2-2-2-3-3-2-2-2-3"
                  >
                    Glimpses into 24-hour hackathons, prototype showcases, mentor sessions, and community gatherings.
                  </p>
                </div>
                <a
                  href="/gallery"
                  onClick={(e) => navigateTo(e, "/gallery")}
                  className="no-underline cursor-pointer transition-transform hover:scale-105"
                  id="gallery-cta-all"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    flexDirection: "row",
                    padding: "16px 24px",
                    justifyContent: "center",
                    backgroundColor: "#1a1a1a",
                    borderRadius: "8px",
                    gap: "8px",
                    height: "48px",
                    pointerEvents: "auto",
                  }}
                >
                  <p
                    className="pw-user-text-style-db4943d4-453d-474d-b88a-07d9ad351c62 font-bold"
                    id="gallery-cta-all-text"
                    style={{ color: "#ffffff", fontWeight: 700, fontSize: "14px" }}
                  >
                    View Full Gallery
                  </p>
                  <img
                    src="/images/group-1597882163.svg"
                    loading="lazy"
                    id="gallery-cta-all-icon"
                    alt="arrow"
                    style={{ width: "20px", height: "20px" }}
                  />
                </a>
              </div>
            </div>
          </div>

          {/* Marquee Track Container */}
          <div className="w-full overflow-hidden py-6" style={{ pointerEvents: "auto" }}>
            <div className="flex gap-6 animate-[marquee_25s_linear_infinite] hover:[animation-play-state:paused] w-max">
              {[...marqueeImages, ...marqueeImages].map((img, idx) => (
                <div
                  key={`${img.id}-${idx}`}
                  className="flex-shrink-0 w-72 sm:w-80 h-52 rounded-2xl border overflow-hidden relative group transition-transform duration-300 hover:scale-105 shadow-md"
                  style={{
                    background: "#f1f5f9",
                    borderColor: "rgba(0, 0, 0, 0.08)",
                  }}
                >
                  <div className="w-full h-full bg-slate-100 flex flex-col items-center justify-center p-4 text-center">
                    <ImageIcon className="size-8 text-cyan-600 mb-2 opacity-80 group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">
                      {img.name || "Club Moment"}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono mt-1">
                      {img.albumName}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ===== SLIDE 6: OUR APPROACH (WHITE BACKGROUND AS IN ORIGINAL DESIGN) ===== */}
        <div className="pwb-flex-grid-wrap" id="ilwyn-2-3-2">
          <div className="pwb-flex-grid-wrap" id="i1lwz-5-3-2">
            <div className="pwb-flex-grid-wrap" id="i1lwz-2-6-3-2-3">
              <p
                className="pw-user-text-style-47248e95-3515-4423-8189-0bbe15d8728f"
                id="ispyh-2-3-2-3-2-2-2-3-2-3-3"
              >
                OUR APPROACH
              </p>
              <div className="pwb-flex-grid-wrap" id="i1lwz-2-6-3-2-2-2">
                <h1
                  className="pw-user-text-style-9711fa5c-ea00-4752-8af0-945c28ef776e"
                  id="ispyh-2-2-2-3-3-3-2-2"
                >
                  Where your ambition meets innovation.
                </h1>
                <p
                  className="pw-user-text-style-3045d4e5-cceb-462e-a2d3-aff6a744df83"
                  id="ispyh-2-2-2-3-3-2-2-2-2"
                >
                  We foster a dynamic environment where students can transform their
                  ideas into impactful AI and entrepreneurial ventures.
                </p>
              </div>
            </div>
          </div>
          <div className="pwb-flex-grid-wrap" id="i1lwz-2-4-2-3-4-2-2">
            <div className="pwb-flex-grid-wrap" id="i1lwz-2-4-2-3-4-2-2-3">
              <div className="pwb-flex-grid-wrap" id="i1lwz-2-4-2-2-3-5-2-3-2-2-3">
                <div className="pwb-flex-grid-wrap" id="i1lwz-2-4-2-2-3-5-2-2-2-2-2-3">
                  <img className="pw-image-style" src="/images/rectangle-5.png" loading="lazy" id="ikuswx-2-3" alt="Ideation" />
                  <div className="pw-block-style" id="ipkvji-4-3-2-4-3-3">
                    <h2 className="pw-user-text-style-abab9931-4159-4d9f-b594-3693bb5f6ccd" id="ispyh-2-2-2-2-2-2-3-2-4-3-3">
                      Ideation
                    </h2>
                    <p className="pw-user-text-style-3045d4e5-cceb-462e-a2d3-aff6a744df83" id="ispyh-2-2-2-4-4-2-2-4-3-3">
                      We guide members from initial concepts to well-defined project proposals, encouraging creative problem-solving.
                    </p>
                  </div>
                </div>
              </div>
              <div className="pwb-flex-grid-wrap" id="i1lwz-2-4-2-2-3-5-2-4-3">
                <div className="pwb-flex-grid-wrap" id="i1lwz-2-4-2-2-3-5-2-2-3-3">
                  <div className="pw-block-style" id="ipkvji-4-3-2-4-3-2-3">
                    <h2 className="pw-user-text-style-abab9931-4159-4d9f-b594-3693bb5f6ccd" id="ispyh-2-2-2-2-2-2-3-2-4-3-2-3">
                      Development
                    </h2>
                    <p className="pw-user-text-style-3045d4e5-cceb-462e-a2d3-aff6a744df83" id="ispyh-2-2-2-4-4-2-2-4-3-2-3">
                      Providing tools, mentorship, GPU compute, and a collaborative space for building AI solutions.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="pwb-flex-grid-wrap" id="i1lwz-2-4-2-3-4-2-2-2">
              <div className="pwb-flex-grid-wrap" id="i1lwz-2-4-2-2-3-5-2-4-2">
                <div className="pwb-flex-grid-wrap" id="i1lwz-2-4-2-2-3-5-2-2-3-2">
                  <div className="pw-block-style" id="ipkvji-4-3-2-4-3-2-2">
                    <h2 className="pw-user-text-style-abab9931-4159-4d9f-b594-3693bb5f6ccd" id="ispyh-2-2-2-2-2-2-3-2-4-3-2-2">
                      Launch
                    </h2>
                    <p className="pw-user-text-style-3045d4e5-cceb-462e-a2d3-aff6a744df83" id="ispyh-2-2-2-4-4-2-2-4-3-2-2">
                      Supporting projects through deployment, venture accelerator pitch demo days, and continuous iteration.
                    </p>
                  </div>
                </div>
                <img className="pw-image-style" src="/images/map.png" loading="lazy" id="ikuswx-2-2-2" alt="Launch map" />
              </div>
              <div className="pwb-flex-grid-wrap" id="i1lwz-2-4-2-2-3-5-2-3-4-2-2">
                <div className="pwb-flex-grid-wrap" id="i1lwz-2-4-2-2-3-5-2-2-2-4-2-2">
                  <div className="pw-block-style" id="ipkvji-4-3-2-4-3-2-2-2">
                    <h2 className="pw-user-text-style-abab9931-4159-4d9f-b594-3693bb5f6ccd" id="ispyh-2-2-2-2-2-2-3-2-4-3-2-2-2">
                      Mentorship
                    </h2>
                    <p className="pw-user-text-style-3045d4e5-cceb-462e-a2d3-aff6a744df83" id="ispyh-2-2-2-4-4-2-2-4-3-2-2-2">
                      Connecting students with faculty advisors and industry leaders for deep technical guidance.
                    </p>
                  </div>
                </div>
              </div>
              <div className="pwb-flex-grid-wrap" id="i1lwz-2-4-2-2-3-5-2-3-2-2-2">
                <div className="pwb-flex-grid-wrap" id="i1lwz-2-4-2-2-3-5-2-2-2-2-2-2">
                  <div className="pw-block-style" id="ipkvji-4-3-2-4-3-2-2-3">
                    <h2 className="pw-user-text-style-abab9931-4159-4d9f-b594-3693bb5f6ccd" id="ispyh-2-2-2-2-2-2-3-2-4-3-2-2-2-2">
                      Community
                    </h2>
                    <p className="pw-user-text-style-3045d4e5-cceb-462e-a2d3-aff6a744df83" id="ispyh-2-2-2-4-4-2-2-4-3-2-2-3">
                      Building a strong student network at DSU, fostering peer learning and collaborative opportunities.
                    </p>
                  </div>
                  <img className="pw-image-style" src="/images/rectangle-8.png" loading="lazy" id="ikuswx-2-2" alt="Community" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="pwb-anchor" id="i3owk-2-2-3"></div>
        <div className="pwb-flex-grid-wrap" id="injpw-2-2"></div>

        {/* ===== SLIDE 7: OUR PROCESS ===== */}
        <div className="pwb-flex-grid-wrap" id="ilwyn-4-2">
          <div className="pwb-flex-grid-wrap" id="i1lwz-2-4-4-3">
            <p
              className="pw-user-text-style-47248e95-3515-4423-8189-0bbe15d8728f"
              id="ispyh-2-3-2-3-2-2-2-3-3-3"
            >
              OUR PROCESS
            </p>
            <div className="pwb-flex-grid-wrap" id="i1lwz-2-4-4-2-3">
              <div className="pw-rows-style" id="i3oqmq-2-3">
                <h1
                  className="pw-user-text-style-9711fa5c-ea00-4752-8af0-945c28ef776e"
                  id="ispyh-2-2-2-5-2-3-3"
                >
                  How we forge the future.
                </h1>
              </div>
              <div className="pwb-flex-grid-wrap" id="i1lwz-2-4-4-2-2-2">
                <div className="pwb-flex-grid-wrap" id="i1lwz-2-4-2-2-3-6-4">
                  <div className="pw-block-style" id="ipkvji-4-3-6-2-4">
                    <img className="pw-image-style" src="/images/asterisk-streamline-unicons.svg" loading="lazy" id="ixgrmc-4-2-2-4" alt="Process 1" />
                  </div>
                  <div className="pw-block-style" id="ipkvji-4-3-7-2-4">
                    <div className="pw-block-style" id="ipkvji-4-3-8-4">
                      <h3 className="pw-user-text-style-68210bff-519a-4c4d-8aa2-b3b5be3cb987" id="ispyh-2-2-2-2-2-2-3-6-4">
                        Idea Generation
                      </h3>
                    </div>
                    <div className="pw-block-style" id="ipkvji-4-7-4">
                      <p className="pw-user-text-style-24b64575-cd02-447f-8652-42c6ba02cfec" id="ispyh-2-2-2-4-4-2-6-2-4">
                        Brainstorming and refining concepts within our collaborative workshops and 24-hour hackathons.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="pwb-flex-grid-wrap" id="i1lwz-2-4-2-2-3-6-3-2">
                  <div className="pw-block-style" id="ipkvji-4-3-6-2-3-2">
                    <img className="pw-image-style" src="/images/asterisk-streamline-unicons.svg" loading="lazy" id="ixgrmc-4-2-2-3-2" alt="Process 2" />
                  </div>
                  <div className="pw-block-style" id="ipkvji-4-3-7-2-3-2">
                    <div className="pw-block-style" id="ipkvji-4-3-8-3-2">
                      <h3 className="pw-user-text-style-68210bff-519a-4c4d-8aa2-b3b5be3cb987" id="ispyh-2-2-2-2-2-2-3-6-3-2">
                        Team Formation
                      </h3>
                    </div>
                    <div className="pw-block-style" id="ipkvji-4-7-3-2">
                      <p className="pw-user-text-style-24b64575-cd02-447f-8652-42c6ba02cfec" id="ispyh-2-2-2-4-4-2-6-2-3-2">
                        Connecting students with complementary technical and design skills to form interdisciplinary squads.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="pwb-flex-grid-wrap" id="i1lwz-2-4-2-2-3-6-2-3">
                  <div className="pw-block-style" id="ipkvji-4-3-6-2-2-3">
                    <img className="pw-image-style" src="/images/asterisk-streamline-unicons.svg" loading="lazy" id="ixgrmc-4-2-2-2-2" alt="Process 3" />
                  </div>
                  <div className="pw-block-style" id="ipkvji-4-3-7-2-2-3">
                    <div className="pw-block-style" id="ipkvji-4-3-8-2-3">
                      <h3 className="pw-user-text-style-68210bff-519a-4c4d-8aa2-b3b5be3cb987" id="ispyh-2-2-2-2-2-2-3-6-2-3">
                        Project Incubation
                      </h3>
                    </div>
                    <div className="pw-block-style" id="ipkvji-4-7-2-3">
                      <p className="pw-user-text-style-24b64575-cd02-447f-8652-42c6ba02cfec" id="ispyh-2-2-2-4-4-2-6-2-2-3">
                        Providing GPU compute, mentorship, and a supportive environment for full-stack prototype development.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="pwb-flex-grid-wrap" id="i1lwz-2-4-2-2-3-6-2-2-2">
                  <div className="pw-block-style" id="ipkvji-4-3-6-2-2-2-2">
                    <img className="pw-image-style" src="/images/border-vertical-streamline-unicons.svg" loading="lazy" id="ixgrmc-3-2-2-2-2" alt="Process 4" />
                  </div>
                  <div className="pw-block-style" id="ipkvji-4-3-7-2-2-2-2">
                    <div className="pw-block-style" id="ipkvji-4-3-8-2-2-2">
                      <h3 className="pw-user-text-style-68210bff-519a-4c4d-8aa2-b3b5be3cb987" id="ispyh-2-2-2-2-2-2-3-6-2-2-2">
                        Showcase &amp; Launch
                      </h3>
                    </div>
                    <div className="pw-block-style" id="ipkvji-4-7-2-2-2">
                      <p className="pw-user-text-style-24b64575-cd02-447f-8652-42c6ba02cfec" id="ispyh-2-2-2-4-4-2-6-2-2-2-2">
                        Presenting completed projects to the tech community and supporting venture deployment.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ===== SLIDE 8: CLUB STATS ===== */}
        <div className="pwb-flex-grid-wrap" id="ilwyn-4-2-2">
          <div className="pwb-flex-grid-wrap" id="i1lwz-2-4-4-3-2">
            <p
              className="pw-user-text-style-47248e95-3515-4423-8189-0bbe15d8728f"
              id="ispyh-2-3-2-3-2-2-2-3-3-3-2"
            >
              CLUB STATS
            </p>
            <div className="pwb-flex-grid-wrap" id="i1lwz-2-4-4-2-3-2">
              <div className="pw-rows-style" id="i3oqmq-2-3-2">
                <div className="pw-rows-style" id="i3oqmq-2-2-3-2">
                  <h1
                    className="pw-user-text-style-9711fa5c-ea00-4752-8af0-945c28ef776e"
                    id="ispyh-2-2-2-5-2-3-3-2"
                  >
                    We&apos;re building a vibrant ecosystem.
                  </h1>
                  <p
                    className="pw-user-text-style-3045d4e5-cceb-462e-a2d3-aff6a744df83"
                    id="ispyh-2-2-2-5-2-2-2-2-2"
                  >
                    AI Foundry is dedicated to empowering the next generation of innovators in AI and entrepreneurship.
                  </p>
                  <div className="pwb-flex-grid-wrap" id="i1lwz-2-2-2-2-2-2-3-2-2-2">
                    <a
                      href="/recruit"
                      onClick={(e) => navigateTo(e, "/recruit")}
                      className="no-underline cursor-pointer transition-transform hover:scale-105"
                      id="stats-cta-joinus"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        flexDirection: "row",
                        padding: "16px 24px",
                        justifyContent: "center",
                        backgroundColor: "#ffffff",
                        borderRadius: "8px",
                        gap: "8px",
                        height: "48px",
                        pointerEvents: "auto",
                      }}
                    >
                      <p className="pw-user-text-style-db4943d4-453d-474d-b88a-07d9ad351c62 font-bold" id="stats-cta-joinus-text" style={{ color: "#000000", fontWeight: 700, fontSize: "14px" }}>
                        Join Us
                      </p>
                      <img src="/images/group-1597882162.svg" loading="lazy" id="stats-cta-joinus-icon" alt="arrow" style={{ width: "20px", height: "20px" }} />
                    </a>
                  </div>
                </div>
              </div>
              <div className="pwb-flex-grid-wrap" id="i1lwz-2-4-4-2-2-2-2">
                <div className="pw-block-style" id="ionv0l-2-2">
                  <div className="pw-rows-style" id="idk01s-3-2">
                    <div className="pwb-flex-grid-wrap" id="i1lwz-2-4-2-2-3-4-5-5-2">
                      <h1 className="pw-user-text-style-9711fa5c-ea00-4752-8af0-945c28ef776e" id="ispyh-2-2-2-2-2-2-2-2-5-2">
                        50 +
                      </h1>
                      <p className="pw-user-text-style-24b64575-cd02-447f-8652-42c6ba02cfec" id="ispyh-2-2-2-4-4-2-4-4-4-3">
                        Active Members
                      </p>
                    </div>
                    <div className="pwb-flex-grid-wrap" id="i1lwz-2-4-2-2-3-2-2-3-3-4-2">
                      <h1 className="pw-user-text-style-9711fa5c-ea00-4752-8af0-945c28ef776e" id="ispyh-2-2-2-2-2-2-2-2-3-4-2">
                        x 15
                      </h1>
                      <p className="pw-user-text-style-24b64575-cd02-447f-8652-42c6ba02cfec" id="ispyh-2-2-2-4-4-2-2-2-3-3-4-2">
                        Successful Sprints
                      </p>
                    </div>
                  </div>
                  <div className="pw-rows-style" id="idk01s-2-3-2">
                    <div className="pwb-flex-grid-wrap" id="i1lwz-2-4-2-2-3-2-3-3-3-3">
                      <h1 className="pw-user-text-style-9711fa5c-ea00-4752-8af0-945c28ef776e" id="ispyh-2-2-2-2-2-2-2-2-2-3-2-2-2">
                        1 year
                      </h1>
                      <p className="pw-user-text-style-24b64575-cd02-447f-8652-42c6ba02cfec" id="ispyh-2-2-2-4-4-2-2-3-3-3-3">
                        Since Inception
                      </p>
                    </div>
                    <div className="pwb-flex-grid-wrap" id="i1lwz-2-4-2-2-3-2-2-3-3-5-2">
                      <h1 className="pw-user-text-style-9711fa5c-ea00-4752-8af0-945c28ef776e" id="ispyh-2-2-2-2-2-2-2-2-3-5-2">
                        + 20
                      </h1>
                      <p className="pw-user-text-style-24b64575-cd02-447f-8652-42c6ba02cfec" id="ispyh-2-2-2-4-4-2-2-2-3-3-5-2">
                        Industry Mentors
                      </p>
                    </div>
                  </div>
                  <div className="pw-rows-style" id="idk01s-2-2-2-2">
                    <div className="pwb-flex-grid-wrap" id="i1lwz-2-4-2-2-3-2-2-2-2-3-2-2">
                      <h1 className="pw-user-text-style-9711fa5c-ea00-4752-8af0-945c28ef776e" id="ispyh-2-2-2-2-2-2-2-2-3-2-2-2">
                        - 50%
                      </h1>
                      <p className="pw-user-text-style-24b64575-cd02-447f-8652-42c6ba02cfec" id="ispyh-2-2-2-4-4-2-2-2-2-2-3-2-2">
                        Startup Build Time
                      </p>
                    </div>
                    <div className="pwb-flex-grid-wrap" id="i1lwz-2-4-2-2-3-2-3-3-3-2-2">
                      <h1 className="pw-user-text-style-9711fa5c-ea00-4752-8af0-945c28ef776e" id="ispyh-2-2-2-2-2-2-2-2-2-3-2-3">
                        500 hrs
                      </h1>
                      <p className="pw-user-text-style-24b64575-cd02-447f-8652-42c6ba02cfec" id="ispyh-2-2-2-4-4-2-2-3-3-3-2-2">
                        Innovation Time
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="pwb-anchor" id="i3owk-2-2-2-3"></div>

        {/* ===== SLIDE 10: LEADERSHIP & FACULTY (DYNAMICALLY BOUND TO CMS) ===== */}
        <div className="pwb-flex-grid-wrap" id="ilwyn-2-2-3-4-2">
          <div className="pwb-flex-grid-wrap" id="i1lwz-5-2-3-4-2">
            <p
              className="pw-user-text-style-47248e95-3515-4423-8189-0bbe15d8728f"
              id="ispyh-2-3-2-3-2-2-2-3-2-2-4-4-2"
            >
              {landingContent?.teamSubheading || "OUR TEAM"}
            </p>
            <h1
              className="pw-user-text-style-9711fa5c-ea00-4752-8af0-945c28ef776e"
              id="ispyh-2-2-2-3-2-3-4-2"
            >
              {landingContent?.teamHeading || "Meet the minds behind AI Foundry."}
            </h1>
          </div>
          <div className="pwb-flex-grid-wrap" id="i1lwz-2-4-2-3-3-4-2">
            <div className="pwb-flex-grid-wrap" id="i1lwz-2-4-2-2-3-4-5-2">
              <div className="pwb-flex-grid-wrap" id="i1lwz-2-6-2-3-4-2-2">
                <p
                  className="pw-user-text-style-47248e95-3515-4423-8189-0bbe15d8728f"
                  id="ispyh-2-3-2-3-2-2-2-3-2-2-4-4-2-2"
                >
                  LEADERSHIP
                </p>
                <p
                  className="pw-user-text-style-24b64575-cd02-447f-8652-42c6ba02cfec"
                  id="ispyh-2-2-2-4-4-2-4-4-2-2"
                >
                  {landingContent?.teamDescription ||
                    "The dedicated faculty mentors and student executives guiding our club's vision and fostering a culture of innovation at Dayananda Sagar University."}
                </p>
              </div>
              <div className="pwb-flex-grid-wrap" id="i1lwz-2-6-2-3-4-2-2-2">
                <a
                  href="/team"
                  onClick={(e) => navigateTo(e, "/team")}
                  className="no-underline cursor-pointer transition-transform hover:scale-105"
                  id="team-cta-all"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    flexDirection: "row",
                    padding: "16px 24px",
                    justifyContent: "center",
                    backgroundColor: "#1a1a1a",
                    borderRadius: "8px",
                    gap: "8px",
                    height: "48px",
                    pointerEvents: "auto",
                  }}
                >
                  <p
                    className="pw-user-text-style-db4943d4-453d-474d-b88a-07d9ad351c62 font-bold"
                    id="team-cta-all-text"
                    style={{ color: "#ffffff", fontWeight: 700, fontSize: "14px" }}
                  >
                    View Full Team
                  </p>
                  <img
                    src="/images/group-1597882163.svg"
                    loading="lazy"
                    id="team-cta-all-icon"
                    alt="arrow"
                    style={{ width: "20px", height: "20px" }}
                  />
                </a>
              </div>
            </div>
            <div className="pwb-flex-grid-wrap" id="i1lwz-2-4-2-2-3-4-5-2-2">
              {(landingContent?.teamMembers && landingContent.teamMembers.length > 0
                ? landingContent.teamMembers
                : [
                    {
                      id: "tm-1",
                      name: facultyAdvisors[0]?.name || "Dr. Jayavrinda Vrindavanam V",
                      role: facultyAdvisors[0]?.role || "Club Coordinator & Professor",
                      image: "/images/rectangle-899.png",
                    },
                    {
                      id: "tm-2",
                      name: executiveLeads[0]?.name || "Syed Amaan",
                      role: executiveLeads[0]?.role || "Chief Executive Officer",
                      image: "/images/rectangle-898.png",
                    },
                  ]
              ).map((member, idx) => (
                <div
                  key={member.id || idx}
                  className="pwb-flex-grid-wrap"
                  id={idx === 0 ? "i1lwz-2-4-2-2-3-2-2-3-3-2" : "i1lwz-2-4-2-2-3-2-2-3-3-2-2"}
                >
                  <div
                    className="pw-block-style"
                    id={idx === 0 ? "ipkvji-4-2-2-3-3-2" : "ipkvji-4-2-2-3-3-2-2"}
                  >
                    <img
                      className="pw-image-style"
                      src={member.image || (idx === 0 ? "/images/rectangle-899.png" : "/images/rectangle-898.png")}
                      loading="lazy"
                      id={idx === 0 ? "ib8xjf" : "ib8xjf-2"}
                      alt={member.name}
                    />
                  </div>
                  <div
                    className="pw-block-style"
                    id={idx === 0 ? "ipkvji-4-3-2-2-3-3-2" : "ipkvji-4-3-2-2-3-3-2-3"}
                  >
                    <div
                      className="pw-block-style"
                      id={idx === 0 ? "ipkvji-4-3-2-2-3-3-2-4" : "ipkvji-4-3-2-2-3-3-2-4-2"}
                    >
                      <h3
                        className="pw-user-text-style-68210bff-519a-4c4d-8aa2-b3b5be3cb987"
                        id={idx === 0 ? "ispyh-2-2-2-4-4-2-2-2-3-3-2-4" : "ispyh-2-2-2-4-4-2-2-2-3-3-2-4-2"}
                      >
                        {member.name}
                      </h3>
                      <p
                        className="pw-user-text-style-24b64575-cd02-447f-8652-42c6ba02cfec"
                        id={idx === 0 ? "ispyh-2-2-2-4-4-2-2-2-3-3-2-2-3" : "ispyh-2-2-2-4-4-2-2-2-3-3-2-2-3-2"}
                      >
                        {member.role}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="pwb-anchor" id="i3owk-2-2-2-2-2"></div>
        <div className="pwb-flex-grid-wrap" id="injpw-2"></div>

        {/* ===== SLIDE 11: CALL TO ACTION ===== */}
        <div className="pwb-flex-grid-wrap" id="ilwyn-3">
          <div className="pwb-flex-grid-wrap" id="i1lwz-2-7">
            <div className="pw-rows-style" id="i3oqmq">
              <h1
                className="pw-user-text-style-b1637bfe-8939-428c-b6b6-e73aa4f717d9"
                id="ispyh-2-2-3"
              >
                Ready to forge the future?
              </h1>
              <div className="pwb-flex-grid-wrap" id="i1lwz-2-2-2-2-2-2-2">
                <a
                  href="/recruit"
                  onClick={(e) => navigateTo(e, "/recruit")}
                  className="no-underline flex items-center gap-2 cursor-pointer transition-transform hover:scale-105"
                  id="cta-bottom-joinus"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    flexDirection: "row",
                    padding: "16px 24px",
                    justifyContent: "center",
                    backgroundColor: "#ffffff",
                    borderRadius: "8px",
                    gap: "8px",
                    height: "48px",
                    pointerEvents: "auto",
                    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
                  }}
                >
                  <p className="pw-user-text-style-db4943d4-453d-474d-b88a-07d9ad351c62 font-bold" id="cta-bottom-joinus-text" style={{ color: "#000000", fontWeight: 700, fontSize: "14px" }}>
                    Join Us
                  </p>
                  <img src="/images/group-1597882162.svg" loading="lazy" id="cta-bottom-joinus-icon" alt="arrow" style={{ width: "20px", height: "20px" }} />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* ===== LARGE EXPANDED FOOTER SECTION ===== */}
        <footer
          className="pwb-flex-grid-wrap w-full border-t border-white/15"
          id="injpw"
          style={{
            pointerEvents: "auto",
            backgroundColor: "rgba(5, 10, 20, 0.92)",
            backdropFilter: "blur(24px)",
          }}
        >
          {/* Top Subtle Cyan Glow Accent */}
          <div className="w-full h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent" />

          <div className="max-w-7xl mx-auto w-full px-6 sm:px-10 lg:px-12 py-16 lg:py-24">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-16 pb-16 border-b border-white/10">
              
              {/* Brand & College Info (5 Cols) */}
              <div className="md:col-span-5 space-y-6">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-full overflow-hidden border border-cyan-400/50 relative shadow-[0_0_15px_rgba(0,210,255,0.35)]">
                    <img src="/club-logo.png" alt="AI Foundry" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <span className="text-2xl font-bold tracking-wider text-cyan-400 font-mono block">
                      AI FOUNDRY
                    </span>
                    <span className="text-[11px] uppercase tracking-widest text-slate-400 font-mono">
                      RAISE AI CLUB &bull; DSU
                    </span>
                  </div>
                </div>

                <p className="text-slate-300 text-sm sm:text-base font-normal leading-relaxed max-w-md">
                  Dayananda Sagar University&apos;s flagship technology accelerator and student innovation hub, uniting engineers, researchers, and student founders.
                </p>

                <div className="space-y-2.5 text-xs text-slate-400 font-mono">
                  <div className="flex items-start gap-2.5">
                    <LocationIcon className="size-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                    <span>School of Engineering &bull; Dept of AI &amp; Robotics<br />Innovation Center, Kudlu Gate, Hosur Road, Bengaluru - 560068</span>
                  </div>
                  <div className="flex items-center gap-2.5 pt-1">
                    <Mail className="size-4 text-cyan-400 flex-shrink-0" />
                    <a href="mailto:info@aifoundry.com" className="hover:text-cyan-400 text-slate-300 transition-colors no-underline">
                      info@aifoundry.com
                    </a>
                  </div>
                </div>
              </div>

              {/* Navigation Column (2 Cols) */}
              <div className="md:col-span-2 space-y-4">
                <p className="text-xs font-bold uppercase tracking-widest text-cyan-400 font-mono">
                  Navigation
                </p>
                <ul className="space-y-3 text-sm text-slate-300">
                  <li>
                    <a
                      href="/about"
                      onClick={(e) => navigateTo(e, "/about")}
                      className="hover:text-cyan-400 transition-colors no-underline block py-0.5 cursor-pointer text-slate-300"
                    >
                      About Us
                    </a>
                  </li>
                  <li>
                    <a
                      href="/events"
                      onClick={(e) => navigateTo(e, "/events")}
                      className="hover:text-cyan-400 transition-colors no-underline block py-0.5 cursor-pointer text-slate-300"
                    >
                      Events &amp; Hackathons
                    </a>
                  </li>
                  <li>
                    <a
                      href="/team"
                      onClick={(e) => navigateTo(e, "/team")}
                      className="hover:text-cyan-400 transition-colors no-underline block py-0.5 cursor-pointer text-slate-300"
                    >
                      Leadership &amp; Faculty
                    </a>
                  </li>
                  <li>
                    <a
                      href="/gallery"
                      onClick={(e) => navigateTo(e, "/gallery")}
                      className="hover:text-cyan-400 transition-colors no-underline block py-0.5 cursor-pointer text-slate-300"
                    >
                      Media &amp; Archives
                    </a>
                  </li>
                  <li>
                    <a
                      href="/recruit"
                      onClick={(e) => navigateTo(e, "/recruit")}
                      className="hover:text-cyan-400 transition-colors no-underline block py-0.5 cursor-pointer text-slate-300"
                    >
                      Join AI Foundry
                    </a>
                  </li>
                </ul>
              </div>

              {/* Initiatives Column (2 Cols) */}
              <div className="md:col-span-2 space-y-4">
                <p className="text-xs font-bold uppercase tracking-widest text-cyan-400 font-mono">
                  Initiatives
                </p>
                <ul className="space-y-3 text-sm text-slate-300">
                  <li>
                    <a
                      href="/events"
                      onClick={(e) => navigateTo(e, "/events")}
                      className="hover:text-cyan-400 transition-colors no-underline block py-0.5 cursor-pointer text-slate-300"
                    >
                      24h Hackathons
                    </a>
                  </li>
                  <li>
                    <a
                      href="/recruit"
                      onClick={(e) => navigateTo(e, "/recruit")}
                      className="hover:text-cyan-400 transition-colors no-underline block py-0.5 cursor-pointer text-slate-300"
                    >
                      AI Incubation Lab
                    </a>
                  </li>
                  <li>
                    <a
                      href="/about"
                      onClick={(e) => navigateTo(e, "/about")}
                      className="hover:text-cyan-400 transition-colors no-underline block py-0.5 cursor-pointer text-slate-300"
                    >
                      Student Research
                    </a>
                  </li>
                  <li>
                    <a
                      href="/team"
                      onClick={(e) => navigateTo(e, "/team")}
                      className="hover:text-cyan-400 transition-colors no-underline block py-0.5 cursor-pointer text-slate-300"
                    >
                      Mentorship Network
                    </a>
                  </li>
                </ul>
              </div>

              {/* Socials & Connect (3 Cols) */}
              <div className="md:col-span-3 space-y-4">
                <p className="text-xs font-bold uppercase tracking-widest text-cyan-400 font-mono">
                  Connect &amp; Follow
                </p>
                <ul className="space-y-3 text-sm text-slate-300">
                  <li>
                    <a
                      href="https://linkedin.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-cyan-400 transition-colors no-underline inline-flex items-center gap-2.5 py-0.5 text-slate-300"
                    >
                      <LinkedinIcon className="size-4 text-cyan-400" />
                      <span>LinkedIn</span>
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://instagram.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-cyan-400 transition-colors no-underline inline-flex items-center gap-2.5 py-0.5 text-slate-300"
                    >
                      <InstagramIcon className="size-4 text-cyan-400" />
                      <span>Instagram</span>
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://github.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-cyan-400 transition-colors no-underline inline-flex items-center gap-2.5 py-0.5 text-slate-300"
                    >
                      <GithubIcon className="size-4 text-cyan-400" />
                      <span>GitHub</span>
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://x.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-cyan-400 transition-colors no-underline inline-flex items-center gap-2.5 py-0.5 text-slate-300"
                    >
                      <TwitterIcon className="size-4 text-cyan-400" />
                      <span>X (Twitter)</span>
                    </a>
                  </li>
                </ul>
              </div>
            </div>

            {/* Bottom Large Copyright Bar */}
            <div className="pt-10 flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-slate-400 font-mono">
              <p>&copy; {new Date().getFullYear()} AI Foundry (RAISE AI CLUB). Dayananda Sagar University. All rights reserved.</p>
              <p className="text-cyan-400 font-medium">Forging Future Innovators in AI &amp; Entrepreneurship</p>
            </div>
          </div>
        </footer>

        <div className="pwb-anchor" id="i3owk-2-2-2-2"></div>
      </div>

      {/* Hidden PeachWeb Runtime Initialization Container */}
      <div id="pwb-loading-wrap" style={{ display: "none" }} suppressHydrationWarning>
        <div className="pwb-flex-grid-wrap" id="im3p5" suppressHydrationWarning>
          <div className="pwb-loading-bar" id="iw9p8" suppressHydrationWarning>
            <svg id="i1g4c" width="162" height="162" suppressHydrationWarning>
              <circle id="i8t08" suppressHydrationWarning />
              <circle className="pwb-loading-bar-circle" id="ihfw6" suppressHydrationWarning />
            </svg>
            <div id="ispyh-2-3-2-3-3-2-4" suppressHydrationWarning>AI FOUNDRY</div>
            <div className="pwb-loading-bar-text" id="ijg95" suppressHydrationWarning>100%</div>
          </div>
        </div>
        <div className="pwb-flex-grid-wrap" id="ieupsz" suppressHydrationWarning>
          <img src="/images/pw-badge-dark.svg" loading="lazy" id="igqob3" alt="" suppressHydrationWarning />
        </div>
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
