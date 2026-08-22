"use client";

import React, { useState } from "react";
import { GallerySection, GalleryItem } from "@/lib/data";
import { normalizeImageUrl } from "@/lib/image-helper";
import { Sparkles, Image as ImageIcon, X, Play, Eye } from "lucide-react";

interface NewGalleryViewProps {
  sections: GallerySection[];
}

export function NewGalleryView({ sections }: NewGalleryViewProps) {
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [lightboxItem, setLightboxItem] = useState<{
    url: string;
    name: string;
    type: "image" | "video";
    albumName?: string;
  } | null>(null);

  // Pure database sync: Collect active photos from database
  const allItems = sections.flatMap((sec) =>
    (sec.items || []).map((item) => ({
      ...item,
      albumName: sec.name,
    }))
  );

  const categories = [
    "All",
    ...Array.from(new Set(sections.map((s) => s.name).filter(Boolean))),
  ];

  const filteredSections =
    activeCategory === "All"
      ? sections.filter((s) => (s.items || []).length > 0)
      : sections.filter((s) => s.name === activeCategory && (s.items || []).length > 0);

  return (
    <div className="w-full">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-36 sm:pt-44 pb-20 space-y-16">
        {/* ===== HERO SECTION ===== */}
        <section className="flex flex-col items-center text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-100/90 text-cyan-900 text-xs font-black uppercase tracking-wider border border-cyan-200 shadow-xs">
            <Sparkles className="size-3.5 text-cyan-700" />
            <span>Visual Archives</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-slate-900 font-['Hanken_Grotesk']">
            Visual Archives
          </h1>

          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto font-medium leading-relaxed">
            A visual chronicle of breakthrough moments, rapid hackathons, high-impact keynotes, and student prototypes forged at DSU.
          </p>
        </section>

        {/* ===== MARQUEE AUTO-SCROLLER (SHOWN ONLY IF DATABASE HAS MEDIA) ===== */}
        {allItems.length > 0 && (
          <section className="overflow-hidden py-4 -mx-4 sm:-mx-6 lg:-mx-8">
            <div className="flex animate-marquee gap-6 w-max hover:[animation-play-state:paused]">
              {[...allItems, ...allItems].map((item, idx) => (
                <div
                  key={`${item.id}-${idx}`}
                  onClick={() =>
                    setLightboxItem({
                      url: item.url,
                      name: item.name,
                      type: item.type as "image" | "video",
                      albumName: item.albumName,
                    })
                  }
                  className="w-72 h-44 rounded-2xl overflow-hidden glass-card relative group shrink-0 cursor-pointer border border-white/80"
                >
                  <img
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    src={normalizeImageUrl(item.url, "/images/rectangle-899.png")}
                    alt={item.name}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                    <span className="text-[10px] font-black uppercase tracking-wider text-cyan-400 font-mono">
                      {item.albumName || "AI Foundry"}
                    </span>
                    <span className="text-xs font-bold text-white line-clamp-1">
                      {item.name}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ===== CATEGORIZED ALBUMS & MEDIA GRID ===== */}
        <section className="space-y-8">
          {/* Category Filter Chips */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
            <div className="flex items-center gap-2">
              <ImageIcon className="size-5 text-cyan-600" />
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Categorized Archives
              </h2>
            </div>

            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 rounded-full text-xs font-black transition-all cursor-pointer ${
                    activeCategory === cat
                      ? "bg-slate-900 text-white shadow-md"
                      : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Album Grids */}
          {filteredSections.length === 0 ? (
            <div className="py-20 text-center rounded-3xl bg-white/70 border border-slate-200/80 p-8 shadow-xs">
              <ImageIcon className="size-12 mx-auto text-slate-300 mb-3" />
              <h3 className="text-base font-extrabold text-slate-800">No media uploaded yet</h3>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Photographs and recordings will appear here as soon as they are published by administrators.
              </p>
            </div>
          ) : (
            <div className="space-y-14">
              {filteredSections.map((sec) => (
                <div key={sec.id} className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-black text-slate-900 flex items-center gap-2.5">
                      <span>{sec.name}</span>
                      <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2.5 py-0.5 rounded-full">
                        {sec.items.length} {sec.items.length === 1 ? "Item" : "Items"}
                      </span>
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
                    {sec.items.map((item) => (
                      <div
                        key={item.id}
                        onClick={() =>
                          setLightboxItem({
                            url: item.url,
                            name: item.name,
                            type: item.type as "image" | "video",
                            albumName: sec.name,
                          })
                        }
                        className="glass-card rounded-3xl overflow-hidden group cursor-pointer border border-white/90 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl bg-white/80"
                      >
                        <div className="h-56 w-full relative overflow-hidden bg-slate-900">
                          <img
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            src={normalizeImageUrl(item.url, "/images/rectangle-899.png")}
                            alt={item.name}
                          />
                          <div className="absolute inset-0 bg-black/35 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="p-3 rounded-full bg-white text-slate-900 shadow-xl">
                              <Eye className="size-5" />
                            </span>
                          </div>
                          <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-black/70 backdrop-blur-md text-[10px] font-black uppercase tracking-wider text-cyan-300 font-mono">
                            {item.type}
                          </div>
                        </div>

                        <div className="p-5 flex items-center justify-between">
                          <div>
                            <h4 className="text-sm font-extrabold text-slate-900 line-clamp-1">
                              {item.name || "Event Photograph"}
                            </h4>
                            <span className="text-xs font-bold text-slate-500">{sec.name}</span>
                          </div>
                          <span className="text-[11px] font-black text-cyan-700 uppercase font-mono">
                            DSU Campus
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* ===== FULL-SCREEN MEDIA LIGHTBOX MODAL ===== */}
      {lightboxItem && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center p-4 sm:p-8 animate-in fade-in duration-200">
          <button
            onClick={() => setLightboxItem(null)}
            className="absolute top-6 right-6 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors z-50 cursor-pointer"
            aria-label="Close Lightbox"
          >
            <X className="size-6" />
          </button>

          <div className="max-w-5xl w-full max-h-[85vh] flex flex-col items-center">
            {lightboxItem.type === "video" ? (
              <video
                src={lightboxItem.url}
                controls
                autoPlay
                className="max-w-full max-h-[75vh] rounded-2xl shadow-2xl object-contain"
              />
            ) : (
              <img
                src={normalizeImageUrl(lightboxItem.url, "/images/rectangle-899.png")}
                alt={lightboxItem.name}
                className="max-w-full max-h-[75vh] rounded-2xl shadow-2xl object-contain"
              />
            )}

            <div className="mt-4 text-center text-white">
              <h3 className="text-base sm:text-lg font-black">{lightboxItem.name}</h3>
              <p className="text-xs text-slate-300 font-bold mt-0.5">
                {lightboxItem.albumName} • AI Foundry Visual Archives
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
