"use client";

import React, { useState, useMemo } from "react";
import { TeamMember, SiteSettings } from "@/lib/data";
import { normalizeImageUrl } from "@/lib/image-helper";
import {
  Sparkles,
  Mail,
  GraduationCap,
  Users,
  ShieldCheck,
  Search,
  ExternalLink,
} from "lucide-react";
import { LinkedinIcon, GithubIcon, InstagramIcon, TwitterIcon } from "@/components/ui/icons";

interface NewTeamViewProps {
  settings: SiteSettings;
  faculty: TeamMember[];
  executives: TeamMember[];
  wings: TeamMember[];
}

export function NewTeamView({
  settings,
  faculty = [],
  executives = [],
  wings = [],
}: NewTeamViewProps) {
  const [selectedWing, setSelectedWing] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Extract unique wing / functional domains from student wings & executives
  const wingCategories = useMemo(() => {
    const roles = Array.from(
      new Set(
        [...executives, ...wings]
          .map((m) => {
            // Group by broad category or role
            const r = m.role || "";
            if (r.toLowerCase().includes("ai") || r.toLowerCase().includes("ml") || r.toLowerCase().includes("research")) return "AI & Research";
            if (r.toLowerCase().includes("robot") || r.toLowerCase().includes("hardware") || r.toLowerCase().includes("iot")) return "Robotics & Edge";
            if (r.toLowerCase().includes("web") || r.toLowerCase().includes("tech") || r.toLowerCase().includes("platform") || r.toLowerCase().includes("cloud")) return "Platform & Cloud";
            if (r.toLowerCase().includes("design") || r.toLowerCase().includes("creative") || r.toLowerCase().includes("media")) return "Design & Media";
            if (r.toLowerCase().includes("operat") || r.toLowerCase().includes("event") || r.toLowerCase().includes("pr") || r.toLowerCase().includes("outreach")) return "Operations & Outreach";
            return m.role;
          })
          .filter(Boolean)
      )
    );
    return ["All", ...roles];
  }, [executives, wings]);

  // Filtered members for the Wings section
  const filteredWings = useMemo(() => {
    let list = wings;

    if (selectedWing !== "All") {
      list = list.filter((m) => {
        const r = (m.role || "").toLowerCase();
        if (selectedWing === "AI & Research") return r.includes("ai") || r.includes("ml") || r.includes("research");
        if (selectedWing === "Robotics & Edge") return r.includes("robot") || r.includes("hardware") || r.includes("iot");
        if (selectedWing === "Platform & Cloud") return r.includes("web") || r.includes("tech") || r.includes("platform") || r.includes("cloud");
        if (selectedWing === "Design & Media") return r.includes("design") || r.includes("creative") || r.includes("media");
        if (selectedWing === "Operations & Outreach") return r.includes("operat") || r.includes("event") || r.includes("pr") || r.includes("outreach");
        return m.role === selectedWing;
      });
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          (m.role || "").toLowerCase().includes(q) ||
          (m.affiliation || "").toLowerCase().includes(q)
      );
    }

    return list;
  }, [wings, selectedWing, searchQuery]);

  return (
    <div className="w-full bg-[#FFFFE9] text-[#2D2E2A] selection:bg-[#ECFF17] selection:text-[#000000]">
      <main className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-16 pt-32 sm:pt-40 pb-24 space-y-20">
        {/* ===== HERO MASTHEAD ===== */}
        <section className="flex flex-col items-start space-y-4 border-b border-[#C6CCBD]/70 pb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ECFF17]/30 border border-[#2D2E2A]/15 text-[#2D2E2A] text-[11px] font-jetbrains font-bold uppercase tracking-wider">
            <Sparkles className="size-3 text-[#2D2E2A]" />
            <span>DAYANANDA SAGAR UNIVERSITY • RAISE AI CLUB</span>
          </div>

          <h1 className="font-libre text-5xl sm:text-7xl lg:text-8xl font-normal tracking-tight text-[#2D2E2A] leading-none select-none">
            Team Members
          </h1>

          <p className="font-inter text-base sm:text-xl text-[#5E6059] max-w-3xl font-normal leading-relaxed">
            Meet the minds behind AI Foundry &amp; RAISE AI CLUB — faculty mentors, executive leadership, and functional student wings shaping the frontier of artificial intelligence.
          </p>

          {/* Quick Metrics */}
          <div className="flex items-center gap-6 pt-4 text-xs font-jetbrains text-[#5E6059]">
            <span>
              <strong className="text-[#2D2E2A] font-bold">{faculty.length}</strong> Faculty Mentors
            </span>
            <span className="text-[#C6CCBD]">•</span>
            <span>
              <strong className="text-[#2D2E2A] font-bold">{executives.length}</strong> Executive Board
            </span>
            <span className="text-[#C6CCBD]">•</span>
            <span>
              <strong className="text-[#2D2E2A] font-bold">{wings.length}</strong> Student Leads
            </span>
          </div>
        </section>

        {/* ===== SECTION 1: FACULTY ADVISORY BOARD & PATRONS ===== */}
        {faculty.length > 0 && (
          <section className="space-y-8">
            <div className="flex items-center justify-between border-b border-[#C6CCBD]/60 pb-4">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-2xl bg-white border border-[#C6CCBD] flex items-center justify-center text-[#2D2E2A]">
                  <GraduationCap className="size-5" />
                </div>
                <div>
                  <h2 className="font-libre text-2xl sm:text-3xl font-bold text-[#2D2E2A]">
                    {settings.facultyHeading || "Faculty Advisory Board & Mentors"}
                  </h2>
                  <p className="font-jetbrains text-xs uppercase tracking-wider text-[#7A836F]">
                    Department of CSE (AI &amp; ML) • Dayananda Sagar University
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {faculty.map((member) => (
                <div
                  key={member.id}
                  className="group rounded-3xl border border-[#C6CCBD] bg-white/80 p-7 flex flex-col justify-between shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="space-y-5">
                    {/* Portrait Photo */}
                    <div className="w-full h-72 sm:h-80 rounded-2xl overflow-hidden bg-[#2D2E2A] border border-[#C6CCBD] relative">
                      <img
                        className={`w-full h-full ${member.imageFit === 'contain' ? 'object-contain' : 'object-cover'} ${member.imagePosition === 'top' ? 'object-top' : member.imagePosition === 'bottom' ? 'object-bottom' : 'object-center'} group-hover:scale-105 transition-all duration-500`}
                        src={normalizeImageUrl(member.image, "/images/rectangle-899.png")}
                        alt={member.name}
                      />
                      <div className="absolute top-3 left-3">
                        <span className="px-3 py-1 rounded-full text-[10px] font-jetbrains font-bold uppercase tracking-wider bg-[#ECFF17] text-black border border-black/10 shadow-xs">
                          {member.role || "FACULTY MENTOR"}
                        </span>
                      </div>
                    </div>

                    {/* Info */}
                    <div className="space-y-2">
                      <h3 className="font-libre text-2xl font-bold text-[#2D2E2A] leading-tight">
                        {member.name}
                      </h3>
                      <p className="font-jetbrains text-xs font-semibold text-[#7A836F] leading-snug">
                        {member.affiliation || "Professor & Chairperson, CSE (AI & ML), DSU"}
                      </p>
                    </div>
                  </div>

                  {/* Social / Email Links */}
                  <div className="border-t border-[#C6CCBD]/40 pt-4 flex items-center justify-between mt-6">
                    <span className="font-jetbrains text-[10px] uppercase text-[#7A836F] tracking-wider">
                      Advisory Desk
                    </span>
                    <div className="flex items-center gap-2">
                      {member.email && member.email.trim() !== "" && (
                        <a
                          href={`mailto:${member.email}`}
                          className="size-9 rounded-full bg-[#FFFFE9] border border-[#C6CCBD] flex items-center justify-center text-[#2D2E2A] hover:bg-[#2D2E2A] hover:text-white transition-colors"
                          title={`Email ${member.name}`}
                        >
                          <Mail className="size-4" />
                        </a>
                      )}
                      {member.socialLinks?.linkedin && member.socialLinks.linkedin.trim() !== "" && (
                        <a
                          href={member.socialLinks.linkedin}
                          target="_blank"
                          rel="noreferrer"
                          className="size-9 rounded-full bg-[#FFFFE9] border border-[#C6CCBD] flex items-center justify-center text-[#2D2E2A] hover:bg-[#2D2E2A] hover:text-white transition-colors"
                          title="LinkedIn Profile"
                        >
                          <LinkedinIcon className="size-4" />
                        </a>
                      )}
                      {member.socialLinks?.github && member.socialLinks.github.trim() !== "" && (
                        <a
                          href={member.socialLinks.github}
                          target="_blank"
                          rel="noreferrer"
                          className="size-9 rounded-full bg-[#FFFFE9] border border-[#C6CCBD] flex items-center justify-center text-[#2D2E2A] hover:bg-[#2D2E2A] hover:text-white transition-colors"
                          title="GitHub Profile"
                        >
                          <GithubIcon className="size-4" />
                        </a>
                      )}
                      {member.socialLinks?.instagram && member.socialLinks.instagram.trim() !== "" && (
                        <a
                          href={member.socialLinks.instagram}
                          target="_blank"
                          rel="noreferrer"
                          className="size-9 rounded-full bg-[#FFFFE9] border border-[#C6CCBD] flex items-center justify-center text-[#2D2E2A] hover:bg-[#2D2E2A] hover:text-white transition-colors"
                          title="Instagram Profile"
                        >
                          <InstagramIcon className="size-4" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ===== SECTION 2: EXECUTIVE LEADERSHIP BOARD ===== */}
        {executives.length > 0 && (
          <section className="space-y-8">
            <div className="flex items-center justify-between border-b border-[#C6CCBD]/60 pb-4">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-2xl bg-white border border-[#C6CCBD] flex items-center justify-center text-[#2D2E2A]">
                  <ShieldCheck className="size-5" />
                </div>
                <div>
                  <h2 className="font-libre text-2xl sm:text-3xl font-bold text-[#2D2E2A]">
                    Executive Leadership Board
                  </h2>
                  <p className="font-jetbrains text-xs uppercase tracking-wider text-[#7A836F]">
                    Student Board of Governors &amp; Venture Leads
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {executives.map((exec) => (
                <div
                  key={exec.id}
                  className="group rounded-3xl border border-[#C6CCBD] bg-white/80 p-6 flex flex-col justify-between shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="space-y-4">
                    {/* Portrait Photo */}
                    <div className="w-full h-64 rounded-2xl overflow-hidden bg-[#2D2E2A] border border-[#C6CCBD] relative">
                      <img
                        className={`w-full h-full ${exec.imageFit === 'contain' ? 'object-contain' : 'object-cover'} ${exec.imagePosition === 'top' ? 'object-top' : exec.imagePosition === 'bottom' ? 'object-bottom' : 'object-center'} group-hover:scale-105 transition-all duration-500`}
                        src={normalizeImageUrl(exec.image, "/images/rectangle-902.png")}
                        alt={exec.name}
                      />
                      <div className="absolute top-3 left-3">
                        <span className="px-3 py-1 rounded-full text-[10px] font-jetbrains font-bold uppercase tracking-wider bg-[#2D2E2A] text-[#FFFFE9] border border-white/20 shadow-xs">
                          {exec.role || "EXECUTIVE LEAD"}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <h3 className="font-libre text-2xl font-bold text-[#2D2E2A]">
                        {exec.name}
                      </h3>
                      <p className="font-jetbrains text-xs text-[#7A836F]">
                        {exec.affiliation || "AI Foundry Leadership Wing"}
                      </p>
                    </div>
                  </div>

                  {/* Social links */}
                  <div className="border-t border-[#C6CCBD]/40 pt-4 flex items-center justify-between mt-6">
                    <span className="font-jetbrains text-[10px] uppercase text-[#7A836F] tracking-wider">
                      Connect
                    </span>
                    <div className="flex items-center gap-2">
                      {exec.socialLinks?.linkedin && exec.socialLinks.linkedin.trim() !== "" && (
                        <a
                          href={exec.socialLinks.linkedin}
                          target="_blank"
                          rel="noreferrer"
                          className="size-8 rounded-full bg-[#FFFFE9] border border-[#C6CCBD] flex items-center justify-center text-[#2D2E2A] hover:bg-[#2D2E2A] hover:text-white transition-colors"
                          title="LinkedIn"
                        >
                          <LinkedinIcon className="size-3.5" />
                        </a>
                      )}
                      {exec.socialLinks?.github && exec.socialLinks.github.trim() !== "" && (
                        <a
                          href={exec.socialLinks.github}
                          target="_blank"
                          rel="noreferrer"
                          className="size-8 rounded-full bg-[#FFFFE9] border border-[#C6CCBD] flex items-center justify-center text-[#2D2E2A] hover:bg-[#2D2E2A] hover:text-white transition-colors"
                          title="GitHub"
                        >
                          <GithubIcon className="size-3.5" />
                        </a>
                      )}
                      {exec.socialLinks?.instagram && exec.socialLinks.instagram.trim() !== "" && (
                        <a
                          href={exec.socialLinks.instagram}
                          target="_blank"
                          rel="noreferrer"
                          className="size-8 rounded-full bg-[#FFFFE9] border border-[#C6CCBD] flex items-center justify-center text-[#2D2E2A] hover:bg-[#2D2E2A] hover:text-white transition-colors"
                          title="Instagram"
                        >
                          <InstagramIcon className="size-3.5" />
                        </a>
                      )}
                      {exec.email && exec.email.trim() !== "" && (
                        <a
                          href={`mailto:${exec.email}`}
                          className="size-8 rounded-full bg-[#FFFFE9] border border-[#C6CCBD] flex items-center justify-center text-[#2D2E2A] hover:bg-[#2D2E2A] hover:text-white transition-colors"
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
        )}

        {/* ===== SECTION 3: FOUNDRY WINGS & STUDENT INNOVATORS ===== */}
        <section className="space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-[#C6CCBD]/60 pb-4">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-2xl bg-white border border-[#C6CCBD] flex items-center justify-center text-[#2D2E2A]">
                <Users className="size-5" />
              </div>
              <div>
                <h2 className="font-libre text-2xl sm:text-3xl font-bold text-[#2D2E2A]">
                  {settings.studentHeading || "Foundry Wings & Student Leads"}
                </h2>
                <p className="font-jetbrains text-xs uppercase tracking-wider text-[#7A836F]">
                  Technical Engineers, Researchers &amp; Domain Specialists
                </p>
              </div>
            </div>

            {/* Wing Search */}
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-3.5 text-[#7A836F]" />
              <input
                type="text"
                placeholder="Search team member..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-full bg-white/90 border border-[#C6CCBD] text-xs font-inter text-[#2D2E2A] placeholder-[#8A8F82] focus:outline-none focus:border-[#2D2E2A] transition-colors"
              />
            </div>
          </div>

          {/* Wing Category Filters */}
          {wingCategories.length > 2 && (
            <div className="flex flex-wrap items-center gap-2">
              {wingCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedWing(cat)}
                  className={`px-4 py-2 rounded-full text-xs font-jetbrains uppercase tracking-wider font-semibold transition-all cursor-pointer ${
                    selectedWing === cat
                      ? "bg-[#2D2E2A] text-[#FFFFE9] shadow-sm"
                      : "bg-white/80 text-[#5E6059] hover:text-[#2D2E2A] hover:bg-white border border-[#C6CCBD]/60"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}

          {/* Members Grid */}
          {filteredWings.length === 0 ? (
            <div className="rounded-3xl border border-[#C6CCBD] bg-white/60 p-12 text-center space-y-2">
              <p className="font-libre text-xl font-bold text-[#2D2E2A]">
                No members found in this wing category
              </p>
              <p className="font-inter text-xs text-[#5E6059]">
                Add or reassign student members from the Admin CMS under the Team section.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredWings.map((m) => (
                <div
                  key={m.id}
                  className="group rounded-3xl border border-[#C6CCBD] bg-white/80 p-5 flex flex-col justify-between shadow-xs hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="space-y-3">
                    {/* Avatar */}
                    <div className="w-full h-52 rounded-2xl overflow-hidden bg-[#2D2E2A] border border-[#C6CCBD] relative">
                      <img
                        className={`w-full h-full ${m.imageFit === 'contain' ? 'object-contain' : 'object-cover'} ${m.imagePosition === 'top' ? 'object-top' : m.imagePosition === 'bottom' ? 'object-bottom' : 'object-center'} group-hover:scale-105 transition-all duration-500`}
                        src={normalizeImageUrl(m.image, "/images/rectangle-8.png")}
                        alt={m.name}
                      />
                      <div className="absolute top-3 left-3">
                        <span className="px-2.5 py-0.5 rounded-full text-[9px] font-jetbrains font-bold uppercase tracking-wider bg-white/90 backdrop-blur-md text-[#2D2E2A] border border-[#C6CCBD]">
                          {m.role || "MEMBER"}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <h4 className="font-libre text-lg font-bold text-[#2D2E2A] group-hover:text-black transition-colors">
                        {m.name}
                      </h4>
                      <p className="font-jetbrains text-[11px] text-[#7A836F] line-clamp-1">
                        {m.affiliation || "Department of CSE (AI & ML), DSU"}
                      </p>
                    </div>
                  </div>

                  {/* Social Links */}
                  <div className="border-t border-[#C6CCBD]/40 pt-3 flex items-center justify-between mt-4">
                    <span className="font-jetbrains text-[9px] uppercase text-[#7A836F]">
                      Wing Specialist
                    </span>
                    <div className="flex items-center gap-1.5">
                      {m.socialLinks?.linkedin && m.socialLinks.linkedin.trim() !== "" && (
                        <a
                          href={m.socialLinks.linkedin}
                          target="_blank"
                          rel="noreferrer"
                          className="size-7 rounded-full bg-[#FFFFE9] border border-[#C6CCBD] flex items-center justify-center text-[#2D2E2A] hover:bg-[#2D2E2A] hover:text-white transition-colors"
                          title="LinkedIn"
                        >
                          <LinkedinIcon className="size-3" />
                        </a>
                      )}
                      {m.socialLinks?.github && m.socialLinks.github.trim() !== "" && (
                        <a
                          href={m.socialLinks.github}
                          target="_blank"
                          rel="noreferrer"
                          className="size-7 rounded-full bg-[#FFFFE9] border border-[#C6CCBD] flex items-center justify-center text-[#2D2E2A] hover:bg-[#2D2E2A] hover:text-white transition-colors"
                          title="GitHub"
                        >
                          <GithubIcon className="size-3" />
                        </a>
                      )}
                      {m.socialLinks?.instagram && m.socialLinks.instagram.trim() !== "" && (
                        <a
                          href={m.socialLinks.instagram}
                          target="_blank"
                          rel="noreferrer"
                          className="size-7 rounded-full bg-[#FFFFE9] border border-[#C6CCBD] flex items-center justify-center text-[#2D2E2A] hover:bg-[#2D2E2A] hover:text-white transition-colors"
                          title="Instagram"
                        >
                          <InstagramIcon className="size-3" />
                        </a>
                      )}
                      {m.email && m.email.trim() !== "" && (
                        <a
                          href={`mailto:${m.email}`}
                          className="size-7 rounded-full bg-[#FFFFE9] border border-[#C6CCBD] flex items-center justify-center text-[#2D2E2A] hover:bg-[#2D2E2A] hover:text-white transition-colors"
                          title="Email"
                        >
                          <Mail className="size-3" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
