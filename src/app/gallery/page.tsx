import React from "react";
import { getGallerySections } from "@/lib/data";
import { Sparkles, Image as ImageIcon } from "lucide-react";

export const metadata = {
  title: "Gallery & Moments | AI Foundry - Dayananda Sagar University",
  description: "Visual journey through AI Foundry hackathons, orientation symposiums, and robotics workshops at DSU.",
};

export default async function GalleryPage() {
  const sections = await getGallerySections();

  return (
    <main className="subpage-container subpage-bg font-mono text-white">
      <div className="subpage-inner">
        {/* Header */}
        <section className="text-center space-y-4 max-w-3xl mx-auto w-full">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-cyan-500/40 bg-cyan-950/60 text-cyan-300 text-xs font-bold uppercase tracking-widest shadow-sm backdrop-blur-md">
            <Sparkles className="size-3.5 text-cyan-400" />
            <span>Visual Archives</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white">
            PHOTO &amp; MEDIA GALLERY
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 normal-case leading-relaxed font-sans">
            Explore breakthrough moments, late-night hackathon sprints, faculty keynotes, and student prototypes.
          </p>
        </section>

        {/* Album Sections */}
        {sections.length === 0 ? (
          <div className="text-center py-16 px-4 rounded-3xl border border-dashed border-white/20 bg-black/40 backdrop-blur-xl text-slate-400 text-xs w-full">
            No gallery albums published yet.
          </div>
        ) : (
          <div className="space-y-12 w-full">
            {sections.map((sec) => (
              <div key={sec.id} className="space-y-6">
                <div className="flex items-center gap-3 border-b border-white/10 pb-3">
                  <ImageIcon className="size-5 text-cyan-400" />
                  <h2 className="text-lg font-bold uppercase tracking-wider text-white">
                    {sec.name}
                  </h2>
                  <span className="text-xs text-slate-400 font-sans">
                    ({sec.items.length} {sec.items.length === 1 ? "Item" : "Items"})
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {sec.items.map((item) => (
                    <div
                      key={item.id}
                      className="group relative rounded-3xl border border-white/15 bg-black/40 backdrop-blur-xl overflow-hidden shadow-2xl hover:border-cyan-400/50 transition-all duration-300 hover:-translate-y-1"
                    >
                      <div className="h-48 bg-black/50 flex flex-col items-center justify-center p-4 text-center border-b border-white/10 group-hover:bg-cyan-950/20 transition-colors">
                        <ImageIcon className="size-10 text-cyan-400 mb-2 opacity-80 group-hover:scale-110 transition-transform" />
                        <span className="text-xs font-bold text-white uppercase tracking-wide">
                          {item.name || "Event Photograph"}
                        </span>
                      </div>
                      <div className="p-4 flex items-center justify-between text-[11px] text-slate-400">
                        <span className="uppercase font-bold text-cyan-300">{item.type}</span>
                        <span className="text-slate-500">DSU Campus</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
