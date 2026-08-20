"use client";

import React, { useState, useEffect } from "react";
import { RecruitmentEntry } from "@/lib/data";
import { Download, Trash2, CheckCircle, AlertCircle, ExternalLink, Filter } from "lucide-react";

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
    <div className="space-y-6 font-mono text-white">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h1 className="text-xl font-black uppercase tracking-wider text-white">
            RECRUITMENT CANDIDATES
          </h1>
          <p className="text-xs text-slate-400 normal-case font-sans">
            Review prospective member applications across Tech, Media, Product, and Event wings.
          </p>
        </div>

        <a
          href="/api/admin/export?type=recruitment"
          className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/20 text-xs font-bold text-slate-300 bg-white/5 hover:bg-white/15 hover:border-cyan-400/50 shadow-sm transition-all cursor-pointer no-underline"
        >
          <Download className="size-3.5 text-cyan-400" />
          <span>Export All Candidates CSV</span>
        </a>
      </div>

      {/* Filter Tabs Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl border border-white/15 bg-black/40 backdrop-blur-xl text-xs">
        <div className="flex items-center gap-2">
          <Filter className="size-3.5 text-cyan-400" />
          <span className="font-bold text-slate-300 uppercase">Filter by Wing:</span>
          <select
            value={selectedWingFilter}
            onChange={(e) => setSelectedWingFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-white/20 bg-slate-900 text-white focus:outline-none focus:border-cyan-400 text-xs"
          >
            <option value="all">All Wings</option>
            <option value="AI & Tech Wing">AI &amp; Tech Wing</option>
            <option value="Product & Startup Wing">Product &amp; Startup Wing</option>
            <option value="Events & Operations Wing">Events &amp; Operations Wing</option>
            <option value="Design & Media Wing">Design &amp; Media Wing</option>
            <option value="Outreach & Partnerships Wing">Outreach &amp; Partnerships Wing</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-300 uppercase">Status:</span>
          <select
            value={selectedStatusFilter}
            onChange={(e) => setSelectedStatusFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-white/20 bg-slate-900 text-white focus:outline-none focus:border-cyan-400 text-xs"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="reviewed">Reviewed</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Notices */}
      {notice && (
        <div
          className={`p-3 rounded-2xl border text-xs flex items-center gap-2 font-bold uppercase ${
            notice.type === "success"
              ? "bg-emerald-950/60 border-emerald-500/40 text-emerald-300"
              : "bg-red-950/60 border-red-500/40 text-red-300"
          }`}
        >
          {notice.type === "success" ? <CheckCircle className="size-4" /> : <AlertCircle className="size-4" />}
          <span>{notice.text}</span>
        </div>
      )}

      {/* Candidate List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 rounded-2xl border border-white/10 bg-black/40 animate-pulse" />
          ))}
        </div>
      ) : filteredEntries.length === 0 ? (
        <div className="text-center py-16 text-slate-400 text-xs border border-dashed border-white/20 rounded-3xl bg-black/30">
          No candidate applications found matching the selected filters.
        </div>
      ) : (
        <div className="space-y-4">
          {filteredEntries.map((cand) => (
            <div
              key={cand.id}
              className="p-6 rounded-3xl border border-white/15 bg-black/40 backdrop-blur-xl shadow-lg hover:border-cyan-400/40 space-y-3 transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
                <div>
                  <h3 className="font-bold text-sm text-white uppercase">{cand.name}</h3>
                  <p className="text-xs text-slate-400 font-sans">
                    {cand.email} • {cand.phone} • {cand.year} ({cand.branch})
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-bold text-cyan-300 bg-cyan-950/60 border border-cyan-500/40 px-3 py-1 rounded-full">
                    {cand.preferredTeam}
                  </span>
                  <select
                    value={cand.status}
                    onChange={(e) => handleUpdateStatus(cand.id, e.target.value as any)}
                    className="px-3 py-1 rounded-xl border border-white/20 text-[11px] bg-slate-900 text-white font-mono font-bold focus:outline-none focus:border-cyan-400"
                  >
                    <option value="pending">Pending</option>
                    <option value="reviewed">Reviewed</option>
                    <option value="accepted">Accepted</option>
                    <option value="rejected">Rejected</option>
                  </select>
                  <button
                    onClick={() => handleDelete(cand.id)}
                    className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-950/40 rounded-lg transition-colors cursor-pointer"
                    title="Delete application"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>

              {cand.skills && (
                <p className="text-xs text-slate-200 font-sans">
                  <strong className="text-slate-400 uppercase text-[10px] font-mono mr-1">Skills:</strong> {cand.skills}
                </p>
              )}

              {cand.whyJoin && (
                <p className="text-xs text-slate-300 leading-relaxed normal-case font-sans">
                  <strong className="text-slate-400 uppercase text-[10px] font-mono mr-1">Statement:</strong> {cand.whyJoin}
                </p>
              )}

              {cand.portfolioUrl && (
                <div className="pt-2">
                  <a
                    href={cand.portfolioUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-[11px] font-bold text-cyan-400 hover:text-cyan-300 hover:underline"
                  >
                    <span>View Portfolio / GitHub</span>
                    <ExternalLink className="size-3" />
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
