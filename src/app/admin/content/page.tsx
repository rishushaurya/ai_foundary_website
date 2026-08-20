"use client";

import React, { useState, useEffect } from "react";
import { ContentSection, SiteSettings } from "@/lib/data";
import { Save, Loader2, CheckCircle, AlertCircle, Plus, Trash2, FileText } from "lucide-react";

export default function AdminContentPage() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [content, setContent] = useState<ContentSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [settingsRes, contentRes] = await Promise.all([
        fetch("/api/admin/settings"),
        fetch("/api/admin/content"),
      ]);
      const sData = await settingsRes.json();
      const cData = await contentRes.json();
      setSettings(sData);
      setContent(cData);
    } catch {
      setNotice({ type: "error", text: "Failed to load copy and settings" });
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
      const [sRes, cRes] = await Promise.all([
        fetch("/api/admin/settings", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(settings),
        }),
        fetch("/api/admin/content", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(content),
        }),
      ]);

      if (!sRes.ok || !cRes.ok) throw new Error("Failed to save content");

      setNotice({ type: "success", text: "Site copy and settings updated successfully" });
    } catch (err: any) {
      setNotice({ type: "error", text: err.message || "Save failed" });
    } finally {
      setSaving(false);
    }
  };

  const updateAboutParagraph = (index: number, text: string) => {
    const updated = [...content];
    const aboutSec = updated.find((c) => c.id === "about");
    if (aboutSec) {
      aboutSec.paragraphs[index] = text;
      setContent(updated);
    }
  };

  const addAboutParagraph = () => {
    const updated = [...content];
    const aboutSec = updated.find((c) => c.id === "about");
    if (aboutSec) {
      aboutSec.paragraphs.push("");
      setContent(updated);
    }
  };

  const removeAboutParagraph = (index: number) => {
    const updated = [...content];
    const aboutSec = updated.find((c) => c.id === "about");
    if (aboutSec) {
      aboutSec.paragraphs.splice(index, 1);
      setContent(updated);
    }
  };

  if (loading || !settings) {
    return (
      <div className="space-y-4 font-mono">
        <div className="h-20 rounded-3xl border border-white/10 bg-black/40 animate-pulse" />
        <div className="h-48 rounded-3xl border border-white/10 bg-black/40 animate-pulse" />
      </div>
    );
  }

  const aboutSec = content.find((c) => c.id === "about");

  return (
    <div className="space-y-6 font-mono text-white">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div>
          <h1 className="text-xl font-black uppercase tracking-wider text-white">
            HERO &amp; ABOUT COPY EDITOR
          </h1>
          <p className="text-xs text-slate-400 normal-case font-sans">
            Customize main landing headlines, taglines, and institutional mission text.
          </p>
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

      <form onSubmit={handleSave} className="space-y-8 text-xs">
        {/* Hero Copy Card */}
        <div className="p-6 sm:p-8 rounded-3xl border border-white/15 bg-black/40 backdrop-blur-xl shadow-xl space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-cyan-400 border-b border-white/10 pb-2">
            HERO SECTION COPY
          </h2>

          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-300 mb-1">
              Main Headline Tagline
            </label>
            <input
              type="text"
              required
              value={settings.heroTagline}
              onChange={(e) => setSettings({ ...settings, heroTagline: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-white/20 bg-white/5 focus:outline-none focus:border-cyan-400 focus:bg-white/10 text-white font-bold transition-colors"
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-300 mb-1">
              Sub-Headline Description
            </label>
            <textarea
              rows={3}
              required
              value={settings.heroSubtext}
              onChange={(e) => setSettings({ ...settings, heroSubtext: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-white/20 bg-white/5 focus:outline-none focus:border-cyan-400 focus:bg-white/10 text-white leading-relaxed transition-colors font-sans"
            />
          </div>
        </div>

        {/* About Mission Paragraphs */}
        <div className="p-6 sm:p-8 rounded-3xl border border-white/15 bg-black/40 backdrop-blur-xl shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <h2 className="text-sm font-bold uppercase tracking-wider text-cyan-400">
              ABOUT PAGE MISSION PARAGRAPHS
            </h2>
            <button
              type="button"
              onClick={addAboutParagraph}
              className="flex items-center gap-1 text-[11px] font-bold text-cyan-400 hover:text-cyan-300 cursor-pointer"
            >
              <Plus className="size-3.5" />
              <span>Add Paragraph</span>
            </button>
          </div>

          {aboutSec?.paragraphs.map((para, idx) => (
            <div key={idx} className="space-y-1.5 p-4 rounded-2xl border border-white/10 bg-white/5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase text-slate-300 font-bold">Paragraph {idx + 1}</span>
                <button
                  type="button"
                  onClick={() => removeAboutParagraph(idx)}
                  className="text-red-400 hover:text-red-300 text-[10px] flex items-center gap-1 font-bold cursor-pointer"
                >
                  <Trash2 className="size-3" />
                  <span>Remove</span>
                </button>
              </div>
              <textarea
                rows={3}
                value={para}
                onChange={(e) => updateAboutParagraph(idx, e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-white/15 bg-black/40 text-white leading-relaxed font-sans focus:outline-none focus:border-cyan-400 transition-colors"
              />
            </div>
          ))}
        </div>

        {/* Section Headings */}
        <div className="p-6 sm:p-8 rounded-3xl border border-white/15 bg-black/40 backdrop-blur-xl shadow-xl space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-cyan-400 border-b border-white/10 pb-2">
            SECTION HEADINGS
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-300 mb-1">
                Faculty Section Title
              </label>
              <input
                type="text"
                value={settings.facultyHeading}
                onChange={(e) => setSettings({ ...settings, facultyHeading: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-white/20 bg-white/5 focus:outline-none focus:border-cyan-400 focus:bg-white/10 text-white transition-colors"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-300 mb-1">
                Leadership Section Title
              </label>
              <input
                type="text"
                value={settings.studentHeading}
                onChange={(e) => setSettings({ ...settings, studentHeading: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-white/20 bg-white/5 focus:outline-none focus:border-cyan-400 focus:bg-white/10 text-white transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-8 py-3.5 rounded-full font-bold uppercase tracking-wider bg-cyan-400 hover:bg-cyan-300 text-black cursor-pointer transition-all hover:scale-105 shadow-[0_0_20px_rgba(0,210,255,0.4)] disabled:opacity-50"
          >
            {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
            <span>Save All Changes</span>
          </button>
        </div>
      </form>
    </div>
  );
}
