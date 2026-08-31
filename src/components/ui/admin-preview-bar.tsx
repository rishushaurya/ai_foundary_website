"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, Check, Sparkles, X, Loader2 } from "lucide-react";

export interface AdminPreviewBarProps {
  designId: string;
  designName: string;
  isLive: boolean;
}

export function AdminPreviewBar({ designId, designName, isLive }: AdminPreviewBarProps) {
  const router = useRouter();
  const [activating, setActivating] = useState(false);
  const [activated, setActivated] = useState(isLive);

  const handleActivate = async () => {
    setActivating(true);
    try {
      const res = await fetch("/api/admin/design", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activeDesign: designId }),
      });
      if (!res.ok) throw new Error("Failed to activate design");
      setActivated(true);
      setTimeout(() => {
        // Remove preview query parameter to return to live site
        window.location.href = window.location.pathname;
      }, 600);
    } catch (err: any) {
      alert(err.message || "Failed to switch live design");
      setActivating(false);
    }
  };

  const handleExit = () => {
    window.location.href = window.location.pathname;
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] bg-[#050A14]/95 text-white border-b border-cyan-500/40 px-4 py-2 flex items-center justify-between shadow-[0_4px_20px_rgba(0,0,0,0.8)] backdrop-blur-xl">
      <div className="flex items-center gap-2.5 max-w-xl truncate">
        <div className="size-6 rounded-full bg-cyan-950 border border-cyan-500/50 flex items-center justify-center text-cyan-400 flex-shrink-0 animate-pulse">
          <Eye className="size-3.5" />
        </div>
        <div className="flex items-center gap-2 text-xs truncate">
          <span className="font-mono text-cyan-400 font-bold uppercase tracking-wider">
            Admin Preview:
          </span>
          <span className="font-bold text-white truncate">{designName}</span>
          {isLive && (
            <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-500/40 text-[10px] font-mono font-bold">
              CURRENT LIVE THEME
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {!isLive && !activated && (
          <button
            type="button"
            disabled={activating}
            onClick={handleActivate}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ECFF17] text-[#040812] text-xs font-black uppercase tracking-wider hover:scale-105 active:scale-95 transition-all shadow-md cursor-pointer disabled:opacity-50"
          >
            {activating ? (
              <Loader2 className="size-3 animate-spin" />
            ) : (
              <Sparkles className="size-3" />
            )}
            <span>Activate Live Now</span>
          </button>
        )}

        {activated && (
          <span className="flex items-center gap-1 text-xs text-emerald-400 font-bold font-mono">
            <Check className="size-3.5" />
            <span>Activated!</span>
          </span>
        )}

        <button
          type="button"
          onClick={handleExit}
          className="size-7 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          title="Exit Preview"
        >
          <X className="size-3.5" />
        </button>
      </div>
    </div>
  );
}
