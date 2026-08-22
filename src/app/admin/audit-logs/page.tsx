"use client";

import React, { useState, useEffect } from "react";
import { AuditLogEntry } from "@/lib/audit-logger";
import { Shield, Search, RefreshCw, Loader2, CheckCircle2, AlertCircle, Clock, Globe, User } from "lucide-react";

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/audit-logs");
      if (res.ok) {
        const data = await res.json();
        setLogs(data);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter((log) => {
    const q = searchQuery.toLowerCase();
    return (
      log.action.toLowerCase().includes(q) ||
      log.adminEmail.toLowerCase().includes(q) ||
      log.ip.toLowerCase().includes(q) ||
      (log.details && log.details.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-100 text-cyan-800 text-[11px] font-extrabold uppercase tracking-wider mb-2 border border-cyan-200">
            <Shield className="size-3 text-cyan-600" />
            <span>Security &amp; Compliance</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Administrative Audit Trail
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Real-time immutable security logs of every administrative login, setting mutation, and content update.
          </p>
        </div>

        <button
          onClick={fetchLogs}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-full border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-xs transition-colors cursor-pointer"
        >
          <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh Logs</span>
        </button>
      </div>

      {/* Search Filter Box */}
      <div className="glass-card rounded-2xl p-4 border border-white/80 flex items-center gap-3">
        <Search className="size-4 text-slate-400 shrink-0" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by admin email, action name, IP address, or details..."
          className="w-full bg-transparent text-xs sm:text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none"
        />
      </div>

      {/* Logs Table */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-400">
          <Loader2 className="size-8 animate-spin text-cyan-600" />
          <span className="text-xs font-bold">Loading audit logs...</span>
        </div>
      ) : filteredLogs.length === 0 ? (
        <div className="py-16 text-center rounded-3xl bg-white/50 border border-slate-200/60 text-slate-500 text-sm">
          No audit logs recorded matching your search query.
        </div>
      ) : (
        <div className="glass-card rounded-3xl p-6 border border-white/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-extrabold uppercase tracking-wider">
                  <th className="pb-3 px-3">Timestamp</th>
                  <th className="pb-3 px-3">Administrator</th>
                  <th className="pb-3 px-3">Action</th>
                  <th className="pb-3 px-3">Details / Target</th>
                  <th className="pb-3 px-3">IP Address</th>
                  <th className="pb-3 px-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-3 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-3 font-bold text-slate-900">
                      <div className="flex items-center gap-1.5">
                        <User className="size-3 text-cyan-600" />
                        <span>{log.adminEmail}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-3 font-bold text-cyan-700">
                      {log.action}
                    </td>
                    <td className="py-3.5 px-3 text-slate-600 max-w-xs truncate">
                      {log.details || log.target || "—"}
                    </td>
                    <td className="py-3.5 px-3 text-slate-500 font-mono text-[11px]">
                      {log.ip}
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                          log.status === "success"
                            ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                            : log.status === "warning"
                            ? "bg-amber-50 text-amber-800 border border-amber-200"
                            : "bg-red-50 text-red-800 border border-red-200"
                        }`}
                      >
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
