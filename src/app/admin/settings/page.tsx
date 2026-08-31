"use client";

import React, { useState, useEffect } from "react";
import { SiteSettings } from "@/lib/data";
import {
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Shield,
  Eye,
  Sliders,
  Sparkles,
  Palette,
  ExternalLink,
} from "lucide-react";

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

      setNotice({ type: "success", text: "Site settings & admin permissions updated and synchronized!" });
    } catch (err: any) {
      setNotice({ type: "error", text: err.message || "Failed to save" });
    } finally {
      setSaving(false);
    }
  };

  const handleAddEmail = async () => {
    if (!newEmail || !settings) return;
    const clean = newEmail.trim().toLowerCase();
    if (!clean.includes("@") || !clean.includes(".")) {
      setNotice({ type: "error", text: "Please enter a valid Google account email address." });
      return;
    }
    if (settings.adminEmails.includes(clean)) {
      setNotice({ type: "error", text: `${clean} is already in the authorized administrator whitelist.` });
      return;
    }

    const updatedEmails = [...settings.adminEmails, clean];
    const updatedSettings = {
      ...settings,
      adminEmails: updatedEmails,
    };

    setSettings(updatedSettings);
    setNewEmail("");
    setNotice({ type: "success", text: `Authorizing ${clean}...` });

    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedSettings),
      });
      if (!res.ok) throw new Error("Failed to save whitelist update");
      setNotice({ type: "success", text: `Successfully authorized and saved ${clean} to admin whitelist!` });
    } catch (err: any) {
      setNotice({ type: "error", text: err.message || "Failed to persist whitelist update" });
    }
  };

  const handleRemoveEmail = async (emailToRemove: string) => {
    if (!settings) return;
    if (emailToRemove.toLowerCase() === "priyanshushaurya9431@gmail.com") {
      setNotice({ type: "error", text: "priyanshushaurya9431@gmail.com is permanently authorized as the root administrator." });
      return;
    }

    const updatedEmails = settings.adminEmails.filter((e) => e.toLowerCase() !== emailToRemove.toLowerCase());
    const updatedSettings = {
      ...settings,
      adminEmails: updatedEmails,
    };

    setSettings(updatedSettings);
    setNotice({ type: "success", text: `Revoking access for ${emailToRemove}...` });

    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedSettings),
      });
      if (!res.ok) throw new Error("Failed to save whitelist update");
      setNotice({ type: "success", text: `Revoked access for ${emailToRemove} and updated whitelist.` });
    } catch (err: any) {
      setNotice({ type: "error", text: err.message || "Failed to persist whitelist revocation" });
    }
  };

  if (loading || !settings) {
    return (
      <div className="flex items-center justify-center min-h-[40vh] text-cyan-600">
        <Loader2 className="size-8 animate-spin" />
      </div>
    );
  }

  const pageKeys = ["about", "events", "team", "gallery", "recruit"] as const;

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header Bar */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-100 text-cyan-800 text-[11px] font-extrabold uppercase tracking-wider mb-2 border border-cyan-200">
            <Sliders className="size-3 text-cyan-600" />
            <span>Platform Configuration</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Global Site Settings &amp; Security
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Configure club branding, page visibility toggles, and administrator Google accounts.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-bold text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 shadow-md shadow-cyan-600/25 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer disabled:opacity-50"
        >
          {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
          <span>Save Settings</span>
        </button>
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

      {/* ===== 1. SECURITY & ADMIN EMAILS WHITELIST ===== */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white/80 shadow-sm space-y-6">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
          <Shield className="size-5 text-cyan-600" />
          <span>Admin Whitelist Access Control</span>
        </h2>

        <p className="text-xs text-slate-500 font-medium leading-relaxed">
          Only users who authenticate via Google with the email addresses listed below are granted access to the CMS.
        </p>

        <div className="space-y-3">
          <div className="flex gap-2">
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="e.g. mentor@dsu.edu.in"
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-xs font-semibold focus:outline-none focus:border-cyan-500"
            />
            <button
              type="button"
              onClick={handleAddEmail}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <Plus className="size-4" />
              <span>Authorize Email</span>
            </button>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            {settings.adminEmails.map((email) => {
              const isRoot = email.toLowerCase() === "priyanshushaurya9431@gmail.com";
              return (
                <div
                  key={email}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold ${
                    isRoot
                      ? "bg-cyan-50 border border-cyan-300 text-cyan-900 shadow-xs"
                      : "bg-slate-100 border border-slate-200 text-slate-800"
                  }`}
                >
                  <span>{email}</span>
                  {isRoot ? (
                    <span className="text-[10px] uppercase font-extrabold px-1.5 py-0.5 bg-cyan-200 text-cyan-900 rounded-md">
                      Root Admin
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleRemoveEmail(email)}
                      className="text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                      title="Remove Whitelist Email"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ===== 2. PAGE VISIBILITY TOGGLES ===== */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white/80 shadow-sm space-y-6">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
          <Eye className="size-5 text-cyan-600" />
          <span>Public Page Visibility Toggles</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          {pageKeys.map((key) => {
            const isVisible = settings.visiblePages?.[key] ?? true;
            return (
              <label
                key={key}
                className="flex items-center justify-between p-4 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 cursor-pointer"
              >
                <div>
                  <span className="font-bold text-slate-900 uppercase block">/{key}</span>
                  <span className="text-slate-500">Public navigation link &amp; route</span>
                </div>
                <input
                  type="checkbox"
                  checked={isVisible}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      visiblePages: {
                        ...settings.visiblePages,
                        [key]: e.target.checked,
                      },
                    })
                  }
                  className="size-4 accent-cyan-600 rounded"
                />
              </label>
            );
          })}
        </div>
      </div>

      {/* ===== 2.5 ACTIVE UI DESIGN ENGINE ===== */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white/80 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Palette className="size-5 text-cyan-600" />
            <span>Active Visual UI Design Engine</span>
          </h2>
          <a
            href="/admin/designs"
            className="text-xs font-bold text-cyan-600 hover:text-cyan-700 hover:underline flex items-center gap-1"
          >
            <span>Open Design Gallery</span>
            <ExternalLink className="size-3" />
          </a>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <label
            className={`p-4 rounded-2xl border cursor-pointer transition-all ${
              settings.activeDesign === "ivory-light" || !settings.activeDesign
                ? "border-cyan-500 bg-cyan-50/50 shadow-sm ring-1 ring-cyan-500"
                : "border-slate-200 bg-white hover:bg-slate-50"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-extrabold text-slate-900 text-sm">Ivory Minimalist (Design 1)</span>
              <input
                type="radio"
                name="activeDesign"
                value="ivory-light"
                checked={settings.activeDesign === "ivory-light" || !settings.activeDesign}
                onChange={() => setSettings({ ...settings, activeDesign: "ivory-light" })}
                className="accent-cyan-600"
              />
            </div>
            <p className="text-slate-500 leading-relaxed">
              Warm ivory canvas (#FFFFE9), high-legibility serif headings, and lime accents.
            </p>
          </label>

          <label
            className={`p-4 rounded-2xl border cursor-pointer transition-all ${
              settings.activeDesign === "wix-bold"
                ? "border-cyan-500 bg-cyan-50/50 shadow-sm ring-1 ring-cyan-500"
                : "border-slate-200 bg-white hover:bg-slate-50"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-extrabold text-slate-900 text-sm">Obsidian Cyber Bold (Design 2)</span>
              <input
                type="radio"
                name="activeDesign"
                value="wix-bold"
                checked={settings.activeDesign === "wix-bold"}
                onChange={() => setSettings({ ...settings, activeDesign: "wix-bold" })}
                className="accent-cyan-600"
              />
            </div>
            <p className="text-slate-500 leading-relaxed">
              Futuristic dark theme (#040812) with glowing neon accents and frosted cyber cards.
            </p>
          </label>
        </div>
      </div>

      {/* ===== 3. SECTION HEADINGS ===== */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white/80 shadow-sm space-y-6">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
          <Sliders className="size-5 text-cyan-600" />
          <span>Team Page Section Headings</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="space-y-1.5">
            <label className="block font-bold uppercase tracking-wider text-slate-700">
              Faculty Section Title
            </label>
            <input
              type="text"
              value={settings.facultyHeading}
              onChange={(e) => setSettings({ ...settings, facultyHeading: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm font-semibold focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block font-bold uppercase tracking-wider text-slate-700">
              Student Leadership Title
            </label>
            <input
              type="text"
              value={settings.studentHeading}
              onChange={(e) => setSettings({ ...settings, studentHeading: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm font-semibold focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>
      </div>

      {/* ===== 4. SOCIAL MEDIA & COMMUNITY LINKS (CONNECT & FOLLOW) ===== */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white/80 shadow-sm space-y-6">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Sparkles className="size-5 text-cyan-600" />
            <span>Connect &amp; Follow (Footer &amp; Social Links)</span>
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-2">
            Configure the live URLs for footer &apos;Connect &amp; Follow&apos; buttons across the website.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="space-y-1.5">
            <label className="block font-bold uppercase tracking-wider text-slate-700">
              LinkedIn Profile / Page URL
            </label>
            <input
              type="url"
              value={settings.socialLinks?.linkedin || ""}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  socialLinks: {
                    ...settings.socialLinks,
                    linkedin: e.target.value,
                  },
                })
              }
              placeholder="https://linkedin.com/company/aifoundry-dsu"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-xs font-semibold focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block font-bold uppercase tracking-wider text-slate-700">
              Instagram Profile URL
            </label>
            <input
              type="url"
              value={settings.socialLinks?.instagram || ""}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  socialLinks: {
                    ...settings.socialLinks,
                    instagram: e.target.value,
                  },
                })
              }
              placeholder="https://instagram.com/aifoundry_dsu"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-xs font-semibold focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block font-bold uppercase tracking-wider text-slate-700">
              GitHub Organization URL
            </label>
            <input
              type="url"
              value={settings.socialLinks?.github || ""}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  socialLinks: {
                    ...settings.socialLinks,
                    github: e.target.value,
                  },
                })
              }
              placeholder="https://github.com/aifoundry-dsu"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-xs font-semibold focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block font-bold uppercase tracking-wider text-slate-700">
              X (Twitter) Profile URL
            </label>
            <input
              type="url"
              value={settings.socialLinks?.twitter || ""}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  socialLinks: {
                    ...settings.socialLinks,
                    twitter: e.target.value,
                  },
                })
              }
              placeholder="https://x.com/aifoundry_dsu"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-xs font-semibold focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block font-bold uppercase tracking-wider text-slate-700">
              Official Contact Email
            </label>
            <input
              type="email"
              value={settings.socialLinks?.email || ""}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  socialLinks: {
                    ...settings.socialLinks,
                    email: e.target.value,
                  },
                })
              }
              placeholder="info@aifoundry.com"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-xs font-semibold focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block font-bold uppercase tracking-wider text-slate-700">
              Discord / Community Invite URL
            </label>
            <input
              type="url"
              value={settings.socialLinks?.discord || ""}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  socialLinks: {
                    ...settings.socialLinks,
                    discord: e.target.value,
                  },
                })
              }
              placeholder="https://discord.gg/aifoundry"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-xs font-semibold focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
