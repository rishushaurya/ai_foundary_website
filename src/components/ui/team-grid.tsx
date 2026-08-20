"use client";

import React from "react";
import { TeamMember } from "@/lib/data";
import { Mail, GraduationCap, Crown, Users } from "lucide-react";
import { LinkedinIcon, GithubIcon, InstagramIcon } from "@/components/ui/icons";

interface TeamGridProps {
  members: TeamMember[];
  categoryTitle?: string;
  categoryType?: "faculty" | "executive" | "team";
}

export function TeamGrid({ members, categoryTitle, categoryType = "team" }: TeamGridProps) {
  if (!members || members.length === 0) {
    return (
      <div className="text-center py-12 px-4 rounded-3xl border border-dashed border-white/20 font-mono text-xs text-slate-400 bg-black/40 backdrop-blur-xl">
        No team members currently assigned to this section.
      </div>
    );
  }

  const getCategoryIcon = () => {
    switch (categoryType) {
      case "faculty":
        return <GraduationCap className="size-4 text-cyan-400" />;
      case "executive":
        return <Crown className="size-4 text-cyan-400" />;
      default:
        return <Users className="size-4 text-cyan-400" />;
    }
  };

  return (
    <div className="space-y-6 w-full">
      {categoryTitle && (
        <div className="flex items-center gap-3 border-b border-white/10 pb-3">
          {getCategoryIcon()}
          <h3 className="text-base sm:text-lg font-bold font-mono uppercase tracking-wider text-white">
            {categoryTitle}
          </h3>
          <span className="text-xs font-mono text-slate-400">
            ({members.length} {members.length === 1 ? "Member" : "Members"})
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
        {members.map((member) => (
          <div
            key={member.id}
            className="group relative rounded-3xl border border-white/15 bg-black/40 backdrop-blur-xl p-6 sm:p-7 shadow-2xl hover:border-cyan-400/50 transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between"
          >
            <div>
              {/* Top Badge & Role */}
              <div className="flex items-start justify-between gap-3 mb-4">
                <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-cyan-950/60 text-cyan-300 border border-cyan-500/40">
                  {member.role}
                </span>

                {member.email && (
                  <a
                    href={`mailto:${member.email}`}
                    className="p-1.5 rounded-lg border border-white/15 text-slate-400 hover:text-cyan-400 hover:border-cyan-400/50 hover:bg-white/5 transition-colors"
                    title={`Email ${member.name}`}
                    aria-label={`Email ${member.name}`}
                  >
                    <Mail className="size-3.5" />
                  </a>
                )}
              </div>

              {/* Member Identity */}
              <div className="space-y-1.5 mb-4">
                <h4 className="text-base font-bold font-mono uppercase tracking-wide text-white group-hover:text-cyan-400 transition-colors">
                  {member.name}
                </h4>
                {member.affiliation && (
                  <p className="text-xs text-slate-300 leading-snug normal-case font-sans">
                    {member.affiliation}
                  </p>
                )}
              </div>
            </div>

            {/* Social Channels */}
            {member.socialLinks && (
              <div className="flex items-center gap-2 pt-3 border-t border-white/10 mt-2">
                {member.socialLinks.linkedin && (
                  <a
                    href={member.socialLinks.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 transition-colors"
                    aria-label={`${member.name} LinkedIn`}
                  >
                    <LinkedinIcon className="size-3.5" />
                  </a>
                )}
                {member.socialLinks.github && (
                  <a
                    href={member.socialLinks.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 transition-colors"
                    aria-label={`${member.name} GitHub`}
                  >
                    <GithubIcon className="size-3.5" />
                  </a>
                )}
                {member.socialLinks.instagram && (
                  <a
                    href={member.socialLinks.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 transition-colors"
                    aria-label={`${member.name} Instagram`}
                  >
                    <InstagramIcon className="size-3.5" />
                  </a>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
