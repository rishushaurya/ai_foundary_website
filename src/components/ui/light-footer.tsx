import React from "react";
import Link from "next/link";
import { Sparkles } from "lucide-react";

export function LightFooter() {
  return (
    <footer className="w-full border-t border-slate-200/80 bg-white/70 backdrop-blur-md mt-24 py-12 px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-slate-500 font-medium">
        {/* Brand & DSU Affiliation */}
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white">
            <Sparkles className="size-3.5" />
          </div>
          <div>
            <span className="font-bold text-slate-800">AI FOUNDRY</span>
            <span className="mx-2 text-slate-300">•</span>
            <span>Dayananda Sagar University, Bengaluru</span>
          </div>
        </div>

        {/* Navigation Quick Links */}
        <div className="flex flex-wrap items-center justify-center gap-6">
          <Link href="/" className="hover:text-slate-900 transition-colors">Home</Link>
          <Link href="/about" className="hover:text-slate-900 transition-colors">About</Link>
          <Link href="/events" className="hover:text-slate-900 transition-colors">Events</Link>
          <Link href="/team" className="hover:text-slate-900 transition-colors">Team</Link>
          <Link href="/gallery" className="hover:text-slate-900 transition-colors">Gallery</Link>
          <Link href="/recruit" className="hover:text-slate-900 transition-colors">Recruitment</Link>
          <Link href="/privacy" className="hover:text-slate-900 transition-colors">Privacy</Link>
          <Link href="/terms" className="hover:text-slate-900 transition-colors">Terms</Link>
        </div>

        {/* Copyright */}
        <div className="flex items-center gap-1 text-slate-400">
          <span>© {new Date().getFullYear()} AI Foundry. All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
}
