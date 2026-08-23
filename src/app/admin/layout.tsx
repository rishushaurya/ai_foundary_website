"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Calendar,
  Sparkles,
  Sliders,
  LogOut,
  ArrowLeft,
  UserPlus,
  Image as ImageIcon,
  Shield,
  Layers,
  Loader2,
  ShieldCheck,
} from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [session, setSession] = useState<{ email?: string; role?: string } | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(pathname !== "/admin/login");

  useEffect(() => {
    if (pathname === "/admin/login") {
      setCheckingAuth(false);
      return;
    }

    let isMounted = true;
    const verifyAuth = async () => {
      try {
        const res = await fetch("/api/auth/session");
        if (!res.ok) throw new Error("Unauthorized session");
        const data = await res.json();
        if (!data.authenticated) throw new Error("Unauthenticated");

        if (isMounted) {
          setSession(data.user || null);
          setCheckingAuth(false);
        }
      } catch {
        if (isMounted) {
          window.location.href = "/admin/login";
        }
      }
    };

    verifyAuth();

    return () => {
      isMounted = false;
    };
  }, [pathname]);

  // If on login screen, don't show admin chrome
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  // Security gate: If verifying or unauthenticated, block UI rendering
  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-[#070d19] text-white flex flex-col items-center justify-center p-4 font-sans relative overflow-hidden">
        <div className="size-16 rounded-2xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-400 flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(0,210,255,0.3)] animate-pulse">
          <ShieldCheck className="size-8" />
        </div>
        <div className="flex items-center gap-2.5 text-sm font-bold text-cyan-400 uppercase tracking-widest mb-1">
          <Loader2 className="size-4 animate-spin text-cyan-400" />
          <span>Verifying Admin Session</span>
        </div>
        <p className="text-xs text-slate-400 font-mono">Checking cryptographic authorization token...</p>
      </div>
    );
  }

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      window.location.href = "/admin/login";
    } catch {
      window.location.href = "/admin/login";
    }
  };

  const navLinks = [
    { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { label: "Landing Page", href: "/admin/landing", icon: Sparkles },
    { label: "Events & Sprints", href: "/admin/events", icon: Calendar },
    { label: "Team & Mentors", href: "/admin/team", icon: Users },
    { label: "Gallery & Links", href: "/admin/gallery", icon: ImageIcon },
    { label: "Recruitment Apps", href: "/admin/recruitment", icon: UserPlus },
    { label: "Site Settings", href: "/admin/settings", icon: Sliders },
    { label: "Audit Logs", href: "/admin/audit-logs", icon: Shield },
  ];

  return (
    <div className="mesh-bg min-h-screen text-slate-900 font-sans relative overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Top Header Bar */}
        <header className="flex flex-wrap items-center justify-between gap-4 p-4 sm:p-5 rounded-3xl bg-white/80 backdrop-blur-xl border border-white/80 shadow-sm mb-8">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition-all shadow-xs"
            >
              <ArrowLeft className="size-3.5 text-cyan-600" />
              <span>Public Website</span>
            </Link>
            <div className="flex items-center gap-2">
              <span className="size-2.5 rounded-full bg-cyan-500 animate-pulse"></span>
              <span className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-slate-900">
                AI FOUNDRY CMS
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-cyan-50 border border-cyan-200 text-cyan-800 text-xs font-bold">
              <Shield className="size-3.5 text-cyan-600" />
              <span>{session?.email || "Authenticated Session"}</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-red-200 bg-red-50 text-xs font-bold text-red-700 hover:bg-red-100 transition-colors cursor-pointer"
            >
              <LogOut className="size-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </header>

        {/* Main Admin Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Nav */}
          <aside className="lg:col-span-1 space-y-2">
            <div className="glass-card rounded-3xl p-3 sm:p-4 space-y-1.5 border border-white/80 shadow-sm">
              <div className="px-3 py-2 text-[11px] font-extrabold uppercase tracking-widest text-slate-400">
                Navigation
              </div>
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center justify-between px-4 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all ${
                      isActive
                        ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-600/20"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`size-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                      <span>{link.label}</span>
                    </div>
                    {isActive && (
                      <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                    )}
                  </Link>
                );
              })}
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="lg:col-span-3 space-y-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
