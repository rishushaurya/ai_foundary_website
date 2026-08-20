import React from "react";
import { getExecutives, getTeamWings, getFaculty } from "@/lib/data";
import { Sparkles, Crown, GraduationCap, Users } from "lucide-react";
import { TeamGrid } from "@/components/ui/team-grid";

export const metadata = {
  title: "Leadership & Teams | AI Foundry - Dayananda Sagar University",
  description: "Executive leadership, functional wings, and faculty advisory board of AI Foundry at DSU.",
};

export default async function TeamPage() {
  const [executives, wings, faculty] = await Promise.all([
    getExecutives(),
    getTeamWings(),
    getFaculty(),
  ]);

  return (
    <main className="subpage-container subpage-bg font-mono text-white">
      <div className="subpage-inner">
        {/* ===== HEADER ===== */}
        <section className="text-center space-y-4 max-w-3xl mx-auto w-full">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-cyan-500/40 bg-cyan-950/60 text-cyan-300 text-xs font-bold uppercase tracking-widest shadow-sm backdrop-blur-md">
            <Sparkles className="size-3.5 text-cyan-400" />
            <span>Organizational Hierarchy</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white">
            LEADERSHIP &amp; TEAMS
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 normal-case leading-relaxed font-sans">
            Meet the visionary educators, student executives, and functional departments driving innovation and venture building at AI Foundry.
          </p>
        </section>

        {/* ===== 1. EXECUTIVE LEADERSHIP ===== */}
        <section className="space-y-6 w-full">
          <div className="flex items-center gap-2 border-b border-white/10 pb-3 text-white">
            <Crown className="size-5 text-cyan-400" />
            <h2 className="text-base sm:text-lg font-bold uppercase tracking-wider">
              EXECUTIVE BOARD
            </h2>
          </div>

          <TeamGrid
            members={executives}
            categoryTitle="Executive Board"
            categoryType="executive"
          />
        </section>

        {/* ===== 2. FACULTY ADVISORY BOARD ===== */}
        <section className="space-y-6 w-full">
          <div className="flex items-center gap-2 border-b border-white/10 pb-3 text-white">
            <GraduationCap className="size-5 text-cyan-400" />
            <h2 className="text-base sm:text-lg font-bold uppercase tracking-wider">
              FACULTY ADVISORS &amp; PATRONS
            </h2>
          </div>

          <TeamGrid
            members={faculty}
            categoryTitle="Faculty Advisory Board"
            categoryType="faculty"
          />
        </section>

        {/* ===== 3. FUNCTIONAL DEPARTMENT WINGS ===== */}
        {wings.length > 0 && (
          <section className="space-y-6 w-full">
            <div className="flex items-center gap-2 border-b border-white/10 pb-3 text-white">
              <Users className="size-5 text-cyan-400" />
              <h2 className="text-base sm:text-lg font-bold uppercase tracking-wider">
                DEPARTMENT WINGS
              </h2>
            </div>

            <TeamGrid
              members={wings}
              categoryTitle="Functional Department Wings"
              categoryType="team"
            />
          </section>
        )}
      </div>
    </main>
  );
}
