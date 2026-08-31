"use client";

import React, { useEffect, useRef, useState } from "react";

interface WixFrameProps {
  src: string;
  title: string;
}

export function WixExportFrame({ src, title }: WixFrameProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [iframeHeight, setIframeHeight] = useState<string>("100vh");

  useEffect(() => {
    const handleResize = () => {
      if (iframeRef.current && iframeRef.current.contentWindow) {
        try {
          const doc = iframeRef.current.contentWindow.document;
          if (doc && doc.body) {
            const scrollHeight = Math.max(
              doc.body.scrollHeight,
              doc.documentElement.scrollHeight,
              doc.body.offsetHeight
            );
            if (scrollHeight > 100) {
              setIframeHeight(`${scrollHeight}px`);
            }
          }
        } catch {
          // Fallback if cross-origin policy applies
          setIframeHeight("100vh");
        }
      }
    };

    const interval = setInterval(handleResize, 500);
    window.addEventListener("resize", handleResize);

    return () => {
      clearInterval(interval);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div className="w-full bg-[#FFFFE9] min-h-screen overflow-x-hidden">
      <iframe
        ref={iframeRef}
        src={src}
        title={title}
        className="w-full border-0 block"
        style={{
          height: iframeHeight,
          minHeight: "100vh",
          backgroundColor: "#FFFFE9",
        }}
        onLoad={() => {
          if (iframeRef.current && iframeRef.current.contentWindow) {
            try {
              const doc = iframeRef.current.contentWindow.document;
              if (doc && doc.body) {
                const scrollHeight = Math.max(
                  doc.body.scrollHeight,
                  doc.documentElement.scrollHeight
                );
                if (scrollHeight > 100) {
                  setIframeHeight(`${scrollHeight}px`);
                }
              }
            } catch {
              // ignore
            }
          }
        }}
      />
    </div>
  );
}
