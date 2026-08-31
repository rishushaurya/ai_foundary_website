import type { Metadata, Viewport } from "next";
import "./globals.css";
import { TransparentHeader } from "@/components/ui/transparent-header";
import { getSettings } from "@/lib/data";
import React, { Suspense } from "react";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#050A14",
};

export const metadata: Metadata = {
  title: "AI Foundry | Dayananda Sagar University - Forging the Future of AI & Entrepreneurship",
  description:
    "AI Foundry is the premier tech and AI venture club at Dayananda Sagar University (DSU), Bengaluru. We empower students to ideate, build, and deploy cutting-edge artificial intelligence systems.",
  keywords: [
    "AI Foundry",
    "RAISE AI CLUB",
    "Dayananda Sagar University",
    "DSU Bengaluru",
    "AI Club",
    "Student Innovation",
    "Machine Learning",
    "Artificial Intelligence",
    "Entrepreneurship",
  ],
  authors: [{ name: "AI Foundry Executive Board" }],
  openGraph: {
    title: "AI Foundry | Dayananda Sagar University",
    description:
      "Forging the future of entrepreneurship & AI through collaborative student research and venture incubation.",
    url: "https://aifoundry.club",
    siteName: "AI Foundry DSU",
    images: [
      {
        url: "/images/meta-image.jpg",
        width: 1200,
        height: 630,
        alt: "AI Foundry - Dayananda Sagar University",
      },
    ],
    locale: "en_US",
    type: "website",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getSettings();
  const isDarkDesign = settings.activeDesign === "wix-bold";

  return (
    <html lang="en" className="h-full scroll-smooth">
      <head>
        <link rel="preload" href="/images/architectural-bg.jpg" as="image" />
        <link rel="preload" href="/fonts/helveticanowdisplay-medium.ttf" as="font" type="font/ttf" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/helvetica-now-display-regular.ttf" as="font" type="font/ttf" crossOrigin="anonymous" />
      </head>
      <body
        id="i6mb"
        className={`min-h-full flex flex-col antialiased overflow-x-hidden ${
          isDarkDesign
            ? "bg-[#040812] text-slate-100 selection:bg-[#ECFF17] selection:text-black"
            : "bg-[#FFFFE9] text-[#2D2E2A] selection:bg-[#ECFF17] selection:text-[#000000]"
        }`}
        style={{
          backgroundColor: isDarkDesign ? "#040812" : "#FFFFE9",
          color: isDarkDesign ? "#F1F5F9" : "#2D2E2A",
        }}
        suppressHydrationWarning
      >
        <Suspense fallback={null}>
          <TransparentHeader
            activeDesign={settings.activeDesign}
            visiblePages={settings.visiblePages}
          />
        </Suspense>
        <div className="relative w-full flex-grow bg-transparent">
          {children}
        </div>

        {/* Service Worker Cleanup for Dev Environment */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                  navigator.serviceWorker.getRegistrations().then(function(registrations) {
                    for (var r of registrations) {
                      r.unregister();
                    }
                  });
                }
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
