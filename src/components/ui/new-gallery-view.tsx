"use client";

import React, { useState, useEffect, useMemo } from "react";
import { GallerySection, GalleryItem } from "@/lib/data";
import { normalizeImageUrl } from "@/lib/image-helper";
import {
  Sparkles,
  Image as ImageIcon,
  X,
  Play,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  Download,
  Info,
} from "lucide-react";

interface NewGalleryViewProps {
  sections: GallerySection[];
}

interface FlatGalleryItem extends GalleryItem {
  albumName: string;
  albumId: string;
}

export function NewGalleryView({ sections = [] }: NewGalleryViewProps) {
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Flatten all items with album metadata
  const allItems: FlatGalleryItem[] = useMemo(() => {
    return sections.flatMap((sec) =>
      (sec.items || []).map((item) => ({
        ...item,
        albumName: sec.name,
        albumId: sec.id,
      }))
    );
  }, [sections]);

  // Categories list
  const categories = useMemo(() => {
    return [
      "All",
      ...Array.from(new Set(sections.map((s) => s.name).filter(Boolean))),
    ];
  }, [sections]);

  // Filtered items based on active category
  const filteredItems = useMemo(() => {
    if (activeCategory === "All") return allItems;
    return allItems.filter((item) => item.albumName === activeCategory);
  }, [allItems, activeCategory]);

  // Keyboard navigation for Lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lightboxIndex === null) return;
      if (e.key === "Escape") setLightboxIndex(null);
      if (e.key === "ArrowRight") {
        setLightboxIndex((prev) =>
          prev !== null ? (prev + 1) % filteredItems.length : null
        );
      }
      if (e.key === "ArrowLeft") {
        setLightboxIndex((prev) =>
          prev !== null ? (prev - 1 + filteredItems.length) % filteredItems.length : null
        );
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxIndex, filteredItems.length]);

  const activeLightboxItem = lightboxIndex !== null ? filteredItems[lightboxIndex] : null;

  return (
    <div className="w-full bg-[#FFFFE9] text-[#2D2E2A] selection:bg-[#ECFF17] selection:text-[#000000]">
      <main className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-16 pt-32 sm:pt-40 pb-24 space-y-16">
        {/* ===== HERO MASTHEAD ===== */}
        <section className="flex flex-col items-start space-y-4 border-b border-[#C6CCBD]/70 pb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ECFF17]/30 border border-[#2D2E2A]/15 text-[#2D2E2A] text-[11px] font-jetbrains font-bold uppercase tracking-wider">
            <Sparkles className="size-3 text-[#2D2E2A]" />
            <span>DAYANANDA SAGAR UNIVERSITY • RAISE AI CLUB</span>
          </div>

          <h1 className="font-libre text-5xl sm:text-7xl lg:text-8xl font-normal tracking-tight text-[#2D2E2A] leading-none select-none">
            Visual Archives
          </h1>

          <p className="font-inter text-base sm:text-xl text-[#5E6059] max-w-3xl font-normal leading-relaxed">
            A visual chronicle of breakthrough moments, rapid hackathons, high-impact keynotes, and student prototypes forged at DSU.
          </p>

          {/* Quick Metrics */}
          <div className="flex items-center gap-6 pt-4 text-xs font-jetbrains text-[#5E6059]">
            <span>
              <strong className="text-[#2D2E2A] font-bold">{sections.length}</strong> Albums
            </span>
            <span className="text-[#C6CCBD]">•</span>
            <span>
              <strong className="text-[#2D2E2A] font-bold">{allItems.length}</strong> Media Archives
            </span>
          </div>
        </section>

        {/* ===== CONTINUOUS MARQUEE SPOTLIGHT STRIP ===== */}
        {allItems.length > 0 && (
          <section className="overflow-hidden py-2 -mx-6 sm:-mx-12 lg:-mx-16 border-y border-[#C6CCBD]/50 bg-white/40">
            <div className="flex animate-marquee gap-6 w-max hover:[animation-play-state:paused] py-3">
              {[...allItems, ...allItems].map((item, idx) => (
                <div
                  key={`${item.id}-${idx}`}
                  onClick={() => {
                    const originalIdx = filteredItems.findIndex((fi) => fi.id === item.id);
                    if (originalIdx !== -1) setLightboxIndex(originalIdx);
                    else setLightboxIndex(0);
                  }}
                  className="w-72 h-44 rounded-2xl overflow-hidden border border-[#C6CCBD] relative group shrink-0 cursor-pointer bg-[#2D2E2A] shadow-xs hover:shadow-md transition-all"
                >
                  <img
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    src={normalizeImageUrl(item.url, "/images/rectangle-899.png")}
                    alt={item.name}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                    <span className="text-[10px] font-jetbrains font-bold uppercase tracking-wider text-[#ECFF17]">
                      {item.albumName}
                    </span>
                    <span className="text-xs font-inter font-bold text-white line-clamp-1">
                      {item.name}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ===== ALBUM CATEGORY FILTER PILLS ===== */}
        <section className="flex flex-wrap items-center gap-2">
          {categories.map((cat) => {
            const count = cat === "All" ? allItems.length : allItems.filter((i) => i.albumName === cat).length;
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs font-jetbrains uppercase tracking-wider font-semibold transition-all cursor-pointer flex items-center gap-2 ${
                  isActive
                    ? "bg-[#2D2E2A] text-[#FFFFE9] shadow-sm"
                    : "bg-white/80 text-[#5E6059] hover:text-[#2D2E2A] hover:bg-white border border-[#C6CCBD]/60"
                }`}
              >
                <span>{cat}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                    isActive
                      ? "bg-[#ECFF17] text-black font-bold"
                      : "bg-[#2D2E2A]/5 text-[#5E6059]"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </section>

        {/* ===== MEDIA MASONRY / GRID ===== */}
        {filteredItems.length === 0 ? (
          <div className="rounded-3xl border border-[#C6CCBD] bg-white/60 p-16 text-center space-y-3">
            <Info className="size-8 text-[#7A836F] mx-auto" />
            <h2 className="font-libre text-2xl font-bold text-[#2D2E2A]">No Media Found in This Album</h2>
            <p className="font-inter text-sm text-[#5E6059] max-w-md mx-auto">
              Upload photographs or video highlights from the Admin CMS to populate this gallery album.
            </p>
            <button
              onClick={() => setActiveCategory("All")}
              className="mt-2 px-5 py-2 rounded-full bg-[#2D2E2A] text-[#FFFFE9] text-xs font-jetbrains font-bold uppercase tracking-wider hover:bg-black transition-all"
            >
              View All Photos
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredItems.map((item, idx) => {
              const isVideo = item.type === "video";
              return (
                <div
                  key={item.id}
                  onClick={() => setLightboxIndex(idx)}
                  className="group relative rounded-3xl border border-[#C6CCBD] bg-white/80 overflow-hidden cursor-pointer shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
                >
                  {/* Photo / Video Thumbnail Container */}
                  <div className="relative w-full h-64 overflow-hidden bg-[#2D2E2A]">
                    <img
                      src={normalizeImageUrl(item.url, "/images/rectangle-899.png")}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10 opacity-0 group-hover:opacity-100 transition-opacity" />

                    {/* Top Badges */}
                    <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
                      <span className="px-3 py-1 rounded-full text-[10px] font-jetbrains font-bold uppercase tracking-wider bg-white/90 backdrop-blur-md text-[#2D2E2A] border border-[#C6CCBD] shadow-xs">
                        {item.albumName}
                      </span>

                      {isVideo && (
                        <span className="size-8 rounded-full bg-[#ECFF17] text-black flex items-center justify-center shadow-md">
                          <Play className="size-3.5 fill-current" />
                        </span>
                      )}
                    </div>

                    {/* Hover Zoom Icon Indicator */}
                    <div className="absolute bottom-4 right-4 size-9 rounded-full bg-white/90 backdrop-blur-md border border-[#C6CCBD] text-[#2D2E2A] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm">
                      <ZoomIn className="size-4" />
                    </div>
                  </div>

                  {/* Caption / Title */}
                  <div className="p-5 border-t border-[#C6CCBD]/40 flex items-center justify-between gap-3">
                    <p className="font-libre text-base font-bold text-[#2D2E2A] line-clamp-1 group-hover:text-black">
                      {item.name}
                    </p>
                    <span className="font-jetbrains text-[10px] uppercase text-[#7A836F] shrink-0">
                      {isVideo ? "VIDEO" : "PHOTO"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* ===== FULLSCREEN INTERACTIVE LIGHTBOX ===== */}
      {activeLightboxItem && lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-[100000] bg-black/90 backdrop-blur-md flex flex-col justify-between p-4 sm:p-8 animate-in fade-in duration-200"
          onClick={() => setLightboxIndex(null)}
        >
          {/* Top Bar */}
          <div className="flex items-center justify-between text-white z-10">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full bg-[#ECFF17] text-black font-jetbrains text-xs font-bold uppercase tracking-wider">
                {activeLightboxItem.albumName}
              </span>
              <span className="font-jetbrains text-xs text-white/60">
                {lightboxIndex + 1} / {filteredItems.length}
              </span>
            </div>

            <button
              onClick={() => setLightboxIndex(null)}
              className="size-10 rounded-full bg-white/10 border border-white/20 text-white flex items-center justify-center hover:bg-[#ECFF17] hover:text-black transition-colors cursor-pointer"
            >
              <X className="size-5" />
            </button>
          </div>

          {/* Center Image / Video Viewer with Next/Prev Controls */}
          <div
            className="relative flex-1 flex items-center justify-center my-4 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Previous Button */}
            <button
              onClick={() =>
                setLightboxIndex(
                  (lightboxIndex - 1 + filteredItems.length) % filteredItems.length
                )
              }
              className="absolute left-2 sm:left-6 z-20 size-12 rounded-full bg-black/60 border border-white/20 text-white flex items-center justify-center hover:bg-[#ECFF17] hover:text-black transition-colors cursor-pointer shadow-lg"
              title="Previous photo"
            >
              <ChevronLeft className="size-6" />
            </button>

            {/* Main Media */}
            <div className="max-w-4xl max-h-[75vh] flex items-center justify-center">
              {activeLightboxItem.type === "video" ? (
                <video
                  src={activeLightboxItem.url}
                  controls
                  autoPlay
                  className="max-h-[75vh] max-w-full rounded-2xl border border-white/20 shadow-2xl"
                />
              ) : (
                <img
                  src={normalizeImageUrl(activeLightboxItem.url, "/images/rectangle-899.png")}
                  alt={activeLightboxItem.name}
                  className="max-h-[75vh] max-w-full object-contain rounded-2xl border border-white/20 shadow-2xl"
                />
              )}
            </div>

            {/* Next Button */}
            <button
              onClick={() =>
                setLightboxIndex((lightboxIndex + 1) % filteredItems.length)
              }
              className="absolute right-2 sm:right-6 z-20 size-12 rounded-full bg-black/60 border border-white/20 text-white flex items-center justify-center hover:bg-[#ECFF17] hover:text-black transition-colors cursor-pointer shadow-lg"
              title="Next photo"
            >
              <ChevronRight className="size-6" />
            </button>
          </div>

          {/* Bottom Caption Bar */}
          <div
            className="flex flex-col sm:flex-row items-center justify-between gap-4 text-white z-10 border-t border-white/10 pt-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center sm:text-left">
              <h3 className="font-libre text-lg font-bold text-white">
                {activeLightboxItem.name}
              </h3>
              <p className="font-jetbrains text-xs text-white/50">
                DSU AI Foundry • {activeLightboxItem.albumName}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <a
                href={activeLightboxItem.url}
                target="_blank"
                rel="noreferrer"
                download
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-xs font-jetbrains text-white hover:bg-white hover:text-black transition-colors"
              >
                <Download className="size-3.5" />
                <span>Download / Open Original</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
