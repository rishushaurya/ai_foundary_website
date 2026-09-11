"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Trophy, ArrowRight } from "lucide-react";
import { normalizeImageUrl } from "@/lib/image-helper";
import { TeamViewProps } from "../types";

export function WixBoldTeamView({ faculty, executives, wings }: TeamViewProps) {
  const [selectedWing, setSelectedWing] = useState<string>("All");

  const defaultFaculty = [
    {
      id: "fac-1",
      name: "Dr. Jayavrinda Vrindavanam V",
      role: "Club Coordinator & Chairperson CSE (AI & ML)",
      category: "faculty" as const,
      affiliation: "Professor & Chairperson, DSU Bengaluru",
      image: "https://i.ibb.co/Cp38dC4N/edited-photo-2.jpg",
      email: "",
      socialLinks: {},
      imageFit: "cover" as const,
      imagePosition: "top" as const,
    },
    {
      id: "fac-2",
      name: "Dr. M Lakshmanan",
      role: "Faculty Advisor",
      category: "faculty" as const,
      affiliation: "Assistant Professor, CSE (AI & ML), DSU",
      image: "https://i.ibb.co/DPSZJQkQ/lakshmanan.png",
      email: "lakshmanan-cse@dsu.edu.in",
      socialLinks: {},
      imageFit: "cover" as const,
      imagePosition: "top" as const,
    },
    {
      id: "fac-3",
      name: "Dr. A. A. Nippun Kumaar",
      role: "Faculty Advisor",
      category: "faculty" as const,
      affiliation: "Associate Professor, CSE (AI & ML), DSU",
      image: "https://i.ibb.co/RkmB4tJm/AA-Nippunkumar.jpg",
      email: "nippun-cse@dsu.edu.in",
      socialLinks: {},
      imageFit: "cover" as const,
      imagePosition: "top" as const,
    },
  ];

  const defaultExecutives = [
    {
      id: "exec-1",
      name: "Syed Amaan",
      role: "Chief Executive Officer",
      category: "executive" as const,
      affiliation: "Dept. of CSE (AI & ML)",
      image: "https://i.ibb.co/F4XvPDf3/Syed-Amaan.jpg",
      email: "raise.ai.club@gmail.com",
      socialLinks: {},
      imageFit: "contain" as const,
      imagePosition: "center" as const,
    },
    {
      id: "exec-2",
      name: "Mallikarjuna DM",
      role: "Chief Technology Officer",
      category: "executive" as const,
      affiliation: "School of Engineering",
      image: "https://i.ibb.co/cKxds9ML/Mallikarjuna-DM.jpg",
      email: "",
      socialLinks: {},
      imageFit: "cover" as const,
      imagePosition: "center" as const,
    },
  ];

  const defaultWings = [
    {
      id: "wing-1",
      name: "Priyanshu Shaurya",
      role: "Tech lead",
      category: "team" as const,
      affiliation: "CSE-core",
      image: "https://i.ibb.co/tTNPdw2k/1000085349.jpg",
      email: "priyanshushaurya9431@gmail.com",
      socialLinks: {
        linkedin: "https://www.linkedin.com/in/priyanshu-shaurya-3ba575380/",
        github: "https://github.com/rishushaurya?tab=overview&from=2026-07-01&to=2026-07-31",
      },
      imageFit: "contain" as const,
      imagePosition: "center" as const,
    },
  ];

  const facultyList = faculty && faculty.length > 0 ? faculty : defaultFaculty;
  const execList = executives && executives.length > 0 ? executives : defaultExecutives;
  const wingList = wings && wings.length > 0 ? wings : defaultWings;

  // Categories dynamically derived from wing list
  const categories = useMemo(() => {
    const affiliations = Array.from(
      new Set(
        wingList
          .map((w) => w.affiliation || w.role)
          .filter(Boolean)
          .map((a) => a.trim())
      )
    );
    return ["All", ...affiliations];
  }, [wingList]);

  const filteredWings =
    selectedWing === "All"
      ? wingList
      : wingList.filter(
          (w) =>
            (w.affiliation && w.affiliation.toLowerCase().includes(selectedWing.toLowerCase())) ||
            (w.role && w.role.toLowerCase().includes(selectedWing.toLowerCase()))
        );

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
    email?: string,
    lightTheme: boolean = false
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
      socialLinks?.website && socialLinks.website.trim().length > 3 && {
        href: socialLinks.website,
        label: "Website",
        icon: (
          <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
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
      <div className="flex flex-wrap items-center gap-2 pt-2">
        {validLinks.map((link) => (
          <a
            key={link.label}
            href={link.href}
            target={link.label === "Email" ? undefined : "_blank"}
            rel={link.label === "Email" ? undefined : "noopener noreferrer"}
            title={link.label}
            className={`p-1.5 rounded-md transition-all flex items-center justify-center cursor-pointer ${
              lightTheme
                ? "bg-[#2D2E2A]/10 text-[#2D2E2A] hover:bg-[#2D2E2A] hover:text-[#FFFFE9]"
                : "bg-white/10 text-[#FFFFE9]/80 hover:bg-[#ECFF17] hover:text-[#2D2E2A]"
            }`}
          >
            {link.icon}
          </a>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#FFFFE9] text-[#2D2E2A] selection:bg-[#2D2E2A] selection:text-[#FFFFE9] font-sans">
      {/* ---------------------------------------------------- */}
      {/* TOP MASTHEAD (LIGHT CANVAS)                          */}
      {/* ---------------------------------------------------- */}
      <section className="py-12 sm:py-20 max-w-5xl mx-auto px-6 sm:px-8">
        <div className="space-y-4 max-w-2xl">
          <h1 className="text-3xl sm:text-5xl font-serif italic text-[#2D2E2A]">
            Team Members
          </h1>
          <p className="text-xs sm:text-sm text-[#2D2E2A] leading-relaxed font-normal">
            Faculty mentors, executive founders, and student domain leads driving the
            AI Foundry innovation ecosystem at Dayananda Sagar University.
          </p>

          <div className="pt-2">
            <Link
              href="/leaderboard"
              className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-[#2D2E2A] text-[#FFFFE9] hover:text-[#ECFF17] text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer shadow-sm hover:shadow-md"
            >
              <Trophy className="size-3.5 text-[#ECFF17]" />
              <span>Live Tournament Leaderboard</span>
              <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------- */}
      {/* DARK TEAM CONTAINER SECTION (DARK OBSIDIAN / CHARCOAL) */}
      {/* ---------------------------------------------------- */}
      <section className="bg-[#232521] text-[#FFFFE9] py-16 sm:py-28">
        <div className="max-w-5xl mx-auto px-6 sm:px-8 space-y-20">
          {/* TIER 1: FACULTY ADVISORY BOARD */}
          <div className="space-y-8">
            <div className="border-b border-[#FFFFE9]/20 pb-4">
              <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#ECFF17]">
                ACADEMIC MENTORSHIP
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif text-[#FFFFE9] mt-1">
                Faculty Advisory Board
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {facultyList.map((m) => (
                <div
                  key={m.id || m.name}
                  className="bg-[#2D2E2A] rounded-2xl p-6 border border-[#FFFFE9]/15 hover:border-[#ECFF17] transition-all space-y-4 flex flex-col justify-between"
                >
                  <div>
                    <div className="w-full h-56 relative rounded-xl overflow-hidden bg-[#1A1C18] border border-[#FFFFE9]/10 mb-4">
                      {m.image ? (
                        <img
                          src={normalizeImageUrl(m.image)}
                          alt={m.name}
                          className={`w-full h-full ${getImageAlignmentClass(m.imageFit, m.imagePosition)}`}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center font-serif text-3xl font-bold text-[#ECFF17]">
                          {m.name.charAt(0)}
                        </div>
                      )}
                    </div>

                    <h3 className="text-base font-semibold text-[#FFFFE9]">
                      {m.name}
                    </h3>
                    <p className="text-xs text-[#ECFF17] font-medium mt-0.5">
                      {m.role}
                    </p>
                    {m.affiliation && (
                      <p className="text-[11px] text-[#FFFFE9]/60 uppercase tracking-wider mt-1">
                        {m.affiliation}
                      </p>
                    )}
                  </div>

                  {/* Render verified social & email icons ONLY if uploaded */}
                  {renderSocialBadges(m.socialLinks, m.email, false)}
                </div>
              ))}
            </div>
          </div>

          {/* TIER 2: EXECUTIVE LEADERSHIP */}
          <div className="space-y-8">
            <div className="border-b border-[#FFFFE9]/20 pb-4">
              <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#ECFF17]">
                FOUNDRY GOVERNANCE
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif text-[#FFFFE9] mt-1">
                Executive Leadership Board
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {execList.map((m) => (
                <div
                  key={m.id || m.name}
                  className="bg-[#2D2E2A] rounded-2xl p-6 border border-[#FFFFE9]/15 hover:border-[#ECFF17] transition-all space-y-4 flex flex-col justify-between"
                >
                  <div>
                    <div className="w-full h-60 relative rounded-xl overflow-hidden bg-[#1A1C18] border border-[#FFFFE9]/10 mb-4">
                      {m.image ? (
                        <img
                          src={normalizeImageUrl(m.image)}
                          alt={m.name}
                          className={`w-full h-full ${getImageAlignmentClass(m.imageFit, m.imagePosition)}`}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center font-serif text-3xl font-bold text-[#ECFF17]">
                          {m.name.charAt(0)}
                        </div>
                      )}
                    </div>

                    <h3 className="text-base font-semibold text-[#FFFFE9]">
                      {m.name}
                    </h3>
                    <p className="text-xs text-[#ECFF17] font-medium mt-0.5">
                      {m.role}
                    </p>
                    {m.affiliation && (
                      <p className="text-[11px] text-[#FFFFE9]/60 uppercase tracking-wider mt-1">
                        {m.affiliation}
                      </p>
                    )}
                  </div>

                  {/* Render verified social & email icons ONLY if uploaded */}
                  {renderSocialBadges(m.socialLinks, m.email, false)}
                </div>
              ))}
            </div>
          </div>

          {/* TIER 3: FOUNDRY WINGS & DOMAIN LEADS */}
          <div className="space-y-8">
            <div className="border-b border-[#FFFFE9]/20 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#ECFF17]">
                  STUDENT DOMAIN TEAMS
                </span>
                <h2 className="text-2xl sm:text-3xl font-serif text-[#FFFFE9] mt-1">
                  Foundry Wings &amp; Leads
                </h2>
              </div>

              {/* Category Filter Pills */}
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedWing(cat)}
                    className={`px-3 py-1 rounded-full text-[11px] font-medium uppercase tracking-wider transition-all cursor-pointer ${
                      selectedWing === cat
                        ? "bg-[#ECFF17] text-[#2D2E2A]"
                        : "bg-[#2D2E2A] text-[#FFFFE9]/80 hover:text-[#FFFFE9] border border-[#FFFFE9]/20"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
              {filteredWings.map((m) => (
                <div
                  key={m.id || m.name}
                  className="bg-[#2D2E2A]/70 rounded-xl p-4 border border-[#FFFFE9]/15 hover:border-[#FFFFE9]/40 transition-all space-y-3"
                >
                  <div className="w-full h-40 relative rounded-lg overflow-hidden bg-[#1A1C18] border border-[#FFFFE9]/10">
                    {m.image ? (
                      <img
                        src={normalizeImageUrl(m.image)}
                        alt={m.name}
                        className={`w-full h-full ${getImageAlignmentClass(m.imageFit, m.imagePosition)}`}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-serif text-xl font-bold text-[#FFFFE9]/40">
                        {m.name.charAt(0)}
                      </div>
                    )}
                  </div>

                  <div>
                    <span className="text-[9px] font-bold tracking-widest uppercase text-[#ECFF17]">
                      DOMAIN LEAD
                    </span>
                    <h3 className="text-xs font-semibold text-[#FFFFE9] truncate mt-0.5">
                      {m.name}
                    </h3>
                    <p className="text-[11px] text-[#FFFFE9]/60 truncate">
                      {m.role || m.affiliation}
                    </p>
                  </div>

                  {/* Render verified social icons ONLY if uploaded */}
                  {renderSocialBadges(m.socialLinks, m.email, false)}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
