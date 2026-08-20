"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Calendar,
  FileText,
  Sliders,
  LogOut,
  ArrowLeft,
  UserPlus,
  Image as ImageIcon,
  Shield,
} from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  // If on login screen, don't show admin chrome
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/admin/login");
      router.refresh();
    } catch {}
  };

  const navLinks = [
    { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { label: "Team Roster", href: "/admin/team", icon: Users },
    { label: "Events & Regs", href: "/admin/events", icon: Calendar },
    { label: "Hero & Content", href: "/admin/content", icon: FileText },
    { label: "Recruitment", href: "/admin/recruitment", icon: UserPlus },
    { label: "Gallery Media", href: "/admin/gallery", icon: ImageIcon },
    { label: "Site Settings", href: "/admin/settings", icon: Sliders },
  ];

  return (
    <div
      className="min-h-screen font-mono text-white relative overflow-x-hidden"
      style={{
        backgroundImage: "url(/images/architectural-bg.jpg)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Dark overlay backdrop */}
      <div className="fixed inset-0 bg-[#050a14]/85 backdrop-blur-[3px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Top Banner */}
        <header className="flex flex-wrap items-center justify-between gap-4 p-4 sm:p-5 rounded-3xl border border-white/15 bg-black/40 backdrop-blur-xl shadow-2xl mb-8">
          <div className="flex items-center gap-3">
            <a
              href="/"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-white/20 bg-white/5 text-xs font-bold text-slate-300 hover:text-white hover:bg-white/15 hover:border-cyan-400/50 transition-all no-underline"
            >
              <ArrowLeft className="size-3.5" />
              <span>Public Site</span>
            </a>
            <div className="flex items-center gap-2">
              <span className="size-2.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_rgba(0,210,255,0.8)]"></span>
              <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-white">
                AI FOUNDRY CMS
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/40 text-cyan-400 text-[11px] font-bold">
              <Shield className="size-3 text-cyan-400" />
              <span>OAuth Protected</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-red-500/30 bg-red-950/40 text-xs font-bold text-red-300 hover:bg-red-900/60 hover:text-white transition-colors cursor-pointer"
            >
              <LogOut className="size-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </header>

        {/* Main Admin Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Sidebar Nav */}
          <aside className="md:col-span-1 space-y-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs uppercase tracking-wider border transition-all no-underline backdrop-blur-md ${
                    isActive
                      ? "font-bold bg-cyan-400 text-black border-cyan-400 shadow-[0_0_20px_rgba(0,210,255,0.4)]"
                      : "bg-black/35 text-slate-300 border-white/10 hover:bg-white/10 hover:border-cyan-400/40 hover:text-white"
                  }`}
                >
                  <Icon className={`size-4 ${isActive ? "text-black" : "text-cyan-400"}`} />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </aside>

          {/* Main Content Workspace */}
          <main className="md:col-span-3 min-w-0">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
