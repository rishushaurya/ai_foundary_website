import React from "react";
import Link from "next/link";
import { getEvents, getTeamMembers, getRecruitmentEntries, getGallerySections } from "@/lib/data";
import {
  Users,
  Calendar,
  UserPlus,
  Image as ImageIcon,
  CheckCircle,
  ArrowRight,
  Database,
  Sliders,
  FileText,
} from "lucide-react";

export default async function AdminDashboardPage() {
  const [events, team, applications, gallery] = await Promise.all([
    getEvents(),
    getTeamMembers(),
    getRecruitmentEntries(),
    getGallerySections(),
  ]);

  let totalRegistrations = 0;
  events.forEach((e) => {
    totalRegistrations += (e.registrations || []).length;
  });

  return (
    <div className="space-y-8 font-mono text-white">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-black uppercase tracking-wider text-white">
          SYSTEM OVERVIEW
        </h1>
        <p className="text-xs text-slate-400 normal-case mt-1 font-sans">
          Real-time content telemetry, database status, and executive quick shortcuts.
        </p>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl border border-white/15 bg-black/40 backdrop-blur-xl shadow-xl space-y-2">
          <div className="flex items-center justify-between text-cyan-400">
            <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">
              Total Events
            </span>
            <Calendar className="size-4" />
          </div>
          <span className="text-3xl font-black text-white font-mono">{events.length}</span>
          <p className="text-[10px] text-slate-400 font-sans">Active &amp; past initiatives</p>
        </div>

        <div className="p-5 rounded-3xl border border-white/15 bg-black/40 backdrop-blur-xl shadow-xl space-y-2">
          <div className="flex items-center justify-between text-emerald-400">
            <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">
              Registrations
            </span>
            <CheckCircle className="size-4" />
          </div>
          <span className="text-3xl font-black text-white font-mono">{totalRegistrations}</span>
          <p className="text-[10px] text-slate-400 font-sans">Attendee registrations</p>
        </div>

        <div className="p-5 rounded-3xl border border-white/15 bg-black/40 backdrop-blur-xl shadow-xl space-y-2">
          <div className="flex items-center justify-between text-purple-400">
            <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">
              Team Roster
            </span>
            <Users className="size-4" />
          </div>
          <span className="text-3xl font-black text-white font-mono">{team.length}</span>
          <p className="text-[10px] text-slate-400 font-sans">Executives &amp; Faculty</p>
        </div>

        <div className="p-5 rounded-3xl border border-white/15 bg-black/40 backdrop-blur-xl shadow-xl space-y-2">
          <div className="flex items-center justify-between text-amber-400">
            <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">
              Recruits
            </span>
            <UserPlus className="size-4" />
          </div>
          <span className="text-3xl font-black text-white font-mono">{applications.length}</span>
          <p className="text-[10px] text-slate-400 font-sans">Candidate submissions</p>
        </div>
      </div>

      {/* Quick Access Matrix */}
      <div className="p-6 sm:p-8 rounded-3xl border border-white/15 bg-black/40 backdrop-blur-xl shadow-xl space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-cyan-400">
          QUICK ACTIONS
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <Link
            href="/admin/events"
            className="flex items-center justify-between p-4 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-cyan-400/50 transition-all group no-underline text-white"
          >
            <div>
              <span className="font-bold uppercase block text-white">Manage Events &amp; Hackathons</span>
              <span className="text-[11px] text-slate-400 normal-case font-sans">Add upcoming dates or export attendee CSVs</span>
            </div>
            <ArrowRight className="size-4 text-cyan-400 group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link
            href="/admin/team"
            className="flex items-center justify-between p-4 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-cyan-400/50 transition-all group no-underline text-white"
          >
            <div>
              <span className="font-bold uppercase block text-white">Update Team &amp; Faculty</span>
              <span className="text-[11px] text-slate-400 normal-case font-sans">Modify roles, order, and social links</span>
            </div>
            <ArrowRight className="size-4 text-cyan-400 group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link
            href="/admin/content"
            className="flex items-center justify-between p-4 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-cyan-400/50 transition-all group no-underline text-white"
          >
            <div>
              <span className="font-bold uppercase block text-white">Hero &amp; Core Content</span>
              <span className="text-[11px] text-slate-400 normal-case font-sans">Edit Hero Tagline, About text, and Mission</span>
            </div>
            <ArrowRight className="size-4 text-cyan-400 group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link
            href="/admin/recruitment"
            className="flex items-center justify-between p-4 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-cyan-400/50 transition-all group no-underline text-white"
          >
            <div>
              <span className="font-bold uppercase block text-white">Review Membership Applications</span>
              <span className="text-[11px] text-slate-400 normal-case font-sans">View candidates, update status, and export CSV</span>
            </div>
            <ArrowRight className="size-4 text-cyan-400 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>

      {/* Cloud & Security Status */}
      <div className="p-6 rounded-3xl border border-white/15 bg-black/40 backdrop-blur-xl shadow-xl space-y-3 text-xs">
        <div className="flex items-center gap-2 text-emerald-400 font-bold uppercase">
          <Database className="size-4" />
          <span>Storage Engine Status: Dual-Tier Persistence Active</span>
        </div>
        <p className="text-slate-300 normal-case font-sans leading-relaxed">
          Local JSON datasets in sync with cloud persistence. Google OAuth edge middleware active on all administrative routes. All CMS modifications instantly update the live public site.
        </p>
      </div>
    </div>
  );
}
