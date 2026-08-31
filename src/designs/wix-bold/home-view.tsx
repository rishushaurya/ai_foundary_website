"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { HomeViewProps } from "../types";
import { WixBoldFooter } from "./footer";
import { RegistrationModal } from "@/components/ui/registration-modal";
import { EventData } from "@/lib/data";
import { normalizeImageUrl } from "@/lib/image-helper";

export function WixBoldHomeView({
  events,
  team,
  gallerySections,
  aboutText,
  landingContent,
  socialLinks,
  visiblePages,
}: HomeViewProps) {
  const [selectedRegEvent, setSelectedRegEvent] = useState<EventData | null>(null);

  // Extract gallery photos for Life at AI Foundry marquee ribbon
  const marqueeImages = useMemo(() => {
    const collected: { src: string; title: string; caption?: string }[] = [];
    if (gallerySections && gallerySections.length > 0) {
      gallerySections.forEach((section) => {
        section.items?.forEach((item) => {
          if (item.type === "image" || !item.type) {
            collected.push({
              src: item.url,
              title: item.name || section.name,
              caption: section.name,
            });
          }
        });
      });
    }

    if (collected.length === 0) {
      return [
        { src: "/images/rectangle-3.png", title: "Autonomous Systems Lab", caption: "Hardware & Edge Rigs" },
        { src: "/images/rectangle-5.png", title: "Hackathon Build Sprint", caption: "24h Prototyping" },
        { src: "/images/rectangle-8.png", title: "GPU Compute Cluster", caption: "Distributed LLM Training" },
        { src: "/images/rectangle-898.png", title: "AI Research Symposium", caption: "Faculty & Industry Keynotes" },
        { src: "/images/rectangle-899.png", title: "Student Founder Demo Day", caption: "Venture Pitches" },
        { src: "/images/rectangle-902.png", title: "Deep Tech Workshop", caption: "Agentic Architectures" },
      ];
    }
    return collected;
  }, [gallerySections]);

  // Dynamic events for Hackathons & Sprints section
  const displayEvents: EventData[] = useMemo(() => {
    const active = events?.filter((e) => e.showOnHome !== false && e.status !== "ended") || [];
    if (active.length > 0) return active.slice(0, 4);
    if (events && events.length > 0) return events.slice(0, 4);
    return [
      {
        id: "escape-room",
        title: "Escape Room",
        description:
          "An intense problem-solving challenge with AI puzzles, logic gates, and collaborative escape tasks designed for engineering minds.",
        image: "/images/rectangle-3.png",
        date: "Nov 12, 2026 • 10:00 AM",
        venue: "Main Campus Auditorium",
        status: "upcoming" as const,
        registrationMode: "builtin" as const,
        isRegistrationOpen: true,
      },
      {
        id: "24h-hackathon",
        title: "24 hour Hackothan",
        description:
          "A 24-hour team-based innovation challenge where DSU students identify a problem, develop a technology-driven solution, build a prototype, and present it to judges. It develops problem-solving, teamwork, innovation, time management, technical skills and communication through hands-on experience.",
        image: "/images/rectangle-5.png",
        date: "Oct 24 - 25, 2026 • 09:00 AM",
        venue: "DSU Innovation Center & Compute Lab",
        status: "upcoming" as const,
        registrationMode: "builtin" as const,
        isRegistrationOpen: true,
      },
    ];
  }, [events]);

  // Helper to calculate exact registration availability based on admin controls & dates
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

  // Dynamic leadership members: strictly respect the admin-configured landing page team
  const displayLeadership = useMemo(() => {
    if (landingContent?.teamMembers && landingContent.teamMembers.length > 0) {
      return landingContent.teamMembers.map((m) => {
        // Cross reference with full team dataset to inherit rich attributes like socialLinks/email if available
        const matched = team?.find(
          (t) => t.id === m.id || t.name.toLowerCase().trim() === m.name.toLowerCase().trim()
        );

        return {
          id: m.id,
          name: m.name,
          role: m.role,
          image: m.image || matched?.image || "/images/rectangle-899.png",
          affiliation: m.bio || matched?.affiliation || "Department of CSE (AI & ML)",
          socialLinks: matched?.socialLinks || {},
          email: matched?.email || "",
          imageFit: m.imageFit || matched?.imageFit || ("cover" as const),
          imagePosition: m.imagePosition || matched?.imagePosition || ("center" as const),
        };
      });
    }

    if (team && team.length > 0) {
      const homeMembers = team.filter((m) => m.showOnHome !== false);
      const chosen = homeMembers.length > 0 ? homeMembers.slice(0, 3) : team.slice(0, 3);
      return chosen.map((m) => ({
        id: m.id,
        name: m.name,
        role: m.role,
        image: m.image,
        affiliation: m.affiliation || "Department of CSE (AI & ML)",
        socialLinks: m.socialLinks || {},
        email: m.email || "",
        imageFit: m.imageFit || ("cover" as const),
        imagePosition: m.imagePosition || ("center" as const),
      }));
    }

    return [
      {
        id: "lead-1",
        name: "Dr. Jayavrinda Vrindavanam V",
        role: "Club Coordinator & Chairperson CSE (AI & ML)",
        image: "https://i.ibb.co/Cp38dC4N/edited-photo-2.jpg",
        affiliation: "Chairperson & Professor, DSU",
        socialLinks: {},
        email: "",
        imageFit: "cover" as const,
        imagePosition: "top" as const,
      },
      {
        id: "lead-2",
        name: "Dr. M Lakshmanan",
        role: "Club Advisor",
        image: "https://i.ibb.co/DPSZJQkQ/lakshmanan.png",
        affiliation: "Assistant Professor, CSE (AI & ML)",
        socialLinks: {},
        email: "lakshmanan-cse@dsu.edu.in",
        imageFit: "cover" as const,
        imagePosition: "top" as const,
      },
      {
        id: "lead-3",
        name: "Dr. A. A. Nippun Kumaar",
        role: "Club Advisor",
        image: "https://i.ibb.co/RkmB4tJm/AA-Nippunkumar.jpg",
        affiliation: "Associate Professor, CSE (AI & ML)",
        socialLinks: {},
        email: "nippun-cse@dsu.edu.in",
        imageFit: "cover" as const,
        imagePosition: "top" as const,
      },
    ];
  }, [team, landingContent]);

  // Approach cards
  const approachCards = useMemo(() => {
    if (landingContent?.approach && landingContent.approach.length > 0) {
      return landingContent.approach;
    }
    return [
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
    ];
  }, [landingContent]);

  const getImageAlignmentClass = (fit?: "cover" | "contain", pos?: "center" | "top" | "bottom") => {
    const fitClass = fit === "contain" ? "object-contain" : "object-cover";
    const posClass = pos === "top" ? "object-top" : pos === "bottom" ? "object-bottom" : "object-center";
    return `${fitClass} ${posClass}`;
  };

  // Helper to ONLY render social links that actually exist and have non-empty URLs
  const renderSocialBadges = (
    socialLinks?: {
      linkedin?: string;
      github?: string;
      instagram?: string;
      twitter?: string;
      website?: string;
    },
    email?: string
  ) => {
    const validLinks = [
      socialLinks?.linkedin && socialLinks.linkedin.trim().length > 3 && {
        href: socialLinks.linkedin,
        label: "LinkedIn",
        icon: (
          <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
            <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.64a1.64 1.64 0 1 0 0 3.28 1.64 1.64 0 0 0 0-3.28z" />
          </svg>
        ),
      },
      socialLinks?.github && socialLinks.github.trim().length > 3 && {
        href: socialLinks.github,
        label: "GitHub",
        icon: (
          <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
            <path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.1-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2z" />
          </svg>
        ),
      },
      socialLinks?.instagram && socialLinks.instagram.trim().length > 3 && {
        href: socialLinks.instagram,
        label: "Instagram",
        icon: (
          <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
          </svg>
        ),
      },
      socialLinks?.twitter && socialLinks.twitter.trim().length > 3 && {
        href: socialLinks.twitter,
        label: "Twitter",
        icon: (
          <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
        ),
      },
      email && email.trim().includes("@") && {
        href: `mailto:${email.trim()}`,
        label: "Email",
        icon: (
          <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
            <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
          </svg>
        ),
      },
    ].filter(Boolean) as { href: string; label: string; icon: React.ReactNode }[];

    if (validLinks.length === 0) return null;

    return (
      <div className="flex flex-wrap items-center gap-1.5 pt-2">
        {validLinks.map((link) => (
          <a
            key={link.label}
            href={link.href}
            target={link.label === "Email" ? undefined : "_blank"}
            rel={link.label === "Email" ? undefined : "noopener noreferrer"}
            title={link.label}
            className="p-1.5 rounded-md bg-[#2D2E2A]/10 text-[#2D2E2A] hover:bg-[#2D2E2A] hover:text-[#FFFFE9] transition-all flex items-center justify-center cursor-pointer"
          >
            {link.icon}
          </a>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#FFFFE9] text-[#2D2E2A] selection:bg-[#2D2E2A] selection:text-[#FFFFE9] font-sans overflow-x-hidden">
      {/* ---------------------------------------------------- */}
      {/* SECTION 1: HERO SECTION (RAISE AI + DUAL ROBOTS)      */}
      {/* ---------------------------------------------------- */}
      <section className="pt-6 pb-20 sm:pt-12 sm:pb-32">
        <div className="max-w-5xl mx-auto px-6 sm:px-8">
          {/* Top Brand Name + Dual Flanking Robot Illustrations */}
          <div className="flex justify-center items-center space-x-6 sm:space-x-12 mb-10">
            {/* Left Robot (Tilted -12deg) */}
            <div className="w-16 h-20 sm:w-24 sm:h-28 relative transform -rotate-12 flex-shrink-0">
              <Image
                src="/images/design2/robot_hero.png"
                alt="AI Robot Illustration Left"
                fill
                className="object-contain"
                priority
              />
            </div>

            {/* Central Club Title */}
            <div className="text-center px-3">
              <span className="text-xs sm:text-sm font-extrabold tracking-[0.3em] uppercase text-[#2D2E2A] border-b-2 border-[#2D2E2A] pb-1">
                RAISE AI
              </span>
              <p className="text-[10px] font-mono tracking-widest text-[#424440] uppercase mt-1">
                AI FOUNDRY • DSU
              </p>
            </div>

            {/* Right Robot (Tilted +12deg) */}
            <div className="w-16 h-20 sm:w-24 sm:h-28 relative transform rotate-12 flex-shrink-0">
              <Image
                src="/images/design2/robot_hero_right.png"
                alt="AI Robot Illustration Right"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>

          {/* Script / Calligraphic Headline: 𝐹𝒪𝑅𝒢𝐼𝒩𝒢 𝒯𝐻𝐸 𝐹𝒰𝒯𝒰𝑅𝐸 𝒪𝐹 𝐸𝒩𝒯𝑅𝐸𝒫𝑅𝐸𝒩𝐸𝒰𝑅𝒮𝐻𝐼𝒫 & 𝒜𝑅𝒯𝐼𝐹𝐼𝒞𝐼𝒜𝐿 𝐼𝒩𝒯𝐸𝐿𝐿𝐼𝒢𝐸𝒩𝒞𝐸 */}
          <div className="space-y-8 pl-2 sm:pl-8 md:pl-12 lg:pl-16">
            <h1 className="text-2xl sm:text-4xl md:text-[46px] font-serif font-normal tracking-wide text-[#2D2E2A] leading-[1.3] max-w-4xl selection:bg-[#2D2E2A] selection:text-[#FFFFE9]">
              <span className="block text-3xl sm:text-5xl md:text-[52px] tracking-wider mb-2">
                𝐹𝒪𝑅𝒢𝐼𝒩𝒢 𝒯𝐻𝐸 𝐹𝒰𝒯𝒰𝑅𝐸 𝒪𝐹
              </span>
              <span className="italic underline decoration-[#2D2E2A]/30 decoration-1 underline-offset-8">
                𝐸𝒩𝒯𝑅𝐸𝒫𝑅𝐸𝒩𝐸𝒰𝑅𝒮𝐻𝐼𝒫
              </span>{" "}
              &amp;{" "}
              <span className="tracking-wide">
                𝒜𝑅𝒯𝐼𝐹𝐼𝒞𝐼𝒜𝐿 𝐼𝒩𝒯𝐸𝐿𝐿𝐼𝒢𝐸𝒩𝒞𝐸
              </span>
            </h1>

            {/* Subtext and JoinUS Action */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pt-2 max-w-3xl">
              <p className="text-xs sm:text-sm text-[#2D2E2A] leading-relaxed font-normal">
                {landingContent?.heroSubtext ||
                  "Dayananda Sagar University's premier innovation ecosystem uniting engineers, designers, researchers, and student founders in artificial intelligence."}
              </p>

              {visiblePages?.recruit !== false && (
                <Link
                  href="/recruit"
                  className="px-8 py-3 rounded-full text-xs font-semibold uppercase tracking-wider bg-[#2D2E2A] text-[#FFFFE9] hover:bg-[#424440] transition-colors whitespace-nowrap self-start sm:self-auto shadow-sm"
                >
                  JoinUS
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------- */}
      {/* SECTION 2: ABOUT US (ROBOT BANNER + RICH COPY)       */}
      {/* ---------------------------------------------------- */}
      <section className="py-16 sm:py-28">
        <div className="max-w-5xl mx-auto px-6 sm:px-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 sm:gap-14 items-center">
            {/* Left Column: Robot Holding About Us Banner */}
            <div className="md:col-span-5 flex justify-center md:justify-start">
              <div className="w-64 h-72 sm:w-80 sm:h-96 relative">
                <Image
                  src="/images/design2/robot_about_banner.svg"
                  alt="About Us Robot Illustration with Banner"
                  fill
                  className="object-contain"
                />
              </div>
            </div>

            {/* Right Column: Heading, Circular Logo Badge, and Dynamic Copy */}
            <div className="md:col-span-7 space-y-6">
              <div className="flex items-center space-x-4">
                <h2 className="text-3xl sm:text-4xl font-serif italic text-[#2D2E2A]">
                  {landingContent?.aboutTitle || "About US"}
                </h2>
                {/* AI Foundry / RAISE AI Circular Logo Badge */}
                <div className="w-8 h-8 sm:w-10 sm:h-10 relative flex-shrink-0">
                  <Image
                    src="/images/design2/raise_logo_badge.png"
                    alt="AI Foundry Logo Badge"
                    fill
                    className="object-contain"
                  />
                </div>
              </div>

              <div className="space-y-4 text-xs sm:text-sm text-[#2D2E2A] leading-relaxed font-normal">
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
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------- */}
      {/* SECTION 3: HACKATHONS (ADMIN-CONTROLLED REGISTRATION)*/}
      {/* ---------------------------------------------------- */}
      <section className="py-16 sm:py-28">
        <div className="max-w-5xl mx-auto px-6 sm:px-8">
          {/* Section Heading & Center Icon */}
          <div className="text-center space-y-3 mb-12">
            <div className="inline-flex items-center justify-center w-12 h-12 relative mb-2">
              <Image
                src="/images/design2/foundry_icon.svg"
                alt="Foundry Emblem"
                fill
                className="object-contain"
              />
            </div>
            <h2 className="text-3xl sm:text-4xl font-serif text-[#2D2E2A]">
              Hackathons, Workshops &amp; Sprints
            </h2>
            <div className="flex flex-col sm:flex-row items-center justify-between pt-4 gap-4">
              <span className="text-[11px] font-medium tracking-[0.2em] text-[#424440] uppercase">
                UPCOMING EVENTS &amp; SPRINTS
              </span>
              {visiblePages?.events !== false && (
                <Link
                  href="/events"
                  className="px-6 py-2 rounded-full text-xs font-normal border border-[#2D2E2A] text-[#2D2E2A] hover:bg-[#2D2E2A] hover:text-[#FFFFE9] transition-all"
                >
                  View All Events
                </Link>
              )}
            </div>
          </div>

          {/* Responsive Event Cards Grid with Real-Time Registration Action */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 items-stretch">
            {displayEvents.map((ev) => {
              const regStatus = getEventRegistrationStatus(ev);
              const formattedDate = ev.date
                ? ev.date.includes("•") || ev.date.includes("AM") || ev.date.includes("PM")
                  ? ev.date
                  : new Date(ev.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                : "TBA";

              return (
                <div
                  key={ev.id || ev.title}
                  className="bg-[#C6CCBD] rounded-[28px] p-6 sm:p-8 flex flex-col justify-between border border-[#2D2E2A]/10 shadow-sm transition-all hover:shadow-md"
                >
                  <div>
                    {/* Optional Card Image */}
                    {(ev.homeImage || ev.image) && (
                      <div className="w-full h-44 sm:h-48 relative rounded-2xl overflow-hidden mb-5 border border-[#2D2E2A]/15 bg-[#FFFFE9]/50">
                        <img
                          src={normalizeImageUrl(ev.homeImage || ev.image)}
                          alt={ev.title}
                          className={`w-full h-full ${getImageAlignmentClass(ev.imageFit, ev.imagePosition)}`}
                        />
                      </div>
                    )}

                    {/* Title + Robotic Monospace Date Badge */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#2D2E2A]/20">
                      <h3 className="text-[16px] font-medium text-[#2D2E2A]">
                        {ev.title}
                      </h3>
                      {/* Robotic Monospace Font Badge for Date/Time */}
                      <span className="font-mono text-[10px] sm:text-[11px] font-bold tracking-wider uppercase bg-[#2D2E2A] text-[#ECFF17] px-2.5 py-1 rounded-md shadow-xs">
                        [ {formattedDate} ]
                      </span>
                    </div>

                    {ev.description && (
                      <p className="mt-4 text-xs sm:text-sm text-[#2D2E2A] leading-relaxed font-normal whitespace-pre-line">
                        {ev.description}
                      </p>
                    )}
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
      </section>

      {/* ---------------------------------------------------- */}
      {/* SECTION 4: LIFE AT AI FOUNDRY (MARQUEE RIBBON)       */}
      {/* ---------------------------------------------------- */}
      <section className="py-16 sm:py-28 overflow-hidden">
        <div className="max-w-5xl mx-auto px-6 sm:px-8 mb-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-left">
              <h2 className="text-xs font-semibold tracking-[0.24em] text-[#2D2E2A] uppercase">
                LIFE AT AI FOUNDRY
              </h2>
              <p className="text-xs text-[#424440] mt-1">some compilation of images</p>
            </div>

            {visiblePages?.gallery !== false && (
              <Link
                href="/gallery"
                className="px-6 py-2 rounded-full text-xs font-normal border border-[#2D2E2A] text-[#2D2E2A] hover:bg-[#2D2E2A] hover:text-[#FFFFE9] transition-all whitespace-nowrap"
              >
                View Full Gallery
              </Link>
            )}
          </div>
        </div>

        {/* Continuous Infinite Marquee Ribbon */}
        <div className="w-full relative group">
          <div className="flex w-max space-x-6 animate-marquee group-hover:[animation-play-state:paused]">
            {[...marqueeImages, ...marqueeImages].map((img, idx) => (
              <div
                key={`${img.title}-${idx}`}
                className="w-72 sm:w-80 flex-shrink-0 bg-[#C6CCBD]/40 border border-[#2D2E2A]/20 rounded-2xl p-3 space-y-3 hover:border-[#2D2E2A] transition-all"
              >
                <div className="w-full h-44 sm:h-48 relative rounded-xl overflow-hidden bg-[#C6CCBD]">
                  <Image
                    src={img.src}
                    alt={img.title}
                    fill
                    className="object-cover transition-transform duration-500 hover:scale-105"
                  />
                </div>
                <div className="px-1">
                  <h3 className="text-xs font-semibold text-[#2D2E2A] truncate">
                    {img.title}
                  </h3>
                  {img.caption && (
                    <p className="text-[11px] text-[#424440] truncate mt-0.5">
                      {img.caption}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------- */}
      {/* SECTION 5: OUR APPROACH                              */}
      {/* ---------------------------------------------------- */}
      <section className="py-16 sm:py-28">
        <div className="max-w-5xl mx-auto px-6 sm:px-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 sm:gap-14 items-start">
            {/* Left Column Heading & Innovation Artwork */}
            <div className="md:col-span-5 space-y-6">
              <h2 className="text-4xl sm:text-5xl font-serif font-bold uppercase tracking-tight text-[#2D2E2A] leading-tight">
                {landingContent?.approachHeading || "OUR APPROACH"}
              </h2>
              <p className="text-base sm:text-lg font-serif italic text-[#2D2E2A] leading-relaxed max-w-xs">
                {landingContent?.approachSubtext ||
                  "We foster a dynamic environment where students can transform their ideas into impactful AI and entrepreneurial ventures."}
              </p>

              {/* Artwork Illustration: Hidden on phone, visible on md+ screens */}
              <div className="hidden md:block pt-2">
                <div className="w-full max-w-[260px] h-60 relative">
                  <Image
                    src="/images/design2/approach_illustration.png"
                    alt="Our Approach Innovation Illustration"
                    fill
                    className="object-contain"
                  />
                </div>
              </div>
            </div>

            {/* Right Column: Bordered Method Cards */}
            <div className="md:col-span-7 space-y-4">
              {approachCards.map((app) => (
                <div
                  key={app.id || app.title}
                  className="border border-[#2D2E2A] p-6 sm:p-7 rounded-sm bg-[#FFFFE9]"
                >
                  <h3 className="text-lg sm:text-xl font-serif italic text-[#2D2E2A] mb-2.5">
                    {app.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#2D2E2A] leading-relaxed font-normal">
                    {app.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------- */}
      {/* SECTION 6: LEADERSHIP & ADVISORY (MEMBER CARDS GRID) */}
      {/* ---------------------------------------------------- */}
      <section className="py-16 sm:py-28">
        <div className="max-w-5xl mx-auto px-6 sm:px-8 space-y-10">
          {/* Header Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div>
              <h2 className="text-3xl sm:text-4xl font-serif font-bold uppercase tracking-tight text-[#2D2E2A] leading-tight">
                {landingContent?.teamHeading || "LEADERSHIP & ADVISORY"}
              </h2>
            </div>

            {visiblePages?.team !== false && (
              <Link
                href="/team"
                className="px-8 py-3 rounded-full text-xs font-semibold uppercase tracking-wider bg-[#2D2E2A] text-[#FFFFE9] hover:bg-[#424440] transition-colors self-start sm:self-auto shadow-sm"
              >
                View Full Team
              </Link>
            )}
          </div>

          {/* Member Cards Grid with Image Alignment and Verified Social Icons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 pt-4">
            {displayLeadership.map((member) => (
              <div
                key={member.id || member.name}
                className="bg-[#C6CCBD]/40 rounded-2xl p-5 border border-[#2D2E2A]/20 hover:border-[#2D2E2A] transition-all space-y-4 flex flex-col justify-between"
              >
                <div>
                  {/* Photo Frame Container with Image Alignment */}
                  <div className="w-full h-52 sm:h-60 relative rounded-xl overflow-hidden bg-[#C6CCBD] border border-[#2D2E2A]/10 mb-4">
                    {member.image ? (
                      <img
                        src={normalizeImageUrl(member.image)}
                        alt={member.name}
                        className={`w-full h-full ${getImageAlignmentClass(member.imageFit, member.imagePosition)}`}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-serif text-2xl font-bold text-[#2D2E2A]">
                        {member.name.charAt(0)}
                      </div>
                    )}
                  </div>

                  <h3 className="text-sm sm:text-base font-semibold text-[#2D2E2A]">
                    {member.name}
                  </h3>
                  <p className="text-xs font-medium text-[#424440] mt-0.5">
                    {member.role}
                  </p>
                  {member.affiliation && (
                    <p className="text-[11px] text-[#666864] uppercase tracking-wider mt-1">
                      {member.affiliation}
                    </p>
                  )}
                </div>

                {/* Render verified social icons (ONLY if uploaded) & profile link */}
                <div className="pt-3 border-t border-[#2D2E2A]/15 flex items-center justify-between text-xs text-[#2D2E2A]">
                  <div>
                    {renderSocialBadges(member.socialLinks, member.email)}
                  </div>

                  <Link
                    href="/team"
                    className="text-[11px] uppercase tracking-wider font-semibold hover:underline"
                  >
                    Profile →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------- */}
      {/* EMBEDDED LANDING FOOTER FOR DESIGN 2                 */}
      {/* ---------------------------------------------------- */}
      <WixBoldFooter socialLinks={socialLinks} visiblePages={visiblePages} />

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
