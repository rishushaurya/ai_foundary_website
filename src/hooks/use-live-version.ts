"use client";

import { useEffect, useRef, useState } from "react";

const MAX_BACKOFF_MS = 30000;
// Hundreds of screens see the same change at the same poll; spreading their refetches over ~1s
// keeps the origin from taking them all in one instant.
const REFETCH_JITTER_MS = 1200;

/**
 * Live updates without reloads. Polls the tiny hackathon change counter and calls `onChange`
 * (with the new version) only when something actually changed on the server.
 * - Pauses while the tab is hidden; re-checks immediately on focus and when the network returns.
 * - Backs off exponentially on errors so a flaky venue Wi-Fi can't hammer the server.
 * - Waits a random 0-1.2s before calling `onChange`, so every open screen doesn't refetch at once.
 * Returns whether the connection is healthy and when it last synced, for a "Live" indicator.
 */
export function useLiveVersion(onChange: (version: number) => void, intervalMs = 2500) {
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  });
  const [live, setLive] = useState(true);
  const [lastSync, setLastSync] = useState<Date | null>(null);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    let refetchTimer: ReturnType<typeof setTimeout> | undefined;
    let failures = 0;
    let inFlight = false;
    let stopped = false;
    let lastVersion: number | null = null;

    const schedule = (ms: number) => {
      clearTimeout(timer);
      if (!stopped && !document.hidden) timer = setTimeout(tick, ms);
    };

    async function tick() {
      if (inFlight || stopped || document.hidden) return;
      inFlight = true;
      try {
        const res = await fetch("/api/hackathon/version", { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const { version } = (await res.json()) as { version: number };
        failures = 0;
        setLive(true);
        setLastSync(new Date());
        if (lastVersion !== null && version !== lastVersion) {
          clearTimeout(refetchTimer);
          refetchTimer = setTimeout(() => {
            if (!stopped) onChangeRef.current(version);
          }, Math.random() * REFETCH_JITTER_MS);
        }
        lastVersion = version;
      } catch {
        failures++;
        setLive(false);
      } finally {
        inFlight = false;
      }
      schedule(Math.min(intervalMs * 2 ** failures, MAX_BACKOFF_MS));
    }

    const wake = () => {
      if (document.hidden) return;
      failures = 0;
      clearTimeout(timer);
      void tick();
    };

    document.addEventListener("visibilitychange", wake);
    window.addEventListener("online", wake);
    void tick();
    return () => {
      stopped = true;
      clearTimeout(timer);
      clearTimeout(refetchTimer);
      document.removeEventListener("visibilitychange", wake);
      window.removeEventListener("online", wake);
    };
  }, [intervalMs]);

  return { live, lastSync };
}
