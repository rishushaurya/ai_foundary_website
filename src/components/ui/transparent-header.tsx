"use client";

import React, { useState } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";

export function TransparentHeader() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // If on admin routes, header is handled by admin layout
  if (pathname.startsWith("/admin")) {
    return null;
  }

  const isHome = pathname === "/";

  const handleNav = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Special handling for About link: if on home, smooth scroll to about section
    if (href === "/about" || href === "#about-section") {
      if (isHome) {
        const aboutEl = document.getElementById("about-section");
        if (aboutEl) {
          aboutEl.scrollIntoView({ behavior: "smooth" });
        } else {
          window.scrollTo({ top: window.innerHeight, behavior: "smooth" });
        }
        return;
      } else {
        window.location.href = "/?scrollTo=about-section";
        return;
      }
    }

    if (pathname === href) return;
    window.location.href = href;
  };

  return (
    <>
      {/* ===== DESKTOP FLOATING HEADER ===== */}
      <header className="pwb-flex-grid-wrap" id="ihkww7" style={{ pointerEvents: "none", zIndex: 9999 }}>
        <div className="pwb-flex-grid-wrap" id="i1lwz-3" style={{ pointerEvents: "none" }}>
          {/* Logo Left */}
          <div className="framer-1cc0f02" id="header-logo-container" style={{ pointerEvents: "auto" }}>
            <a
              href="/"
              onClick={(e) => handleNav(e, "/")}
              className="pwb-flex-grid-wrap flex items-center gap-2.5 no-underline cursor-pointer"
              id="header-logo-link"
            >
              <div className="relative w-8 h-8 rounded-full overflow-hidden border border-cyan-400/40 shadow-[0_0_10px_rgba(0,210,255,0.3)]">
                <Image
                  src="/club-logo.png"
                  alt="AI Foundry Logo"
                  fill
                  className="object-cover"
                  sizes="32px"
                />
              </div>
              <div
                id="header-logo-text"
                style={{
                  color: "#00d2ff",
                  fontSize: "20px",
                  fontWeight: 700,
                  letterSpacing: "1px",
                  fontFamily: '"68832fb0ffba9b1995adac75-helveticanowdisplay-medium", sans-serif',
                }}
              >
                AI FOUNDRY
              </div>
            </a>
          </div>

          {/* Central Floating Navigation Capsule */}
          <div
            className="framer-1cc0f02"
            id="header-nav-capsule"
            style={{
              pointerEvents: "auto",
              cursor: "default",
              backgroundColor: "rgba(0, 0, 0, 0.45)",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              backdropFilter: "blur(16px)",
              borderRadius: "999px",
              width: "400px",
              height: "60px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              className="pwb-flex-grid-wrap"
              id="header-nav-inner"
              style={{
                pointerEvents: "auto",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "30px",
                width: "100%",
                height: "100%",
              }}
            >
              <a
                href="/about"
                onClick={(e) => handleNav(e, "/about")}
                className="pw-user-text-style-db4943d4-453d-474d-b88a-07d9ad351c62 no-underline transition-colors hover:text-cyan-400 cursor-pointer"
                id="nav-link-about"
                style={{
                  color: pathname === "/about" ? "#00d2ff" : "#ffffff",
                  fontWeight: pathname === "/about" ? 700 : 500,
                  fontSize: "14px",
                  pointerEvents: "auto",
                }}
              >
                About
              </a>
              <a
                href="/events"
                onClick={(e) => handleNav(e, "/events")}
                className="pw-user-text-style-db4943d4-453d-474d-b88a-07d9ad351c62 no-underline transition-colors hover:text-cyan-400 cursor-pointer"
                id="nav-link-events"
                style={{
                  color: pathname === "/events" ? "#00d2ff" : "#ffffff",
                  fontWeight: pathname === "/events" ? 700 : 500,
                  fontSize: "14px",
                  pointerEvents: "auto",
                }}
              >
                Events
              </a>
              <a
                href="/team"
                onClick={(e) => handleNav(e, "/team")}
                className="pw-user-text-style-db4943d4-453d-474d-b88a-07d9ad351c62 no-underline transition-colors hover:text-cyan-400 cursor-pointer"
                id="nav-link-team"
                style={{
                  color: pathname === "/team" ? "#00d2ff" : "#ffffff",
                  fontWeight: pathname === "/team" ? 700 : 500,
                  fontSize: "14px",
                  pointerEvents: "auto",
                }}
              >
                Team
              </a>
              <a
                href="/gallery"
                onClick={(e) => handleNav(e, "/gallery")}
                className="pw-user-text-style-db4943d4-453d-474d-b88a-07d9ad351c62 no-underline transition-colors hover:text-cyan-400 cursor-pointer"
                id="nav-link-gallery"
                style={{
                  color: pathname === "/gallery" ? "#00d2ff" : "#ffffff",
                  fontWeight: pathname === "/gallery" ? 700 : 500,
                  fontSize: "14px",
                  pointerEvents: "auto",
                }}
              >
                Gallery
              </a>
            </div>
          </div>

          {/* Join Us Button Right */}
          <div className="framer-1cc0f02" id="header-joinus-container" style={{ pointerEvents: "auto" }}>
            <a
              href="/recruit"
              onClick={(e) => handleNav(e, "/recruit")}
              className="pwb-flex-grid-wrap no-underline hover:scale-105 transition-transform cursor-pointer"
              id="nav-btn-joinus"
              style={{
                display: "flex",
                alignItems: "center",
                flexDirection: "row",
                padding: "16px 24px",
                justifyContent: "center",
                backgroundColor: "#ffffff",
                borderRadius: "8px",
                gap: "8px",
                height: "48px",
                pointerEvents: "auto",
                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.2)",
              }}
            >
              <p
                className="pw-user-text-style-db4943d4-453d-474d-b88a-07d9ad351c62 font-bold"
                id="nav-btn-joinus-text"
                style={{
                  color: "#000000",
                  fontWeight: 700,
                  fontSize: "14px",
                }}
              >
                Join Us
              </p>
              <img
                src="/images/group-1597882162.svg"
                loading="lazy"
                id="nav-btn-joinus-icon"
                alt="arrow"
                style={{ width: "20px", height: "20px" }}
              />
            </a>
          </div>
        </div>
      </header>

      {/* ===== MOBILE TOP HEADER ===== */}
      <div className="pwb-flex-grid-wrap" id="ihkww7-2">
        <div className="pw-block-style" id="i8rrfy">
          <a
            href="/"
            onClick={(e) => handleNav(e, "/")}
            className="pwb-flex-grid-wrap flex items-center gap-2 no-underline"
            id="mobile-header-logo-link"
          >
            <div className="relative w-6 h-6 rounded-full overflow-hidden border border-cyan-400/30">
              <Image src="/club-logo.png" alt="AI Foundry Logo" fill className="object-cover" sizes="24px" />
            </div>
            <div id="mobile-header-logo-text" style={{ color: "#00d2ff", fontWeight: 700 }}>
              AI FOUNDRY
            </div>
          </a>
          <div
            className="pw-block-style cursor-pointer"
            id="mobile-menu-hamburger"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <div className="pw-block-style" id="i53c6f-2"></div>
            <div className="pw-block-style" id="i53c6f-2-2"></div>
          </div>
        </div>
      </div>

      {/* ===== MOBILE DRAWER OVERLAY ===== */}
      {mobileMenuOpen && (
        <div
          className="pwb-relative-overlay"
          id="mobile-drawer-overlay"
          style={{
            display: "block",
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            zIndex: 9999999,
            background: "rgba(5,10,20,0.98)",
            backdropFilter: "blur(25px)",
          }}
        >
          <div className="pw-block-style" id="mobile-drawer-inner">
            <div className="pw-block-style" id="mobile-drawer-top">
              <div className="pwb-flex-grid-wrap" id="mobile-drawer-logo">
                <div id="mobile-drawer-logo-title" style={{ color: "#00d2ff", fontWeight: 700 }}>
                  AI FOUNDRY
                </div>
              </div>
              <div
                className="pw-block-style cursor-pointer"
                id="mobile-menu-close"
                onClick={() => setMobileMenuOpen(false)}
              >
                <div className="pw-block-style" id="i53c6f-2-3"></div>
                <div className="pw-block-style" id="i53c6f-2-2-2"></div>
              </div>
            </div>
            <div className="pwb-flex-grid-wrap flex flex-col gap-5 p-8" id="mobile-drawer-links">
              <a
                href="/about"
                onClick={(e) => {
                  setMobileMenuOpen(false);
                  handleNav(e, "/about");
                }}
                className="text-lg font-bold text-white no-underline hover:text-cyan-400"
                id="mob-link-about"
              >
                About
              </a>
              <a
                href="/events"
                onClick={(e) => {
                  setMobileMenuOpen(false);
                  handleNav(e, "/events");
                }}
                className="text-lg font-bold text-white no-underline hover:text-cyan-400"
                id="mob-link-events"
              >
                Events
              </a>
              <a
                href="/team"
                onClick={(e) => {
                  setMobileMenuOpen(false);
                  handleNav(e, "/team");
                }}
                className="text-lg font-bold text-white no-underline hover:text-cyan-400"
                id="mob-link-team"
              >
                Team
              </a>
              <a
                href="/gallery"
                onClick={(e) => {
                  setMobileMenuOpen(false);
                  handleNav(e, "/gallery");
                }}
                className="text-lg font-bold text-white no-underline hover:text-cyan-400"
                id="mob-link-gallery"
              >
                Gallery
              </a>
              <a
                href="/recruit"
                onClick={(e) => {
                  setMobileMenuOpen(false);
                  handleNav(e, "/recruit");
                }}
                className="flex items-center justify-center p-3.5 rounded-xl font-bold font-mono uppercase bg-cyan-400 text-black no-underline mt-4 shadow-[0_0_15px_rgba(0,210,255,0.4)]"
                id="mob-link-joinus"
              >
                Join Us
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
