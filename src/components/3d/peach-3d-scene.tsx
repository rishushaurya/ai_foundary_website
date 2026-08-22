"use client";

import React, { useEffect, useRef } from "react";

export function Peach3DScene() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // 1. Initialize Waterfall Caching & State
    (window as any)._pwInitialPath = "/";
    (window as any)._pwPreviewResourceUrls = (window as any)._pwPreviewResourceUrls || [];
    if (!(window as any)._pwLoadFileRequestsCache) (window as any)._pwLoadFileRequestsCache = new Map();
    if (!(window as any)._pwLoadFileResolveFnCache) (window as any)._pwLoadFileResolveFnCache = new Map();

    (window as any)._pwSetFileCache = (fileUrl: string, blob: Blob) => {
      const blobUrl = (window.URL || (window as any).webkitURL).createObjectURL(blob);
      const resolveFn = (window as any)._pwLoadFileResolveFnCache.get(fileUrl);
      if (resolveFn) resolveFn(blobUrl);
    };

    (window as any)._pwWaitForExplicitFileResolve = (fileUrl: string) => {
      if (
        (window as any)._pwLoadFileResolveFnCache.has(fileUrl) &&
        (window as any)._pwLoadFileRequestsCache.has(fileUrl)
      ) {
        return;
      }
      let resolveFn: any;
      const explicitWaitPromise = new Promise((resolve) => {
        resolveFn = resolve;
      });
      (window as any)._pwLoadFileResolveFnCache.set(fileUrl, resolveFn);
      (window as any)._pwLoadFileRequestsCache.set(fileUrl, explicitWaitPromise);
    };

    (window as any)._pwLoadFileFromCacheHelper = async (fileUrl: string) => {
      if (!fileUrl) return undefined;
      try {
        const response = await fetch(fileUrl);
        if (!response.ok) return undefined;
        const blob = await response.blob();
        return (window.URL || (window as any).webkitURL).createObjectURL(blob);
      } catch (error) {
        return undefined;
      }
    };

    (window as any)._pwLoadFileFromCache = async (fileUrl: string) => {
      if (!fileUrl) return undefined;
      let requestPromise = (window as any)._pwLoadFileRequestsCache.get(fileUrl);
      if (!requestPromise) {
        requestPromise = (window as any)._pwLoadFileFromCacheHelper(fileUrl);
        (window as any)._pwLoadFileRequestsCache.set(fileUrl, requestPromise);
      }
      return await requestPromise;
    };

    // 2. Load 3D WebGL script into document.head (never body) to prevent React removeChild DOM conflicts
    const scriptId = "pw-3d-script";
    if (!document.getElementById(scriptId)) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.src = "/js/script.js";
      script.defer = true;
      script.onload = () => {
        (window as any).__pw3DReady = true;
        window.dispatchEvent(new Event("pw3dready"));
      };
      document.head.appendChild(script);
    } else if ((window as any).__pw3DReady) {
      window.dispatchEvent(new Event("pw3dready"));
    }
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 w-screen h-screen z-0 pointer-events-none"
      style={{ top: 0, left: 0, right: 0, bottom: 0 }}
      suppressHydrationWarning
    >
      <div className="pwb-scene w-full h-full" id="ijsk" suppressHydrationWarning />
      <div className="pwb-error-page-wrap hidden" style={{ display: "none" }} suppressHydrationWarning />
    </div>
  );
}
