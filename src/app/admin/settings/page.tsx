"use client";

import React, { useState, useEffect } from "react";
import { SiteSettings } from "@/lib/data";
import { Save, Loader2, CheckCircle, AlertCircle, Plus, Trash2, Shield, Eye, Settings } from "lucide-react";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [newEmail, setNewEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/settings");
      const data = await res.json();
      setSettings(data);
    } catch {
      setNotice({ type: "error", text: "Failed to load settings" });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    setSaving(true);
    setNotice(null);

    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (!res.ok) throw new Error("Failed to save settings");

      setNotice({ type: "success", text: "Site settings and permissions saved successfully" });
    } catch (err: any) {
      setNotice({ type: "error", text: err.message || "Failed to save" });
    } finally {
      setSaving(false);
    }
  };

  const handleAddEmail = () => {
    if (!newEmail || !settings) return;
    const clean = newEmail.trim().toLowerCase();
    if (settings.adminEmails.includes(clean)) return;

    setSettings({
      ...settings,
      adminEmails: [...settings.adminEmails, clean],
    });
    setNewEmail("");
  };

  const handleRemoveEmail = (emailToRemove: string) => {
    if (!settings) return;
    setSettings({
      ...settings,
      adminEmails: settings.adminEmails.filter((e) => e !== emailToRemove),
    });
  };

  if (loading || !settings) {
    return (
      <div className="flex items-center justify-center min-h-[40vh] text-cyan-400">
        <Loader2 className="size-8 animate-spin" />
      </div>
    );
  }

  const pageKeys = ["about", "events", "team", "gallery", "recruit"] as const;

  return (
    <div className="space-y-8 max-w-4xl font-mono text-white">
      {/* Title */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h1 className="text-xl font-black uppercase tracking-wider text-white">
            GLOBAL SITE SETTINGS &amp; SECURITY
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-sans">
            Configure club branding, page visibility, and administrator Google accounts
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider text-black bg-cyan-400 hover:bg-cyan-300 transition-all cursor-pointer shadow-[0_0_15px_rgba(0,210,255,0.4)] hover:scale-105 disabled:opacity-50"
        >
          {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
          <span>Save Changes</span>
        </button>
      </div>

      {notice && (
        <div
          className={`flex items-center gap-2 p-3.5 rounded-2xl text-xs font-bold uppercase tracking-wide border ${
            notice.type === "success"
              ? "bg-emerald-950/60 text-emerald-300 border-emerald-500/40"
              : "bg-red-950/60 text-red-300 border-red-500/40"
          }`}
        >
          {notice.type === "success" ? <CheckCircle className="size-4" /> : <AlertCircle className="size-4" />}
          <span>{notice.text}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6 text-xs">
        {/* 1. Page Visibility Manager */}
        <div className="p-6 sm:p-8 rounded-3xl border border-white/15 bg-black/40 backdrop-blur-xl shadow-xl space-y-4">
          <div className="flex items-center gap-2 border-b border-white/10 pb-2 text-cyan-400">
            <Eye className="size-4" />
            <h2 className="text-sm font-bold uppercase tracking-wider">
              DYNAMIC PAGE VISIBILITY (SHOW / HIDE)
            </h2>
          </div>
          <p className="text-slate-400 normal-case font-sans">
            Toggle which pages are active in the visitor navigation bar. Unchecked pages will not appear to public visitors.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 pt-2">
            {pageKeys.map((key) => {
              const isChecked = (settings.visiblePages as any)[key] ?? true;
              return (
                <label
                  key={key}
                  className={`flex items-center gap-2 p-3 rounded-2xl border cursor-pointer transition-all ${
                    isChecked
                      ? "border-cyan-400 bg-cyan-950/40 text-cyan-300 font-bold shadow-sm"
                      : "border-white/10 bg-white/5 text-slate-500 opacity-60"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        visiblePages: {
                          ...settings.visiblePages,
                          [key]: e.target.checked,
                        },
                      })
                    }
                  />
                  <span className="uppercase text-[11px]">{key}</span>
                </label>
              );
            })}
          </div>
        </div>

        {/* 2. Club Branding & Meta Information */}
        <div className="p-6 sm:p-8 rounded-3xl border border-white/15 bg-black/40 backdrop-blur-xl shadow-xl space-y-4">
          <div className="flex items-center gap-2 border-b border-white/10 pb-2 text-cyan-400">
            <Settings className="size-4" />
            <h2 className="text-sm font-bold uppercase tracking-wider">
              CLUB BRANDING &amp; UNIVERSITY
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-300 uppercase">Site Title</label>
              <input
                type="text"
                value={settings.siteTitle || "AI Foundry | Dayananda Sagar University"}
                onChange={(e) => setSettings({ ...settings, siteTitle: e.target.value })}
                className="w-full p-3 rounded-xl border border-white/20 bg-white/5 text-white focus:outline-none focus:border-cyan-400 transition-colors"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-300 uppercase">Institution / University</label>
              <input
                type="text"
                value="Dayananda Sagar University (DSU)"
                readOnly
                className="w-full p-3 rounded-xl border border-white/10 text-slate-500 bg-white/5 cursor-not-allowed"
              />
            </div>
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-[11px] font-bold text-slate-300 uppercase">Hero Tagline</label>
              <input
                type="text"
                value={settings.heroTagline || "FORGING THE FUTURE OF ENTREPRENEURSHIP & ARTIFICIAL INTELLIGENCE"}
                onChange={(e) => setSettings({ ...settings, heroTagline: e.target.value })}
                className="w-full p-3 rounded-xl border border-white/20 bg-white/5 text-white focus:outline-none focus:border-cyan-400 transition-colors font-bold"
              />
            </div>
          </div>
        </div>

        {/* 3. Google OAuth Administrator Whitelist */}
        <div className="p-6 sm:p-8 rounded-3xl border border-white/15 bg-black/40 backdrop-blur-xl shadow-xl space-y-4">
          <div className="flex items-center gap-2 border-b border-white/10 pb-2 text-cyan-400">
            <Shield className="size-4" />
            <h2 className="text-sm font-bold uppercase tracking-wider">
              GOOGLE OAUTH ADMIN WHITELIST
            </h2>
          </div>
          <p className="text-slate-400 normal-case font-sans">
            Only Google accounts listed below are granted access to this Admin Control Center.
          </p>

          <div className="flex gap-2">
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="e.g. lead@dsu.edu.in"
              className="flex-1 p-3 rounded-xl border border-white/20 bg-white/5 text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
            />
            <button
              type="button"
              onClick={handleAddEmail}
              className="inline-flex items-center gap-1.5 px-5 py-3 rounded-xl border border-cyan-400/50 font-bold uppercase text-cyan-300 bg-cyan-950/40 hover:bg-cyan-900/60 transition-colors cursor-pointer"
            >
              <Plus className="size-4" />
              <span>Add</span>
            </button>
          </div>

          <div className="space-y-2 pt-2">
            {settings.adminEmails.map((email) => (
              <div
                key={email}
                className="flex items-center justify-between p-3.5 rounded-2xl border border-white/15 bg-white/5"
              >
                <div className="flex items-center gap-2 text-white font-bold text-xs">
                  <Shield className="size-3.5 text-cyan-400" />
                  <span>{email}</span>
                </div>
                {settings.adminEmails.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveEmail(email)}
                    className="p-1 text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
                    title="Remove access"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 4. Social Links */}
        <div className="p-6 sm:p-8 rounded-3xl border border-white/15 bg-black/40 backdrop-blur-xl shadow-xl space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-cyan-400 border-b border-white/10 pb-2">
            OFFICIAL SOCIAL HANDLES
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-300 uppercase">LinkedIn URL</label>
              <input
                type="url"
                value={settings.socialLinks?.linkedin || ""}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    socialLinks: { ...settings.socialLinks, linkedin: e.target.value },
                  })
                }
                className="w-full p-3 rounded-xl border border-white/20 bg-white/5 text-white focus:outline-none focus:border-cyan-400"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-300 uppercase">Instagram URL</label>
              <input
                type="url"
                value={settings.socialLinks?.instagram || ""}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    socialLinks: { ...settings.socialLinks, instagram: e.target.value },
                  })
                }
                className="w-full p-3 rounded-xl border border-white/20 bg-white/5 text-white focus:outline-none focus:border-cyan-400"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-300 uppercase">GitHub Organization</label>
              <input
                type="url"
                value={settings.socialLinks?.github || ""}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    socialLinks: { ...settings.socialLinks, github: e.target.value },
                  })
                }
                className="w-full p-3 rounded-xl border border-white/20 bg-white/5 text-white focus:outline-none focus:border-cyan-400"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-300 uppercase">Official Contact Email</label>
              <input
                type="email"
                value={settings.socialLinks?.email || ""}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    socialLinks: { ...settings.socialLinks, email: e.target.value },
                  })
                }
                className="w-full p-3 rounded-xl border border-white/20 bg-white/5 text-white focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
