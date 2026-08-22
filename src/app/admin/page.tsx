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
  Sparkles,
  Layers,
  Shield,
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
    <div className="space-y-8">
      {/* Title */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white/80">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          System Overview &amp; Telemetry
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
          Real-time content telemetry, registration analytics, and quick administrative shortcuts.
        </p>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="glass-card rounded-3xl p-6 border border-white/80 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-cyan-600">
            <span className="text-[11px] uppercase font-extrabold tracking-wider text-slate-400">
              Total Events
            </span>
            <Calendar className="size-4" />
          </div>
          <span className="text-3xl font-black text-slate-900">{events.length}</span>
          <p className="text-xs text-slate-500 font-medium">Active &amp; past initiatives</p>
        </div>

        <div className="glass-card rounded-3xl p-6 border border-white/80 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-emerald-600">
            <span className="text-[11px] uppercase font-extrabold tracking-wider text-slate-400">
              Registrations
            </span>
            <CheckCircle className="size-4" />
          </div>
          <span className="text-3xl font-black text-slate-900">{totalRegistrations}</span>
          <p className="text-xs text-slate-500 font-medium">Attendee registrations</p>
        </div>

        <div className="glass-card rounded-3xl p-6 border border-white/80 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-purple-600">
            <span className="text-[11px] uppercase font-extrabold tracking-wider text-slate-400">
              Team Roster
            </span>
            <Users className="size-4" />
          </div>
          <span className="text-3xl font-black text-slate-900">{team.length}</span>
          <p className="text-xs text-slate-500 font-medium">Executives &amp; Faculty</p>
        </div>

        <div className="glass-card rounded-3xl p-6 border border-white/80 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-amber-600">
            <span className="text-[11px] uppercase font-extrabold tracking-wider text-slate-400">
              Recruit Apps
            </span>
            <UserPlus className="size-4" />
          </div>
          <span className="text-3xl font-black text-slate-900">{applications.length}</span>
          <p className="text-xs text-slate-500 font-medium">Member applications</p>
        </div>
      </div>

      {/* Quick Access Matrix */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white/80 shadow-sm space-y-6">
        <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-900 flex items-center gap-2">
          <Layers className="size-4 text-cyan-600" />
          <span>Management Modules</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <Link
            href="/admin/landing"
            className="flex items-center justify-between p-5 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-cyan-500/50 shadow-xs transition-all group no-underline text-slate-900"
          >
            <div>
              <span className="font-bold text-sm block text-slate-900 mb-0.5">Landing Page &amp; Hero</span>
              <span className="text-slate-500 text-xs">Edit 3D hero tagline, subtitle &amp; vision copy</span>
            </div>
            <ArrowRight className="size-4 text-slate-400 group-hover:text-cyan-600 group-hover:translate-x-1 transition-all" />
          </Link>

          <Link
            href="/admin/events"
            className="flex items-center justify-between p-5 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-cyan-500/50 shadow-xs transition-all group no-underline text-slate-900"
          >
            <div>
              <span className="font-bold text-sm block text-slate-900 mb-0.5">Manage Events &amp; Sprints</span>
              <span className="text-slate-500 text-xs">Publish hackathons, workshops &amp; registrations</span>
            </div>
            <ArrowRight className="size-4 text-slate-400 group-hover:text-cyan-600 group-hover:translate-x-1 transition-all" />
          </Link>

          <Link
            href="/admin/team"
            className="flex items-center justify-between p-5 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-cyan-500/50 shadow-xs transition-all group no-underline text-slate-900"
          >
            <div>
              <span className="font-bold text-sm block text-slate-900 mb-0.5">Leadership &amp; Faculty Roster</span>
              <span className="text-slate-500 text-xs">Update member profiles, mentors &amp; links</span>
            </div>
            <ArrowRight className="size-4 text-slate-400 group-hover:text-cyan-600 group-hover:translate-x-1 transition-all" />
          </Link>

          <Link
            href="/admin/gallery"
            className="flex items-center justify-between p-5 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-cyan-500/50 shadow-xs transition-all group no-underline text-slate-900"
          >
            <div>
              <span className="font-bold text-sm block text-slate-900 mb-0.5">Visual Archives &amp; Direct Links</span>
              <span className="text-slate-500 text-xs">Add online image links, albums &amp; media</span>
            </div>
            <ArrowRight className="size-4 text-slate-400 group-hover:text-cyan-600 group-hover:translate-x-1 transition-all" />
          </Link>

          <Link
            href="/admin/recruitment"
            className="flex items-center justify-between p-5 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-cyan-500/50 shadow-xs transition-all group no-underline text-slate-900"
          >
            <div>
              <span className="font-bold text-sm block text-slate-900 mb-0.5">Recruitment Applications</span>
              <span className="text-slate-500 text-xs">Review applicants, change status &amp; export CSV</span>
            </div>
            <ArrowRight className="size-4 text-slate-400 group-hover:text-cyan-600 group-hover:translate-x-1 transition-all" />
          </Link>

          <Link
            href="/admin/audit-logs"
            className="flex items-center justify-between p-5 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-cyan-500/50 shadow-xs transition-all group no-underline text-slate-900"
          >
            <div>
              <span className="font-bold text-sm block text-slate-900 mb-0.5">Security Audit Logs</span>
              <span className="text-slate-500 text-xs">View immutable log trail of admin actions</span>
            </div>
            <ArrowRight className="size-4 text-slate-400 group-hover:text-cyan-600 group-hover:translate-x-1 transition-all" />
          </Link>

          <Link
            href="/admin/settings"
            className="flex items-center justify-between p-5 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-cyan-500/50 shadow-xs transition-all group no-underline text-slate-900 sm:col-span-2"
          >
            <div>
              <span className="font-bold text-sm block text-slate-900 mb-0.5">Global Platform Settings</span>
              <span className="text-slate-500 text-xs">Manage admin whitelist, recruitment open/closed toggles &amp; page visibility</span>
            </div>
            <ArrowRight className="size-4 text-slate-400 group-hover:text-cyan-600 group-hover:translate-x-1 transition-all" />
          </Link>
        </div>
      </div>

      {/* Persistence Health */}
      <div className="glass-card rounded-3xl p-6 border border-white/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-cyan-100 text-cyan-700">
            <Database className="size-5" />
          </div>
          <div>
            <span className="font-bold block text-slate-900">Dual-Tier Persistence Engine Active</span>
            <span className="text-slate-500">Primary: Upstash Redis KV • Fallback: Local JSON Storage</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="size-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="font-bold text-emerald-700 uppercase tracking-wider">Storage Healthy</span>
        </div>
      </div>
    </div>
  );
}
