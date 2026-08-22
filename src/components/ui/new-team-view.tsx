"use client";

import React, { useState } from "react";
import { TeamMember, SiteSettings } from "@/lib/data";
import { normalizeImageUrl } from "@/lib/image-helper";
import { Sparkles, Mail, ExternalLink, GraduationCap, Users } from "lucide-react";
import { LinkedinIcon, GithubIcon, InstagramIcon } from "@/components/ui/icons";

interface NewTeamViewProps {
  settings: SiteSettings;
  faculty: TeamMember[];
  executives: TeamMember[];
  wings: TeamMember[];
}

export function NewTeamView({
  settings,
  faculty,
  executives,
  wings,
}: NewTeamViewProps) {
  const [selectedWing, setSelectedWing] = useState<string>("All");

  const allWingsMembers = [...executives, ...wings];
  const wingCategories = [
    "All",
    ...Array.from(new Set(allWingsMembers.map((m) => m.role).filter(Boolean))),
  ];

  const filteredMembers =
    selectedWing === "All"
      ? allWingsMembers
      : allWingsMembers.filter((m) => m.role === selectedWing);

  return (
    <div className="w-full">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-36 sm:pt-44 pb-20 space-y-16">
        {/* ===== HERO SECTION ===== */}
        <section className="flex flex-col items-center text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-100/90 text-cyan-900 text-xs font-black uppercase tracking-wider border border-cyan-200 shadow-xs">
            <Sparkles className="size-3.5 text-cyan-700" />
            <span>{settings.facultyHeading || "The Architects"}</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-slate-900 font-['Hanken_Grotesk']">
            The Architects
          </h1>

          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto font-medium leading-relaxed">
            The collective intelligence shaping the frontier of responsible artificial intelligence, deep tech engineering, and student entrepreneurship at DSU.
          </p>
        </section>

        {/* ===== FACULTY ADVISORS / MENTORS (SPACIOUS 2-COLUMN CARDS WITH P-8) ===== */}
        <section className="space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
            <GraduationCap className="size-5 text-cyan-600" />
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Faculty Mentors &amp; Patrons
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {faculty.map((member) => (
              <div
                key={member.id}
                className="glass-card rounded-3xl p-7 sm:p-8 flex flex-col sm:flex-row gap-6 items-center group hover:-translate-y-1 transition-all duration-300 border border-white/90 bg-white/80 shadow-md hover:shadow-xl"
              >
                {/* Portrait */}
                <div className="w-full sm:w-1/2 h-64 sm:h-56 rounded-2xl overflow-hidden relative shrink-0 bg-slate-900">
                  <img
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                    src={normalizeImageUrl(
                      member.image,
                      "https://lh3.googleusercontent.com/aida-public/AB6AXuDFXW_l6i6t6nEvQ7iVvj-t3f6PqyV0yqFqC7-m5K9b8rC_w-tZ5nO3"
                    )}
                    alt={member.name}
                  />
                </div>

                {/* Info */}
                <div className="w-full sm:w-1/2 flex flex-col justify-center">
                  <div className="inline-block bg-cyan-100 text-cyan-900 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full mb-2 self-start border border-cyan-200 font-mono">
                    {member.role || "FACULTY ADVISOR"}
                  </div>
                  <h3 className="text-xl font-black text-slate-900 mb-1">
                    {member.name}
                  </h3>
                  <p className="text-xs font-bold text-slate-500 mb-3">
                    {member.affiliation || "Department of CSE (AI & ML), DSU"}
                  </p>
                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-3 mb-4 font-medium">
                    Championing responsible AI research, student venture building, and deep tech incubation across multidisciplinary student initiatives.
                  </p>

                  {/* Social / Email Links */}
                  <div className="flex items-center gap-2">
                    {member.email && (
                      <a
                        href={`mailto:${member.email}`}
                        className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-cyan-100 hover:text-cyan-700 transition-colors"
                        title="Email Advisor"
                      >
                        <Mail className="size-4" />
                      </a>
                    )}
                    {member.socialLinks?.linkedin && (
                      <a
                        href={member.socialLinks.linkedin}
                        target="_blank"
                        rel="noreferrer"
                        className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-cyan-100 hover:text-cyan-700 transition-colors"
                        title="LinkedIn Profile"
                      >
                        <LinkedinIcon className="size-4" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ===== FOUNDRY WINGS & LEADERSHIP (CIRCULAR AVATARS WITH HOVER POPOVERS) ===== */}
        <section className="space-y-8 relative">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
            <div className="flex items-center gap-2">
              <Users className="size-5 text-cyan-600" />
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {settings.studentHeading || "Foundry Wings & Leadership"}
              </h2>
            </div>

            {/* Wing filter chips */}
            {wingCategories.length > 2 && (
              <div className="flex flex-wrap gap-1.5">
                {wingCategories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedWing(cat)}
                    className={`px-4 py-1.5 rounded-full text-xs font-black transition-all cursor-pointer ${
                      selectedWing === cat
                        ? "bg-slate-900 text-white shadow-md"
                        : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-wrap justify-center gap-8 sm:gap-12 pt-4">
            {filteredMembers.map((m) => (
              <div
                key={m.id}
                className="relative avatar-container group flex flex-col items-center cursor-pointer"
              >
                {/* Circular Avatar */}
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-2 border-transparent group-hover:border-cyan-500 transition-all duration-300 shadow-md group-hover:scale-105 bg-slate-100">
                  <img
                    className="w-full h-full object-cover"
                    src={normalizeImageUrl(
                      m.image,
                      "https://lh3.googleusercontent.com/aida-public/AB6AXuAlHYmRv5UvJfByZ3NBzHJStQbFL_4zr6bODS_nr-byLotWW4OI2WHdE2tFJWjTUH8vWjC5NQ0-ZYlcXiDeTvpicrhELnBWw36Ot-VMIBkTgzQk_qwVKvXd4kE4qL47PSdZlwlvzljM1b3CMYg3ZWD7iVpXHJjXgnswsSgXUM_n3v-MuEknupsNwErFJmHm2JknF4FR9FElyeY6Pg4X0VFD0NqsI27Z83-1WRayFgqoptOEP0zK62EL"
                    )}
                    alt={m.name}
                  />
                </div>

                {/* Name & Role Label */}
                <div className="mt-3 text-center">
                  <p className="text-sm font-black text-slate-900 group-hover:text-cyan-700 transition-colors">
                    {m.name}
                  </p>
                  <p className="text-xs font-bold text-slate-500">
                    {m.role || "Member"}
                  </p>
                </div>

                {/* Detail Popover on Hover */}
                <div className="avatar-popover absolute top-full left-1/2 -translate-x-1/2 mt-2 w-64 glass-card rounded-2xl p-4 shadow-2xl border border-white/90 z-30 flex flex-col items-center text-center bg-white/95">
                  <span className="text-[10px] font-black uppercase tracking-widest text-cyan-700 mb-1 font-mono">
                    {m.category === "executive" ? "Executive Board" : "Foundry Wing"}
                  </span>
                  <p className="text-xs text-slate-600 mb-3 leading-relaxed font-medium">
                    {m.affiliation || "Active contributor advancing student engineering and venture building."}
                  </p>

                  <div className="flex items-center gap-2">
                    {m.socialLinks?.linkedin && (
                      <a
                        href={m.socialLinks.linkedin}
                        target="_blank"
                        rel="noreferrer"
                        className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-cyan-100 hover:text-cyan-700 transition-colors"
                        title="LinkedIn"
                      >
                        <LinkedinIcon className="size-3.5" />
                      </a>
                    )}
                    {m.socialLinks?.github && (
                      <a
                        href={m.socialLinks.github}
                        target="_blank"
                        rel="noreferrer"
                        className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-cyan-100 hover:text-cyan-700 transition-colors"
                        title="GitHub"
                      >
                        <GithubIcon className="size-3.5" />
                      </a>
                    )}
                    {m.socialLinks?.instagram && (
                      <a
                        href={m.socialLinks.instagram}
                        target="_blank"
                        rel="noreferrer"
                        className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-cyan-100 hover:text-cyan-700 transition-colors"
                        title="Instagram"
                      >
                        <InstagramIcon className="size-3.5" />
                      </a>
                    )}
                    {m.email && (
                      <a
                        href={`mailto:${m.email}`}
                        className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-cyan-100 hover:text-cyan-700 transition-colors"
                        title="Email"
                      >
                        <Mail className="size-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
