"use client";

import React, { useState, useEffect } from "react";
import { AuditLogEntry } from "@/lib/audit-logger";
import {
  Shield,
  Search,
  RefreshCw,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Clock,
  User,
  Trash2,
  FileSpreadsheet,
  Lock,
  X,
  AlertTriangle,
} from "lucide-react";

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [purging, setPurging] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [notice, setNotice] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [currentEmail, setCurrentEmail] = useState<string>("");

  // Modals for safe in-app confirmations
  const [logToDelete, setLogToDelete] = useState<AuditLogEntry | null>(null);
  const [showPurgeModal, setShowPurgeModal] = useState(false);

  const ROOT_ADMIN = "priyanshushaurya9431@gmail.com";
  const isRootAdmin = currentEmail.toLowerCase() === ROOT_ADMIN.toLowerCase();

  const fetchSession = async () => {
    try {
      const res = await fetch("/api/auth/session");
      if (res.ok) {
        const data = await res.json();
        if (data.user?.email) {
          setCurrentEmail(data.user.email);
        }
      }
    } catch {}
  };

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/audit-logs");
      if (res.ok) {
        const data = await res.json();
        setLogs(data);
      }
    } catch {
      setNotice({ type: "error", text: "Failed to load audit logs" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSession();
    fetchLogs();
  }, []);

  // Download logs in Excel / CSV format (Permitted for ANY admin)
  const handleExportExcel = async () => {
    setExporting(true);
    try {
      const link = document.createElement("a");
      link.href = "/api/admin/audit-logs?export=excel";
      link.setAttribute("download", `aifoundry-audit-logs-${new Date().toISOString().split("T")[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setNotice({
        type: "success",
        text: `Audit logs exported to Excel format successfully (${logs.length} records).`,
      });
    } catch {
      setNotice({ type: "error", text: "Failed to download audit logs" });
    } finally {
      setExporting(false);
    }
  };

  // Execute single log deletion (Restricted to Root Admin)
  const executeSingleDelete = async () => {
    if (!logToDelete) return;

    setDeletingId(logToDelete.id);
    setNotice(null);

    try {
      const res = await fetch(`/api/admin/audit-logs?id=${encodeURIComponent(logToDelete.id)}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to delete log entry");
      }

      setNotice({
        type: "success",
        text: `Audit record '${logToDelete.action}' deleted successfully.`,
      });
      setLogs((prev) => prev.filter((item) => item.id !== logToDelete.id));
      setLogToDelete(null);
    } catch (err: any) {
      setNotice({
        type: "error",
        text: err.message || "Access Denied: Only root administrator can delete audit logs.",
      });
    } finally {
      setDeletingId(null);
    }
  };

  // Execute purge of entire audit log trail (Restricted to Root Admin)
  const executePurgeAll = async () => {
    setPurging(true);
    setNotice(null);

    try {
      const res = await fetch("/api/admin/audit-logs", { method: "DELETE" });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to purge audit logs");
      }

      setNotice({ type: "success", text: "Audit trail purged and initialized successfully!" });
      setLogs(data.logs || []);
      setShowPurgeModal(false);
    } catch (err: any) {
      setNotice({
        type: "error",
        text: err.message || "Access Denied: Only root administrator can purge logs.",
      });
    } finally {
      setPurging(false);
    }
  };

  const filteredLogs = logs.filter((log) => {
    const q = searchQuery.toLowerCase();
    return (
      log.action.toLowerCase().includes(q) ||
      log.adminEmail.toLowerCase().includes(q) ||
      (log.details && log.details.toLowerCase().includes(q)) ||
      (log.target && log.target.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white/80 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-100 text-cyan-800 text-[11px] font-extrabold uppercase tracking-wider mb-2 border border-cyan-200">
            <Shield className="size-3 text-cyan-600" />
            <span>Security &amp; Compliance Trail</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Administrative Audit Trail
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            Real-time immutable security logs of every administrative login, mutation, and content update.
          </p>

          {isRootAdmin && (
            <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-900 text-[10px] font-mono font-bold border border-amber-200">
              <span>👑 Root Admin Authorized: Individual Log Deletion Active</span>
            </div>
          )}
        </div>

        {/* Action Toolbar */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Refresh */}
          <button
            onClick={fetchLogs}
            disabled={loading}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-full border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            title="Reload recent logs"
          >
            <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>

          {/* Download in Excel Format (ANY ADMIN) */}
          <button
            onClick={handleExportExcel}
            disabled={exporting || logs.length === 0}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-full border border-emerald-300 bg-emerald-50 text-xs font-bold text-emerald-800 hover:bg-emerald-100 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            title="Download audit logs in formatted Excel spreadsheet (.csv)"
          >
            {exporting ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <FileSpreadsheet className="size-3.5 text-emerald-600" />
            )}
            <span>Export to Excel</span>
          </button>

          {/* Purge All Logs (ROOT ADMIN ONLY) */}
          <button
            onClick={() => setShowPurgeModal(true)}
            disabled={purging || !isRootAdmin}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-full border border-red-200 bg-red-50 text-xs font-bold text-red-700 hover:bg-red-100 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            title={
              isRootAdmin
                ? "Purge entire audit trail (Root Admin)"
                : "Restricted to Root Administrator (priyanshushaurya9431@gmail.com)"
            }
          >
            <Trash2 className="size-3.5" />
            <span>Purge All</span>
          </button>
        </div>
      </div>

      {/* Notice Banner */}
      {notice && (
        <div
          className={`p-4 rounded-2xl text-xs font-bold flex items-center justify-between gap-3 ${
            notice.type === "success"
              ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
              : "bg-red-50 border border-red-200 text-red-800"
          }`}
        >
          <div className="flex items-center gap-2">
            {notice.type === "success" ? (
              <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="size-4 text-red-600 shrink-0" />
            )}
            <span>{notice.text}</span>
          </div>
          <button
            onClick={() => setNotice(null)}
            className="text-slate-400 hover:text-slate-700 text-xs"
          >
            ✕
          </button>
        </div>
      )}

      {/* Search Filter Box */}
      <div className="glass-card rounded-2xl p-4 border border-white/80 flex items-center gap-3">
        <Search className="size-4 text-slate-400 shrink-0" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by administrator email, action name, or details..."
          className="w-full bg-transparent text-xs sm:text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="text-xs text-slate-400 hover:text-slate-700 font-bold"
          >
            Clear
          </button>
        )}
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
                  <th className="pb-3 px-3">Action Performed</th>
                  <th className="pb-3 px-3">Details / Target Scope</th>
                  <th className="pb-3 px-3 text-center">Status</th>
                  <th className="pb-3 px-3 text-right">Manage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLogs.map((log) => {
                  return (
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
                      <td className="py-3.5 px-3 text-slate-600 max-w-sm truncate">
                        {log.details || log.target || "—"}
                      </td>
                      <td className="py-3.5 px-3 text-center">
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
                      <td className="py-3.5 px-3 text-right">
                        {isRootAdmin ? (
                          <button
                            onClick={() => setLogToDelete(log)}
                            className="size-7 rounded-lg border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-800 transition-colors inline-flex items-center justify-center cursor-pointer"
                            title="Delete this audit record (Root Admin)"
                          >
                            <Trash2 className="size-3" />
                          </button>
                        ) : (
                          <span
                            className="text-slate-300 inline-flex items-center"
                            title="Deleting logs is restricted to Root Admin"
                          >
                            <Lock className="size-3" />
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ===== SAFE CONFIRMATION MODAL: SINGLE LOG DELETION ===== */}
      {logToDelete && (
        <div
          className="fixed inset-0 z-[100000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setLogToDelete(null)}
        >
          <div
            className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-red-600 font-extrabold text-sm">
                <AlertTriangle className="size-4" />
                <span>Delete Audit Record</span>
              </div>
              <button
                onClick={() => setLogToDelete(null)}
                className="size-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-800"
              >
                <X className="size-3.5" />
              </button>
            </div>

            <div className="space-y-2 text-xs text-slate-600">
              <p className="font-semibold text-slate-800">
                Are you sure you want to delete this specific audit log entry?
              </p>
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1 font-mono text-[11px]">
                <p>
                  <strong className="text-slate-800">Action:</strong> {logToDelete.action}
                </p>
                <p>
                  <strong className="text-slate-800">Admin:</strong> {logToDelete.adminEmail}
                </p>
                <p>
                  <strong className="text-slate-800">Time:</strong>{" "}
                  {new Date(logToDelete.timestamp).toLocaleString()}
                </p>
              </div>
              <p className="text-[11px] text-slate-400">
                This deletion will be logged in the permanent security audit ledger.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setLogToDelete(null)}
                className="px-4 py-2 rounded-full border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deletingId === logToDelete.id}
                onClick={executeSingleDelete}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-red-600 text-xs font-bold text-white hover:bg-red-700 shadow-sm disabled:opacity-50"
              >
                {deletingId === logToDelete.id ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <Trash2 className="size-3.5" />
                )}
                <span>Yes, Delete Record</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== SAFE CONFIRMATION MODAL: PURGE ALL LOGS ===== */}
      {showPurgeModal && (
        <div
          className="fixed inset-0 z-[100000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setShowPurgeModal(false)}
        >
          <div
            className="w-full max-w-md bg-white border border-red-200 rounded-3xl p-6 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-red-600 font-extrabold text-sm">
                <AlertTriangle className="size-4" />
                <span>Purge Entire Audit Trail</span>
              </div>
              <button
                onClick={() => setShowPurgeModal(false)}
                className="size-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-800"
              >
                <X className="size-3.5" />
              </button>
            </div>

            <div className="space-y-2 text-xs text-slate-600">
              <p className="font-semibold text-slate-800">
                Are you sure you want to PURGE ALL historical audit records?
              </p>
              <p className="text-slate-500">
                This action is irreversible and can only be performed by the root administrator (
                <span className="font-mono font-bold text-slate-800">{ROOT_ADMIN}</span>).
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowPurgeModal(false)}
                className="px-4 py-2 rounded-full border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={purging}
                onClick={executePurgeAll}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-red-600 text-xs font-bold text-white hover:bg-red-700 shadow-sm disabled:opacity-50"
              >
                {purging ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <Trash2 className="size-3.5" />
                )}
                <span>Yes, Purge Trail</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
