"use client";

import React, { useState, useEffect } from "react";
import { GallerySection, GalleryItem } from "@/lib/data";
import { normalizeImageUrl } from "@/lib/image-helper";
import {
  Plus,
  Trash2,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Image as ImageIcon,
  Link as LinkIcon,
  Eye,
  Sparkles,
} from "lucide-react";

export default function AdminGalleryPage() {
  const [sections, setSections] = useState<GallerySection[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetchGallery();
  }, []);

  const fetchGallery = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/gallery");
      const data = await res.json();
      setSections(data);
    } catch {
      setNotice({ type: "error", text: "Failed to load gallery albums" });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setNotice(null);
    try {
      const res = await fetch("/api/admin/gallery", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sections),
      });
      if (!res.ok) throw new Error("Save failed");
      setNotice({ type: "success", text: "Gallery albums & image links updated and synchronized!" });
    } catch (err: any) {
      setNotice({ type: "error", text: err.message || "Failed to save" });
    } finally {
      setSaving(false);
    }
  };

  const addSection = () => {
    setSections([
      ...sections,
      {
        id: `gal-${Date.now()}`,
        name: "New Event Album",
        showOnHome: true,
        showOnGalleryPage: true,
        items: [],
      },
    ]);
  };

  const removeSection = (id: string) => {
    setSections(sections.filter((s) => s.id !== id));
  };

  const addItemToSection = (secId: string) => {
    setSections(
      sections.map((s) => {
        if (s.id === secId) {
          return {
            ...s,
            items: [
              ...s.items,
              {
                id: `img-${Date.now()}`,
                type: "image",
                name: "Event Photograph",
                url: "https://lh3.googleusercontent.com/aida-public/AB6AXuBqGXvsvKNg8FLCw2KFq974LERIA0x-ed5scbtG-vr7_Erz1LXF0Kxo6IqAt4jUJjdeQwylLItjc3ZIlWy4POUMjToItuEgSL3auk47bkOyypTKJlgIVp-zH_xOVI1B5rjO0mLjpM2L8SLv_2EXACmgePorX1RlrdDiyzJr2_mfCFS0OtkGutcJDkKw7PWNzbGl59kAK4Vn_VSR3N7VpPY09StkEzS5Wmj2LWXxcNiNMtKDurLLha5S",
              },
            ],
          };
        }
        return s;
      })
    );
  };

  const removeItem = (secId: string, itemId: string) => {
    setSections(
      sections.map((s) => {
        if (s.id === secId) {
          return {
            ...s,
            items: s.items.filter((i) => i.id !== itemId),
          };
        }
        return s;
      })
    );
  };

  const updateItem = (secId: string, itemId: string, field: keyof GalleryItem, value: any) => {
    setSections(
      sections.map((s) => {
        if (s.id === secId) {
          return {
            ...s,
            items: s.items.map((i) => (i.id === itemId ? { ...i, [field]: value } : i)),
          };
        }
        return s;
      })
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-100 text-cyan-800 text-[11px] font-extrabold uppercase tracking-wider mb-2 border border-cyan-200">
            <ImageIcon className="size-3 text-cyan-600" />
            <span>Visual Archives Manager</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Gallery Albums &amp; Direct Image Links
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Add online image URLs (Google Drive, Discord, Cloudinary, Imgur, any web link) without consuming local database storage.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={addSection}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-full border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="size-4 text-cyan-600" />
            <span>New Album</span>
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-1.5 px-6 py-2.5 rounded-full text-xs font-bold text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 shadow-md shadow-cyan-600/25 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer disabled:opacity-50"
          >
            {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
            <span>Save All Changes</span>
          </button>
        </div>
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

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-400">
          <Loader2 className="size-8 animate-spin text-cyan-600" />
          <span className="text-xs font-bold">Loading albums &amp; media assets...</span>
        </div>
      ) : sections.length === 0 ? (
        <div className="py-16 text-center rounded-3xl bg-white/50 border border-slate-200/60 text-slate-500 text-sm">
          No albums created yet. Click "+ New Album" to start publishing media.
        </div>
      ) : (
        <div className="space-y-8">
          {sections.map((sec) => (
            <div
              key={sec.id}
              className="glass-card rounded-3xl p-6 sm:p-8 border border-white/80 space-y-6 shadow-sm"
            >
              {/* Album Header Controls */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div className="flex-1 max-w-md">
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-400 mb-1">
                    Album Category Title
                  </label>
                  <input
                    type="text"
                    value={sec.name}
                    onChange={(e) =>
                      setSections(
                        sections.map((s) => (s.id === sec.id ? { ...s, name: e.target.value } : s))
                      )
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm font-bold focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => addItemToSection(sec.id)}
                    className="flex items-center gap-1 px-3.5 py-1.5 rounded-full bg-cyan-50 border border-cyan-200 text-cyan-800 text-xs font-bold hover:bg-cyan-100 transition-colors"
                  >
                    <Plus className="size-3.5 text-cyan-600" />
                    <span>Add Photo Link</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => removeSection(sec.id)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-red-50 border border-red-200 text-red-700 text-xs font-bold hover:bg-red-100 transition-colors"
                  >
                    <Trash2 className="size-3.5" />
                    <span>Delete Album</span>
                  </button>
                </div>
              </div>

              {/* Items in Album */}
              {sec.items.length === 0 ? (
                <div className="py-8 text-center rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-slate-400 text-xs">
                  No images in this album. Click "Add Photo Link" above.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {sec.items.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 rounded-2xl border border-slate-200 bg-white/80 shadow-xs flex gap-4 items-start relative group"
                    >
                      {/* Image Thumbnail Preview */}
                      <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-100 shrink-0 relative border border-slate-200">
                        <img
                          src={normalizeImageUrl(item.url, "/images/rectangle-899.png")}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Fields */}
                      <div className="flex-1 space-y-2">
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) => updateItem(sec.id, item.id, "name", e.target.value)}
                          placeholder="Photo description / Caption"
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:border-cyan-500"
                        />
                        <div className="flex items-center gap-1.5">
                          <LinkIcon className="size-3.5 text-cyan-600 shrink-0" />
                          <input
                            type="text"
                            value={item.url}
                            onChange={(e) => updateItem(sec.id, item.id, "url", e.target.value)}
                            placeholder="Direct URL or Google Drive link..."
                            className="w-full px-2 py-1 rounded-lg border border-slate-200 text-[11px] font-mono text-slate-700 focus:outline-none focus:border-cyan-500"
                          />
                        </div>
                      </div>

                      {/* Delete Item Button */}
                      <button
                        type="button"
                        onClick={() => removeItem(sec.id, item.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="Remove Image"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
