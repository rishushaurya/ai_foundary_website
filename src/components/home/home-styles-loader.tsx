"use client";

import { useEffect } from "react";

/**
 * Dynamically mounts PeachWeb CSS only when the Home Page is active,
 * and completely unloads it when navigating to any other route.
 * This guarantees subpages (Team, Events, Gallery, Recruit, Admin) retain
 * their pristine Tailwind & design-system layouts without CSS reset bleed.
 */
export function HomeStylesLoader() {
  useEffect(() => {
    if (typeof document === "undefined") return;

    // Maintain consistent light background
    document.body.style.backgroundColor = "#F8FAFC";
    document.body.style.color = "#0F172A";

    return () => {
      document.body.style.backgroundColor = "#F8FAFC";
      document.body.style.color = "#0F172A";
    };
  }, []);

  return null;
}
