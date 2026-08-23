"use client";

import React, { useEffect, useState, useRef } from "react";

export function CustomCursor() {
  const [isFinePointer, setIsFinePointer] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  const mousePos = useRef({ x: -100, y: -100 });
  const ringPos = useRef({ x: -100, y: -100 });
  const rafId = useRef<number | null>(null);

  useEffect(() => {
    // Only enable on devices with fine pointer (mouse/trackpad)
    if (typeof window === "undefined") return;
    const mediaQuery = window.matchMedia("(pointer: fine)");
    setIsFinePointer(mediaQuery.matches);

    const handleMediaChange = (e: MediaQueryListEvent) => {
      setIsFinePointer(e.matches);
    };
    mediaQuery.addEventListener("change", handleMediaChange);

    if (!mediaQuery.matches) return;

    const onMouseMove = (e: MouseEvent) => {
      mousePos.current.x = e.clientX;
      mousePos.current.y = e.clientY;

      if (!isVisible) setIsVisible(true);

      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0) translate(-50%, -50%)`;
      }
    };

    const onMouseDown = () => setIsClicked(true);
    const onMouseUp = () => setIsClicked(false);
    const onMouseLeave = () => setIsVisible(false);
    const onMouseEnter = () => setIsVisible(true);

    // Dynamic hover detection strictly for interactive elements
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const isInteractive =
        target.closest("a") ||
        target.closest("button") ||
        target.closest("input") ||
        target.closest("textarea") ||
        target.closest("select") ||
        target.closest('[role="button"]') ||
        target.closest(".interactive") ||
        target.closest(".cursor-pointer") ||
        window.getComputedStyle(target).cursor === "pointer";

      setIsHovered(Boolean(isInteractive));
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mouseup", onMouseUp);
    document.documentElement.addEventListener("mouseleave", onMouseLeave);
    document.documentElement.addEventListener("mouseenter", onMouseEnter);
    window.addEventListener("mouseover", handleMouseOver, { passive: true });

    // Smooth physics loop for trailing ring
    const updateRing = () => {
      const ease = 0.2;
      ringPos.current.x += (mousePos.current.x - ringPos.current.x) * ease;
      ringPos.current.y += (mousePos.current.y - ringPos.current.y) * ease;

      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringPos.current.x}px, ${ringPos.current.y}px, 0) translate(-50%, -50%)`;
      }

      rafId.current = requestAnimationFrame(updateRing);
    };

    rafId.current = requestAnimationFrame(updateRing);

    return () => {
      mediaQuery.removeEventListener("change", handleMediaChange);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mouseup", onMouseUp);
      document.documentElement.removeEventListener("mouseleave", onMouseLeave);
      document.documentElement.removeEventListener("mouseenter", onMouseEnter);
      window.removeEventListener("mouseover", handleMouseOver);
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [isVisible]);

  if (!isFinePointer) return null;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[9999999] overflow-hidden transition-opacity duration-300"
      style={{ opacity: isVisible ? 1 : 0 }}
      aria-hidden="true"
    >
      {/* Precision Center Dot */}
      <div
        ref={dotRef}
        className="fixed top-0 left-0 w-2 h-2 rounded-full bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.8)] pointer-events-none will-change-transform transition-[scale] duration-150"
        style={{
          transform: "translate3d(-100px, -100px, 0) translate(-50%, -50%)",
          scale: isClicked ? "0.6" : isHovered ? "0.4" : "1",
        }}
      />

      {/* Fluid Trailing Outer Ring */}
      <div
        ref={ringRef}
        className={`fixed top-0 left-0 rounded-full pointer-events-none will-change-transform transition-[width,height,background-color,border-color,box-shadow,scale] duration-200 ease-out border ${
          isHovered
            ? "w-12 h-12 bg-blue-500/10 border-blue-500/60 backdrop-blur-[2px] shadow-[0_0_20px_rgba(59,130,246,0.3)] scale-110"
            : isClicked
            ? "w-7 h-7 bg-blue-600/20 border-blue-600 shadow-[0_0_12px_rgba(37,99,235,0.4)] scale-90"
            : "w-8 h-8 bg-blue-500/5 border-blue-500/40 shadow-[0_0_10px_rgba(59,130,246,0.15)] scale-100"
        }`}
        style={{
          transform: "translate3d(-100px, -100px, 0) translate(-50%, -50%)",
        }}
      />
    </div>
  );
}
