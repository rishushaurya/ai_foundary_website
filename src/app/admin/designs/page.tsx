"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  Palette,
  Sparkles,
  Check,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ExternalLink,
  Eye,
  Layers,
  ArrowRight,
  Shield,
  RefreshCw,
} from "lucide-react";
import { normalizeImageUrl } from "@/lib/image-helper";

interface DesignCard {
  id: string;
  name: string;
  themeStyle: string;
  description: string;
  badge: string;
  thumbnail: string;
  previewColor: string;
  accentColor: string;
  author: string;
  version: string;
  isActive: boolean;
}

export default function AdminDesignsPage() {
  const [designs, setDesigns] = useState<DesignCard[]>([]);
  const [activeDesignId, setActiveDesignId] = useState<string>("ivory-light");
  const [loading, setLoading] = useState(true);
  const [switching, setSwitching] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchDesigns = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/design");
      if (!res.ok) throw new Error("Failed to load design registry");
      const data = await res.json();
      setDesigns(data.designs || []);
      setActiveDesignId(data.activeDesign || "ivory-light");
    } catch (err: any) {
      setNotice({ type: "error", text: err.message || "Error fetching designs" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDesigns();
  }, []);

  const handleActivateDesign = async (designId: string) => {
    if (designId === activeDesignId) return;

    setSwitching(designId);
    setNotice(null);

    try {
      const res = await fetch("/api/admin/design", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activeDesign: designId }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to switch design");

      setActiveDesignId(designId);
      setDesigns((prev) =>
        prev.map((d) => ({
          ...d,
          isActive: d.id === designId,
        }))
      );

      setNotice({
        type: "success",
        text: `Live visual theme successfully switched to '${data.meta?.name || designId}'. All visitors will now see this design immediately.`,
      });
    } catch (err: any) {
      setNotice({ type: "error", text: err.message || "Failed to activate design" });
    } finally {
      setSwitching(null);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Header Card */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 space-y-4 border border-white/80 shadow-sm relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-50 border border-cyan-200 text-cyan-800 text-xs font-bold">
              <Palette className="size-3.5 text-cyan-600" />
              <span>Multi-Design Engine</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Website UI Design Switcher
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
              Switch the complete look and feel of the public website in 1-click. All your events, team members,
              gallery moments, and CMS content are preserved with 100% fidelity.
            </p>
          </div>

          <button
            type="button"
            onClick={fetchDesigns}
            disabled={loading}
            className="self-start sm:self-auto flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all cursor-pointer shadow-xs disabled:opacity-50"
          >
            <RefreshCw className={`size-3.5 ${loading ? "animate-spin text-cyan-600" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>

        {notice && (
          <div
            className={`p-4 rounded-2xl text-xs flex items-center gap-3 animate-in fade-in duration-200 ${
              notice.type === "success"
                ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
                : "bg-red-50 border border-red-200 text-red-800"
            }`}
          >
            {notice.type === "success" ? (
              <CheckCircle2 className="size-4 text-emerald-600 flex-shrink-0" />
            ) : (
              <AlertCircle className="size-4 text-red-600 flex-shrink-0" />
            )}
            <span className="leading-relaxed font-medium">{notice.text}</span>
          </div>
        )}
      </div>

      {/* Loading Skeleton */}
      {loading && designs.length === 0 ? (
        <div className="p-16 text-center glass-card rounded-3xl border border-white/80 space-y-3">
          <Loader2 className="size-8 animate-spin text-cyan-600 mx-auto" />
          <p className="text-xs font-bold text-slate-500">Querying registered UI design engines...</p>
        </div>
      ) : (
        /* Designs Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {designs.map((design) => {
            const isCurrentlyActive = design.id === activeDesignId;
            const isBusy = switching === design.id;

            return (
              <div
                key={design.id}
                className={`glass-card rounded-3xl p-6 sm:p-7 flex flex-col justify-between space-y-6 transition-all duration-300 relative overflow-hidden ${
                  isCurrentlyActive
                    ? "ring-2 ring-cyan-500/80 shadow-lg shadow-cyan-500/10 bg-gradient-to-b from-white/95 to-cyan-50/30"
                    : "border border-white/80 hover:border-slate-300 hover:shadow-md"
                }`}
              >
                {/* Active Indicator Top Badge */}
                {isCurrentlyActive && (
                  <div className="absolute top-4 right-4 z-10 flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500 text-white text-[11px] font-extrabold uppercase tracking-wider shadow-md shadow-emerald-500/30">
                    <Check className="size-3.5 stroke-[3]" />
                    <span>Live Active</span>
                  </div>
                )}

                <div className="space-y-4">
                  {/* Thumbnail Banner */}
                  <div className="relative h-48 sm:h-52 w-full rounded-2xl overflow-hidden bg-slate-900 border border-slate-200 shadow-inner group">
                    <Image
                      src={normalizeImageUrl(design.thumbnail || "/images/architectural-bg.jpg")}
                      alt={design.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      unoptimized
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                    {/* Badge & Version */}
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs font-mono">
                      <span className="px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md border border-white/20 font-bold">
                        {design.badge}
                      </span>
                      <span className="text-[11px] text-slate-300">v{design.version}</span>
                    </div>
                  </div>

                  {/* Design Title & Theme Info */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div
                        className="size-3.5 rounded-full border border-slate-300 flex-shrink-0"
                        style={{ backgroundColor: design.accentColor }}
                      />
                      <h2 className="text-lg font-black text-slate-900 tracking-tight">
                        {design.name}
                      </h2>
                    </div>

                    <p className="text-xs font-bold text-cyan-700 font-mono">
                      {design.themeStyle}
                    </p>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      {design.description}
                    </p>
                  </div>
                </div>

                {/* Action: 1-Click Activate Live */}
                <div className="pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    disabled={isCurrentlyActive || isBusy}
                    onClick={() => handleActivateDesign(design.id)}
                    className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-xs disabled:cursor-not-allowed ${
                      isCurrentlyActive
                        ? "bg-emerald-100 text-emerald-800 border border-emerald-300 opacity-90"
                        : "bg-gradient-to-r from-cyan-600 to-blue-600 text-white hover:opacity-95 hover:shadow-md active:scale-98"
                    }`}
                  >
                    {isBusy ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : isCurrentlyActive ? (
                      <CheckCircle2 className="size-4 text-emerald-600" />
                    ) : (
                      <Sparkles className="size-4 text-cyan-200" />
                    )}
                    <span>{isCurrentlyActive ? "Currently Live Active Theme" : "Activate This Design (1-Click)"}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Preservation & Integrity Notice */}
      <div className="glass-card rounded-3xl p-6 border border-white/80 space-y-3 bg-gradient-to-r from-slate-50 to-white text-xs text-slate-600 leading-relaxed shadow-sm">
        <div className="flex items-center gap-2 text-slate-900 font-extrabold text-sm">
          <Shield className="size-4 text-cyan-600" />
          <span>Zero-Data-Disruption Guarantee</span>
        </div>
        <p>
          Switching designs changes <strong>visual styling and component layout only</strong>. All data stored in
          the system (events, team members, faculty advisory profiles, gallery albums, recruitment submissions, and
          CMS text customizations) remains permanently connected and synchronized across every design.
        </p>
        <p className="font-mono text-[11px] text-cyan-700">
          • The Recruitment portal (`/recruit`) remains frozen in its dedicated high-conversion layout.
        </p>
      </div>
    </div>
  );
}
