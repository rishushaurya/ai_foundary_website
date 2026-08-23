import React from "react";
import Link from "next/link";
import { ArrowLeft, Compass } from "lucide-react";
import { LightFooter } from "@/components/ui/light-footer";

export default function NotFound() {
  return (
    <div className="mesh-bg min-h-screen flex flex-col justify-between pt-36 sm:pt-44">
      <main className="max-w-2xl mx-auto w-full px-4 sm:px-6 py-16 text-center space-y-6">
        <div className="glass-card rounded-[2rem] p-8 sm:p-12 border border-white/80 shadow-xl space-y-6">
          <div className="size-16 rounded-3xl bg-cyan-100/80 text-cyan-700 flex items-center justify-center mx-auto border border-cyan-200">
            <Compass className="size-8 animate-spin" style={{ animationDuration: "12s" }} />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-black uppercase tracking-widest text-cyan-600 font-mono">
              Error 404
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Page Not Found
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
              The page or resource you are looking for might have been moved, renamed, or is temporarily unavailable.
            </p>
          </div>

          <div className="pt-4 flex items-center justify-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-xs font-bold uppercase tracking-wider text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 shadow-md shadow-cyan-600/20 transition-transform hover:scale-105 cursor-pointer no-underline"
            >
              <ArrowLeft className="size-4" />
              <span>Back to Home</span>
            </Link>
            <Link
              href="/events"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-xs font-bold uppercase tracking-wider text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 shadow-xs transition-transform hover:scale-105 cursor-pointer no-underline"
            >
              <span>Explore Events</span>
            </Link>
          </div>
        </div>
      </main>

      <LightFooter />
    </div>
  );
}
