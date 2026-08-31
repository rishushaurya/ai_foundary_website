"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import { GalleryViewProps } from "../types";

export function WixBoldGalleryView({ sections = [] }: GalleryViewProps) {
  const [selectedImage, setSelectedImage] = useState<{ src: string; title: string; caption?: string } | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("All");

  // Dynamic categories strictly matching album names configured in the admin panel
  const categories = useMemo(() => {
    if (!sections || sections.length === 0) return ["All"];
    const albumNames = sections.map((s) => s.name).filter(Boolean);
    return ["All", ...Array.from(new Set(albumNames))];
  }, [sections]);

  // Flatten all items from CMS sections
  const allMediaItems = useMemo(() => {
    if (!sections || sections.length === 0) {
      return [
        {
          id: "img-1",
          title: "Inaugural Ceremony & Team",
          albumName: "Inaugural ceremony and teams",
          coverImage: "/images/rectangle-898.png",
          caption: "Ceremonial addresses, keynote panels, and research posters.",
        },
        {
          id: "img-2",
          title: "Campus Compute Hall",
          albumName: "Inaugural ceremony and teams",
          coverImage: "/images/rectangle-5.png",
          caption: "High performance AI builds and team launches.",
        },
      ];
    }

    const items: { id: string; title: string; albumName: string; coverImage: string; caption?: string }[] = [];

    sections.forEach((sec) => {
      if (sec.items && sec.items.length > 0) {
        sec.items.forEach((it) => {
          items.push({
            id: it.id,
            title: it.name || sec.name,
            albumName: sec.name,
            coverImage: it.url,
            caption: sec.name,
          });
        });
      } else {
        items.push({
          id: sec.id,
          title: sec.name,
          albumName: sec.name,
          coverImage: "/images/rectangle-5.png",
          caption: sec.name,
        });
      }
    });

    return items;
  }, [sections]);

  const filteredItems = useMemo(() => {
    if (activeCategory === "All") return allMediaItems;
    return allMediaItems.filter((a) => a.albumName === activeCategory);
  }, [allMediaItems, activeCategory]);

  return (
    <div className="min-h-screen bg-[#FFFFE9] text-[#2D2E2A] selection:bg-[#2D2E2A] selection:text-[#FFFFE9] py-12 sm:py-20 font-sans">
      <div className="max-w-5xl mx-auto px-6 sm:px-8 space-y-12 sm:space-y-16">
        {/* Header Masthead */}
        <div className="space-y-4 max-w-2xl">
          <h1 className="text-3xl sm:text-5xl font-serif italic text-[#2D2E2A]">
            Visual Archives
          </h1>
          <p className="text-xs sm:text-sm text-[#2D2E2A] leading-relaxed font-normal">
            A visual chronicle of breakthrough moments, rapid hackathons, high-impact
            keynotes, and student prototypes forged at DSU.
          </p>

          {/* Dynamic Category Selector Pills from Admin Album Names */}
          {categories.length > 1 && (
            <div className="flex flex-wrap gap-2 pt-4">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-1.5 rounded-full text-xs font-medium uppercase tracking-wider transition-all cursor-pointer ${
                    activeCategory === cat
                      ? "bg-[#2D2E2A] text-[#FFFFE9]"
                      : "bg-[#C6CCBD]/40 text-[#2D2E2A] hover:bg-[#C6CCBD]"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Gallery Showcase Grid with Framed Cards */}
        {filteredItems.length === 0 ? (
          <div className="py-16 text-center rounded-3xl bg-[#C6CCBD]/20 border border-[#2D2E2A]/10 text-[#424440] text-sm">
            No photographs found in this album.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <div
                key={item.id || item.title}
                onClick={() =>
                  setSelectedImage({
                    src: item.coverImage,
                    title: item.title,
                    caption: item.caption,
                  })
                }
                className="group cursor-pointer bg-[#C6CCBD]/40 rounded-2xl p-4 border border-[#2D2E2A]/20 hover:border-[#2D2E2A] transition-all flex flex-col justify-between space-y-3 shadow-sm hover:shadow-md"
              >
                {/* Photo Frame Container */}
                <div className="w-full h-52 sm:h-56 relative rounded-xl overflow-hidden bg-[#C6CCBD] border border-[#2D2E2A]/10">
                  <Image
                    src={item.coverImage}
                    alt={item.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold tracking-widest uppercase text-[#424440] truncate max-w-[180px]">
                      {item.albumName}
                    </span>
                    <span className="text-[11px] text-[#666864] font-mono font-medium">
                      [ ZOOM ↗ ]
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-[#2D2E2A] mt-1 group-hover:underline truncate">
                    {item.title}
                  </h3>
                  {item.caption && (
                    <p className="text-xs text-[#424440] mt-1 line-clamp-2">
                      {item.caption}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Fullscreen Interactive Lightbox Modal */}
      {selectedImage && (
        <div
          onClick={() => setSelectedImage(null)}
          className="fixed inset-0 z-50 bg-[#2D2E2A]/90 backdrop-blur-sm flex items-center justify-center p-4 sm:p-8 animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[#FFFFE9] text-[#2D2E2A] max-w-3xl w-full rounded-2xl overflow-hidden shadow-2xl border border-[#2D2E2A]/20"
          >
            <div className="relative w-full h-80 sm:h-[480px] bg-black">
              <Image
                src={selectedImage.src}
                alt={selectedImage.title}
                fill
                className="object-contain"
              />
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-4 right-4 bg-black/60 hover:bg-black text-white w-9 h-9 rounded-full flex items-center justify-center font-bold transition-colors cursor-pointer"
                aria-label="Close Lightbox"
              >
                ✕
              </button>
            </div>
            <div className="p-6 space-y-2">
              <h3 className="text-base font-semibold text-[#2D2E2A]">
                {selectedImage.title}
              </h3>
              {selectedImage.caption && (
                <p className="text-xs text-[#424440]">
                  {selectedImage.caption}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
