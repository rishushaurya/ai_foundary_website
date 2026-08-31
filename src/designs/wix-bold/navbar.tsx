"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NavbarProps } from "../types";

export function WixBoldNavbar({ visiblePages }: NavbarProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: "HOME", href: "/", show: true },
    { label: "EVENTS", href: "/events", show: visiblePages?.events !== false },
    { label: "GALLERY", href: "/gallery", show: visiblePages?.gallery !== false },
    { label: "TEAM", href: "/team", show: visiblePages?.team !== false },
  ].filter((l) => l.show);

  return (
    <header className="w-full bg-[#FFFFE9] pt-6 pb-4 sm:pt-8 sm:pb-6 relative z-50">
      <div className="max-w-5xl mx-auto px-6 sm:px-8 flex items-center justify-between sm:justify-center">
        {/* Mobile Brand / Toggle */}
        <Link
          href="/"
          className="sm:hidden text-xs font-semibold tracking-widest text-[#2D2E2A] uppercase"
        >
          AI FOUNDRY
        </Link>

        {/* Centered Desktop Navigation */}
        <nav className="hidden sm:flex items-center space-x-10 md:space-x-14">
          {navLinks.map((link) => {
            const isActive =
              link.href === "/"
                ? pathname === "/"
                : pathname?.startsWith(link.href);

            return (
              <Link
                key={link.label}
                href={link.href}
                className={`text-xs font-normal tracking-[0.2em] uppercase transition-all pb-0.5 ${
                  isActive
                    ? "text-[#2D2E2A] underline underline-offset-8 decoration-1 font-medium"
                    : "text-[#2D2E2A]/80 hover:text-[#2D2E2A] hover:opacity-100"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="sm:hidden p-2 text-[#2D2E2A] focus:outline-none"
          aria-label="Toggle Navigation Menu"
        >
          {mobileMenuOpen ? (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="sm:hidden bg-[#FFFFE9] border-t border-[#2D2E2A]/10 px-6 py-6 space-y-4 shadow-lg animate-in fade-in slide-in-from-top-2 duration-200">
          {navLinks.map((link) => {
            const isActive =
              link.href === "/"
                ? pathname === "/"
                : pathname?.startsWith(link.href);

            return (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block text-xs tracking-[0.2em] uppercase py-1 ${
                  isActive
                    ? "font-bold text-[#2D2E2A] underline underline-offset-4"
                    : "text-[#2D2E2A]/70"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
