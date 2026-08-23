"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X } from "lucide-react";
import { VisiblePagesConfig } from "@/lib/data";

export function LightNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [visiblePages, setVisiblePages] = useState<VisiblePagesConfig>({
    about: true,
    events: true,
    team: true,
    gallery: true,
    recruit: true,
  });

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });

    async function loadPublicSettings() {
      try {
        const res = await fetch("/api/public/settings");
        if (res.ok) {
          const data = await res.json();
          if (data.visiblePages) {
            setVisiblePages(data.visiblePages);
          }
        }
      } catch {}
    }
    loadPublicSettings();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleAboutClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (pathname === "/") {
      const aboutEl = document.getElementById("about-section");
      if (aboutEl) {
        aboutEl.scrollIntoView({ behavior: "smooth" });
        return;
      }
    }
    router.push("/?scrollTo=about");
  };

  const allNavLinks = [
    { key: "about", name: "About", href: "/about", onClick: handleAboutClick },
    { key: "events", name: "Events", href: "/events" },
    { key: "team", name: "Team", href: "/team" },
    { key: "gallery", name: "Gallery", href: "/gallery" },
  ];

  const navLinks = allNavLinks.filter((link) => visiblePages[link.key as keyof VisiblePagesConfig] !== false);

  return (
    <>
      {/* ===== FIXED TOP NAVIGATION LAYER (HIGHEST Z-INDEX) ===== */}
      <header
        id="ihkww7"
        className="fixed top-0 left-0 right-0 w-full z-[99999] flex flex-col items-center justify-start pointer-events-none transition-all duration-300"
        style={{ pointerEvents: "none" }}
      >
        <div
          id="i1lwz-3"
          className="w-full max-w-[1380px] flex items-center justify-between px-5 sm:px-8 py-4 sm:py-5 pointer-events-none"
          style={{ pointerEvents: "none" }}
        >
          {/* Left Brand / Logo */}
          <div
            id="imob0j-3-3-2"
            className="flex items-center relative z-50 pointer-events-auto"
            style={{ pointerEvents: "auto" }}
          >
            <Link
              href="/"
              className="flex items-center gap-2.5 group transition-transform duration-200 hover:scale-105 cursor-pointer"
              style={{ pointerEvents: "auto", cursor: "pointer" }}
            >
              <div className="relative w-8 h-8 rounded-full overflow-hidden border border-[#ffab00]/50 shadow-xs shrink-0 bg-black">
                <Image
                  src="/club-logo.png"
                  alt="AI Foundry Logo"
                  fill
                  sizes="32px"
                  className="object-cover"
                />
              </div>
              <div className="flex flex-col">
                <span
                  id="ispyh-2-3-2-3-3-2"
                  className="text-lg sm:text-xl font-black tracking-tight text-[#ffab00] leading-none font-['Helvetica_Now_Display_Medium',sans-serif]"
                >
                  AI FOUNDRY
                </span>
                <span className="text-[9px] font-extrabold tracking-widest text-slate-400 uppercase mt-0.5 font-mono">
                  DSU BENGALURU
                </span>
              </div>
            </Link>
          </div>

          {/* Center Links Pill Navbar with Balanced Internal Padding & Spacing */}
          {navLinks.length > 0 && (
            <nav
              id="imob0j-3-3-2-2"
              className="hidden md:inline-flex items-center justify-center px-8 sm:px-10 h-[50px] rounded-full bg-black/65 backdrop-blur-2xl border border-white/25 shadow-2xl transition-all duration-200 gap-6 sm:gap-8 relative z-50 pointer-events-auto"
              style={{ pointerEvents: "auto" }}
            >
              {navLinks.map((link) => {
                const isActive = pathname === link.href || (link.href !== "/" && pathname?.startsWith(link.href));
                if (link.onClick) {
                  return (
                    <button
                      key={link.name}
                      type="button"
                      onClick={link.onClick}
                      className="px-2 py-1 text-xs sm:text-sm font-bold tracking-wide transition-all duration-200 text-white/90 hover:text-white hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.6)] cursor-pointer bg-transparent border-none p-0 focus:outline-none shrink-0 pointer-events-auto"
                      style={{ pointerEvents: "auto", cursor: "pointer" }}
                    >
                      {link.name}
                    </button>
                  );
                }
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`px-2 py-1 text-xs sm:text-sm font-bold tracking-wide transition-all duration-200 shrink-0 pointer-events-auto cursor-pointer ${
                      isActive
                        ? "text-[#ffab00] font-black drop-shadow-[0_0_10px_rgba(255,171,0,0.8)]"
                        : "text-white/90 hover:text-white hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]"
                    }`}
                    style={{ pointerEvents: "auto", cursor: "pointer" }}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </nav>
          )}

          {/* Right Action 'Join Us' Button */}
          <div
            id="imob0j-3-3-2-2-2"
            className="flex items-center gap-3 relative z-50 pointer-events-auto"
            style={{ pointerEvents: "auto" }}
          >
            {visiblePages.recruit !== false && (
              <Link
                href="/recruit"
                id="i1lwz-2-2-2-2-2-2"
                className="flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-lg bg-[#ebe9e5] text-black text-xs sm:text-sm font-black tracking-tight shadow-md hover:bg-white hover:scale-105 active:scale-95 transition-all duration-200 group border-none cursor-pointer pointer-events-auto"
                style={{ pointerEvents: "auto", cursor: "pointer" }}
              >
                <span id="ispyh-2-3-2-2-2-2">Join Us</span>
                <img
                  src="/images/group-1597882162.svg"
                  alt=""
                  className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5"
                  id="igs5df"
                />
              </Link>
            )}

            {/* Mobile Hamburger Toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 text-white hover:bg-black/80 focus:outline-none cursor-pointer pointer-events-auto"
              aria-label="Toggle navigation menu"
              style={{ pointerEvents: "auto", cursor: "pointer" }}
            >
              {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* ===== MOBILE NAVIGATION DRAWER ===== */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[999999] md:hidden bg-black/80 backdrop-blur-md pt-24 px-6 animate-in fade-in duration-200">
          <div className="bg-slate-900/95 border border-white/15 rounded-3xl p-6 shadow-2xl space-y-4 max-w-sm mx-auto">
            <div className="flex flex-col space-y-2">
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className={`px-4 py-3 rounded-2xl text-sm font-bold transition-colors flex items-center justify-between ${
                  pathname === "/" ? "bg-white/10 text-[#ffab00] font-black" : "text-slate-200 hover:bg-white/5"
                }`}
              >
                <span>Home</span>
              </Link>
              {navLinks.map((link) => {
                const isActive = pathname === link.href || (link.href !== "/" && pathname?.startsWith(link.href));
                if (link.onClick) {
                  return (
                    <button
                      key={link.name}
                      type="button"
                      onClick={(e) => {
                        setMobileMenuOpen(false);
                        link.onClick(e);
                      }}
                      className="w-full text-left px-4 py-3 rounded-2xl text-sm font-bold transition-colors text-slate-200 hover:bg-white/5 bg-transparent border-none cursor-pointer"
                    >
                      <span>{link.name}</span>
                    </button>
                  );
                }
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`px-4 py-3 rounded-2xl text-sm font-bold transition-colors flex items-center justify-between ${
                      isActive ? "bg-white/10 text-[#ffab00] font-black" : "text-slate-200 hover:bg-white/5"
                    }`}
                  >
                    <span>{link.name}</span>
                    {isActive && <span className="w-1.5 h-1.5 rounded-full bg-[#ffab00]"></span>}
                  </Link>
                );
              })}
            </div>

            {visiblePages.recruit !== false && (
              <div className="pt-4 border-t border-white/10">
                <Link
                  href="/recruit"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-3 rounded-xl text-center text-sm font-black text-black bg-[#ebe9e5] hover:bg-white shadow-md flex items-center justify-center gap-2"
                >
                  <span>Join AI Foundry</span>
                  <img src="/images/group-1597882162.svg" alt="" className="w-4 h-4" />
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
