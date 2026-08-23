"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application runtime error:", error);
  }, [error]);

  return (
    <div className="mesh-bg min-h-screen flex items-center justify-center p-4">
      <div className="glass-card rounded-[2rem] p-8 sm:p-12 border border-white/80 shadow-2xl max-w-lg w-full text-center space-y-6">
        <div className="size-16 rounded-3xl bg-amber-100/80 text-amber-600 flex items-center justify-center mx-auto border border-amber-200">
          <AlertTriangle className="size-8" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-black uppercase tracking-widest text-amber-600 font-mono">
            System Notice
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Something Went Wrong
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
            An unexpected error occurred while loading this view. You can retry loading or return to the main dashboard.
          </p>
        </div>

        <div className="pt-4 flex items-center justify-center gap-3">
          <button
            onClick={() => reset()}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-xs font-bold uppercase tracking-wider text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 shadow-md shadow-cyan-600/20 transition-transform hover:scale-105 cursor-pointer border-none"
          >
            <RefreshCw className="size-4" />
            <span>Try Again</span>
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-xs font-bold uppercase tracking-wider text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 shadow-xs transition-transform hover:scale-105 cursor-pointer no-underline"
          >
            <Home className="size-4" />
            <span>Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
