"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, ArrowUpRight } from "lucide-react";
import { VisiblePagesConfig } from "@/lib/data";

export function LightNavbar({
  visiblePages: initialVisiblePages,
}: {
  visiblePages?: VisiblePagesConfig;
} = {}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [visiblePages, setVisiblePages] = useState<VisiblePagesConfig>(
    initialVisiblePages || {
      about: true,
      events: true,
      team: true,
      gallery: true,
      recruit: true,
    }
  );

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
    { key: "home", name: "Home", href: "/" },
    { key: "about", name: "About", href: "/about", onClick: handleAboutClick },
    { key: "events", name: "Events", href: "/events" },
    { key: "gallery", name: "Gallery", href: "/gallery" },
    { key: "team", name: "Team", href: "/team" },
  ];

  const navLinks = allNavLinks.filter((link) => {
    if (link.key === "home") return true;
    return visiblePages[link.key as keyof VisiblePagesConfig] !== false;
  });

  return (
    <>
      {/* ===== FIXED TOP NAVIGATION LAYER ===== */}
      <header
        id="ihkww7"
        className="fixed top-0 left-0 right-0 w-full z-[99999] flex flex-col items-center justify-start pointer-events-none transition-all duration-300"
        style={{ pointerEvents: "none" }}
      >
        <div
          id="i1lwz-3"
          className="w-full max-w-[1380px] flex items-center justify-between px-5 sm:px-8 py-3.5 sm:py-4 pointer-events-none"
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
              className="flex items-center gap-3 group transition-transform duration-200 hover:scale-105 cursor-pointer no-underline"
              style={{ pointerEvents: "auto", cursor: "pointer" }}
            >
              <div className="relative w-8 h-8 rounded-full overflow-hidden border border-[#2D2E2A]/20 shadow-xs shrink-0 bg-black">
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
                  className="text-base sm:text-lg font-bold tracking-tight text-[#2D2E2A] leading-none font-libre"
                >
                  AI FOUNDRY
                </span>
                <span className="text-[9px] font-semibold tracking-widest text-[#7A836F] uppercase mt-0.5 font-jetbrains">
                  DSU BENGALURU
                </span>
              </div>
            </Link>
          </div>

          {/* Center Links Pill Navbar matching the new editorial palette */}
          {navLinks.length > 0 && (
            <nav
              id="imob0j-3-3-2-2"
              className={`hidden md:inline-flex items-center justify-center px-7 sm:px-9 h-[46px] rounded-full transition-all duration-200 gap-5 sm:gap-7 relative z-50 pointer-events-auto shadow-sm ${
                isScrolled
                  ? "bg-[#FFFFE9]/95 backdrop-blur-xl border border-[#C6CCBD] shadow-md shadow-[#2D2E2A]/5"
                  : "bg-[#FFFFE9]/85 backdrop-blur-md border border-[#C6CCBD]/80"
              }`}
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
                      className="px-2 py-1 text-xs sm:text-sm font-semibold tracking-wide transition-all duration-200 text-[#424440] hover:text-[#000000] cursor-pointer bg-transparent border-none p-0 focus:outline-none shrink-0 pointer-events-auto font-inter"
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
                    className={`px-2 py-1 text-xs sm:text-sm font-semibold tracking-wide transition-all duration-200 shrink-0 pointer-events-auto cursor-pointer font-inter no-underline ${
                      isActive
                        ? "text-[#000000] font-black underline underline-offset-4 decoration-2 decoration-[#2D2E2A]"
                        : "text-[#424440] hover:text-[#000000]"
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
                className="flex items-center gap-1.5 px-4 sm:px-5 py-2 rounded-full bg-[#2D2E2A] text-[#FFFFE9] text-xs font-jetbrains font-bold uppercase tracking-wider shadow-sm hover:bg-[#000000] hover:scale-105 active:scale-95 transition-all duration-200 group no-underline pointer-events-auto border-none cursor-pointer"
                style={{ pointerEvents: "auto", cursor: "pointer" }}
              >
                <span>Join Us</span>
                <ArrowUpRight className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
            )}

            {/* Mobile Hamburger Toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden flex items-center justify-center w-10 h-10 rounded-full bg-[#FFFFE9] border border-[#C6CCBD] text-[#2D2E2A] shadow-xs cursor-pointer pointer-events-auto transition-transform active:scale-95"
              style={{ pointerEvents: "auto", cursor: "pointer" }}
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* ===== MOBILE SLIDE-DOWN DRAWER ===== */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-[99998] bg-[#2D2E2A]/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="absolute top-16 left-4 right-4 bg-[#FFFFE9] border border-[#C6CCBD] rounded-3xl p-6 shadow-2xl flex flex-col gap-4">
            <nav className="flex flex-col gap-2">
              {navLinks.map((link) => {
                const isActive = pathname === link.href || (link.href !== "/" && pathname?.startsWith(link.href));
                if (link.onClick) {
                  return (
                    <button
                      key={link.name}
                      type="button"
                      onClick={(e) => {
                        setMobileMenuOpen(false);
                        link.onClick?.(e);
                      }}
                      className="text-left px-4 py-3 rounded-xl text-sm font-bold text-[#424440] hover:text-[#000000] hover:bg-[#C6CCBD]/20 transition-colors font-inter"
                    >
                      {link.name}
                    </button>
                  );
                }
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`px-4 py-3 rounded-xl text-sm font-bold transition-colors font-inter no-underline ${
                      isActive
                        ? "text-[#000000] bg-[#C6CCBD]/30 font-black"
                        : "text-[#424440] hover:text-[#000000] hover:bg-[#C6CCBD]/20"
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}

              {visiblePages.recruit !== false && (
                <div className="pt-2 border-t border-[#C6CCBD]/50 mt-2">
                  <Link
                    href="/recruit"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl bg-[#2D2E2A] text-[#FFFFE9] text-xs font-jetbrains font-bold uppercase tracking-wider shadow-sm hover:bg-[#000000] transition-colors no-underline"
                  >
                    <span>Join AI Foundry</span>
                    <ArrowUpRight className="size-4" />
                  </Link>
                </div>
              )}
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
