"use client";

import React, { useState, useEffect } from "react";
import { RecruitmentEntry } from "@/lib/data";
import { Download, Trash2, CheckCircle2, AlertCircle, ExternalLink, Filter, UserPlus, Loader2 } from "lucide-react";

export default function AdminRecruitmentPage() {
  const [entries, setEntries] = useState<RecruitmentEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [selectedWingFilter, setSelectedWingFilter] = useState<string>("all");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>("all");

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/recruitment");
      const data = await res.json();
      setEntries(data);
    } catch {
      setNotice({ type: "error", text: "Failed to load candidate applications" });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: "pending" | "reviewed" | "accepted" | "rejected") => {
    try {
      const res = await fetch("/api/admin/recruitment", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (!res.ok) throw new Error("Status update failed");

      setEntries((prev) =>
        prev.map((e) => (e.id === id ? { ...e, status } : e))
      );
      setNotice({ type: "success", text: "Candidate status updated" });
    } catch (err: any) {
      setNotice({ type: "error", text: err.message || "Failed to update" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to remove this applicant record?")) return;
    try {
      const res = await fetch(`/api/admin/recruitment?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      setEntries((prev) => prev.filter((e) => e.id !== id));
      setNotice({ type: "success", text: "Application removed" });
    } catch (err: any) {
      setNotice({ type: "error", text: err.message || "Failed to delete" });
    }
  };

  const filteredEntries = entries.filter((e) => {
    if (selectedWingFilter !== "all" && e.preferredTeam !== selectedWingFilter) return false;
    if (selectedStatusFilter !== "all" && e.status !== selectedStatusFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-100 text-cyan-800 text-[11px] font-extrabold uppercase tracking-wider mb-2 border border-cyan-200">
            <UserPlus className="size-3 text-cyan-600" />
            <span>Recruitment Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Member Candidates &amp; Applications
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Review prospective member submissions across AI Engineering, Design, Media, and Operations.
          </p>
        </div>

        <a
          href="/api/admin/export?type=recruitment"
          className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-xs transition-colors no-underline"
        >
          <Download className="size-3.5 text-cyan-600" />
          <span>Export All Candidates CSV</span>
        </a>
      </div>

      {notice && (
        <div
          className={`p-4 rounded-2xl text-xs font-bold flex items-center gap-2 ${
            notice.type === "success"
              ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
              : "bg-red-50 border border-red-200 text-red-800"
          }`}
        >
          {notice.type === "success" ? (
            <CheckCircle2 className="size-4 text-emerald-600" />
          ) : (
            <AlertCircle className="size-4 text-red-600" />
          )}
          <span>{notice.text}</span>
        </div>
      )}

      {/* Filter Tabs Bar */}
      <div className="glass-card rounded-2xl p-4 border border-white/80 flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-2">
          <Filter className="size-3.5 text-cyan-600" />
          <span className="font-bold text-slate-700">Filter Wing:</span>
          <select
            value={selectedWingFilter}
            onChange={(e) => setSelectedWingFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-900 font-semibold focus:outline-none focus:border-cyan-500"
          >
            <option value="all">All Wings</option>
            <option value="AI & Tech Engineering Wing">AI &amp; Tech Engineering Wing</option>
            <option value="Product & Startup Wing">Product &amp; Startup Wing</option>
            <option value="Events & Operations Wing">Events &amp; Operations Wing</option>
            <option value="Design & Media Wing">Design &amp; Media Wing</option>
            <option value="Outreach & Partnerships Wing">Outreach &amp; Partnerships Wing</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-700">Status:</span>
          <select
            value={selectedStatusFilter}
            onChange={(e) => setSelectedStatusFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-900 font-semibold focus:outline-none focus:border-cyan-500"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="reviewed">Reviewed</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Applications Cards List */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-400">
          <Loader2 className="size-8 animate-spin text-cyan-600" />
          <span className="text-xs font-bold">Loading candidate applications...</span>
        </div>
      ) : filteredEntries.length === 0 ? (
        <div className="py-16 text-center rounded-3xl bg-white/50 border border-slate-200/60 text-slate-500 text-sm">
          No recruitment applications found matching the current filters.
        </div>
      ) : (
        <div className="space-y-4">
          {filteredEntries.map((app) => (
            <div
              key={app.id}
              className="glass-card rounded-3xl p-6 border border-white/80 shadow-sm space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2.5 mb-1">
                    <h3 className="text-base font-bold text-slate-900">{app.name}</h3>
                    <span className="px-2.5 py-0.5 rounded-full bg-cyan-100 text-cyan-800 text-[10px] font-extrabold uppercase">
                      {app.preferredTeam}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium">
                    {app.email} • {app.phone} • {app.branch} ({app.year})
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={app.status || "pending"}
                    onChange={(e) =>
                      handleUpdateStatus(
                        app.id,
                        e.target.value as "pending" | "reviewed" | "accepted" | "rejected"
                      )
                    }
                    className={`px-3 py-1.5 rounded-full text-xs font-bold border ${
                      app.status === "accepted"
                        ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                        : app.status === "reviewed"
                        ? "bg-blue-50 text-blue-800 border-blue-200"
                        : app.status === "rejected"
                        ? "bg-red-50 text-red-800 border-red-200"
                        : "bg-amber-50 text-amber-800 border-amber-200"
                    }`}
                  >
                    <option value="pending">Pending</option>
                    <option value="reviewed">Reviewed</option>
                    <option value="accepted">Accepted</option>
                    <option value="rejected">Rejected</option>
                  </select>

                  <button
                    onClick={() => handleDelete(app.id)}
                    className="p-2 rounded-xl text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                    title="Delete Application"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>

              {/* Skills & Portfolio */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2 border-t border-slate-100">
                <div>
                  <span className="font-bold text-slate-400 uppercase tracking-wider block text-[10px]">
                    Skills
                  </span>
                  <span className="text-slate-800 font-medium">{app.skills || "Not specified"}</span>
                </div>
                <div>
                  <span className="font-bold text-slate-400 uppercase tracking-wider block text-[10px]">
                    Portfolio / GitHub
                  </span>
                  {app.portfolioUrl ? (
                    <a
                      href={app.portfolioUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-cyan-600 font-semibold hover:underline inline-flex items-center gap-1"
                    >
                      <span>{app.portfolioUrl}</span>
                      <ExternalLink className="size-3" />
                    </a>
                  ) : (
                    <span className="text-slate-400">None provided</span>
                  )}
                </div>
              </div>

              {/* Why Join */}
              {app.whyJoin && (
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-700 leading-relaxed">
                  <span className="font-bold text-slate-900 block mb-1">Statement of Purpose:</span>
                  {app.whyJoin}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
