"use client";

import React, { useState, useEffect } from "react";
import { GallerySection } from "@/lib/data";
import { Plus, Trash2, Save, Loader2, CheckCircle, AlertCircle, Image as ImageIcon } from "lucide-react";

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
      setNotice({ type: "success", text: "Gallery albums updated successfully" });
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
        name: "New Event Photo Album",
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
                url: "/images/rectangle-899.png",
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

  return (
    <div className="space-y-6 font-mono text-white">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h1 className="text-xl font-black uppercase tracking-wider text-white">
            GALLERY &amp; MEDIA ALBUMS
          </h1>
          <p className="text-xs text-slate-400 normal-case font-sans">
            Manage photo albums and event highlights.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={addSection}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-white/20 text-xs font-bold text-slate-300 bg-white/5 hover:bg-white/15 hover:border-cyan-400/50 shadow-sm cursor-pointer transition-all"
          >
            <Plus className="size-3.5 text-cyan-400" />
            <span>Add Album</span>
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-1.5 px-6 py-2 rounded-full font-bold text-xs uppercase tracking-wider text-black bg-cyan-400 hover:bg-cyan-300 shadow-[0_0_15px_rgba(0,210,255,0.4)] cursor-pointer disabled:opacity-50 transition-all hover:scale-105"
          >
            {saving ? <Loader2 className="size-3.5 animate-spin" /> : <Save className="size-3.5" />}
            <span>Save Albums</span>
          </button>
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

      {/* Section List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-32 rounded-3xl border border-white/10 bg-black/40 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {sections.map((sec, secIdx) => (
            <div
              key={sec.id}
              className="p-6 sm:p-8 rounded-3xl border border-white/15 bg-black/40 backdrop-blur-xl shadow-xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <input
                  type="text"
                  value={sec.name}
                  onChange={(e) => {
                    const updated = [...sections];
                    updated[secIdx].name = e.target.value;
                    setSections(updated);
                  }}
                  className="font-bold text-sm text-white uppercase bg-transparent focus:outline-none border-b border-transparent focus:border-cyan-400"
                />
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => addItemToSection(sec.id)}
                    className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="size-3" />
                    <span>Add Photo</span>
                  </button>
                  <button
                    onClick={() => removeSection(sec.id)}
                    className="text-red-400 hover:text-red-300 p-1 cursor-pointer"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>

              {/* Items */}
              {sec.items.length === 0 ? (
                <div className="text-center py-6 text-slate-400 text-xs font-sans">
                  No photographs added to this album yet. Click &quot;Add Photo&quot; above.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {sec.items.map((item, itemIdx) => (
                    <div
                      key={item.id}
                      className="p-4 rounded-2xl border border-white/10 bg-white/5 space-y-2"
                    >
                      <div className="flex justify-between items-center">
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) => {
                            const updated = [...sections];
                            updated[secIdx].items[itemIdx].name = e.target.value;
                            setSections(updated);
                          }}
                          placeholder="Photo Caption"
                          className="w-full bg-transparent text-white font-bold text-xs focus:outline-none"
                        />
                        <button
                          onClick={() => removeItem(sec.id, item.id)}
                          className="text-red-400 hover:text-red-300 ml-2 cursor-pointer"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                      <input
                        type="text"
                        value={item.url}
                        onChange={(e) => {
                          const updated = [...sections];
                          updated[secIdx].items[itemIdx].url = e.target.value;
                          setSections(updated);
                        }}
                        placeholder="Image URL or /images path"
                        className="w-full px-3 py-1.5 rounded-xl bg-black/40 border border-white/20 text-[11px] text-white focus:outline-none focus:border-cyan-400 font-mono"
                      />
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
