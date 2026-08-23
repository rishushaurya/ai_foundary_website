"use client";

import React, { useState, useEffect } from "react";
import useScreenSize from "@/hooks/use-screen-size";
import Gravity, {
  MatterBody,
} from "@/components/fancy/physics/cursor-attractor-and-gravity";

interface Particle {
  id: number;
  size: number;
  colorClass: string;
  x: string;
  y: string;
}

const COLORS = [
  "bg-slate-200/50 border-slate-300/40",
  "bg-blue-100/40 border-blue-200/50",
  "bg-amber-100/35 border-amber-200/40",
  "bg-indigo-100/30 border-indigo-200/40",
  "bg-cyan-100/40 border-cyan-200/50",
];

export function GravityCursorBackground() {
  const screenSize = useScreenSize();
  const [particles, setParticles] = useState<Particle[]>([]);
  const [mounted, setMounted] = useState(false);

  // Generate particles ONLY on client after mount to avoid SSR hydration mismatch
  useEffect(() => {
    const count = screenSize.lessThan("sm") ? 25 : screenSize.lessThan("md") ? 45 : 65;
    const maxSize = screenSize.lessThan("sm") ? 18 : screenSize.lessThan("md") ? 26 : 34;
    const minSize = screenSize.lessThan("sm") ? 8 : 12;

    const generated: Particle[] = Array.from({ length: count }).map((_, i) => ({
      id: i,
      size: Math.max(minSize, Math.random() * maxSize),
      colorClass: COLORS[i % COLORS.length],
      x: `${Math.random() * 92 + 4}%`,
      y: `${Math.random() * 90 + 5}%`,
    }));

    setParticles(generated);
    setMounted(true);
  }, []); // Run once on mount only

  // Don't render anything during SSR — avoids hydration mismatch entirely
  if (!mounted) return null;

  return (
    <div className="fixed inset-0 w-full h-full pointer-events-none z-0 overflow-hidden" aria-hidden="true">
      <Gravity
        attractorStrength={0.000015}
        cursorStrength={0.00045}
        cursorFieldRadius={220}
        className="w-full h-full absolute inset-0"
      >
        {particles.map((p) => (
          <MatterBody
            key={p.id}
            matterBodyOptions={{ friction: 0.3, frictionAir: 0.02, restitution: 0.5 }}
            x={p.x}
            y={p.y}
          >
            <div
              className={`rounded-full border backdrop-blur-[1px] shadow-sm transition-opacity duration-500 ${p.colorClass}`}
              style={{
                width: `${p.size}px`,
                height: `${p.size}px`,
              }}
            />
          </MatterBody>
        ))}
      </Gravity>
    </div>
  );
}

