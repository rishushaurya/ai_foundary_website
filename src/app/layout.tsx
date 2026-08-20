import type { Metadata } from "next";
import "./globals.css";
import { TransparentHeader } from "@/components/ui/transparent-header";

export const metadata: Metadata = {
  title: "AI Foundry | Dayananda Sagar University - Forging the Future of AI & Entrepreneurship",
  description:
    "Dayananda Sagar University's premier innovation club, uniting engineers, researchers, designers, and student founders in artificial intelligence and entrepreneurship.",
  keywords: [
    "AI Foundry",
    "RAISE AI CLUB",
    "Dayananda Sagar University",
    "DSU",
    "AI Club",
    "Entrepreneurship",
    "Hackathons",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&family=Inter:wght@100..900&display=swap"
          rel="stylesheet"
        />
        <link rel="stylesheet" href="/css/website-base.css" />
        <link rel="stylesheet" href="/css/styles.css" />
        <link rel="preload" href="/images/architectural-bg.jpg" as="image" />
        <link rel="preload" href="/fonts/helveticanowdisplay-medium.ttf" as="font" type="font/ttf" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/helvetica-now-display-regular.ttf" as="font" type="font/ttf" crossOrigin="anonymous" />
      </head>
      <body
        id="i6mb"
        className="min-h-full flex flex-col bg-[#050a14] text-white overflow-x-hidden selection:bg-cyan-500 selection:text-black"
        style={{ backgroundColor: "#050a14", color: "#ffffff" }}
      >
        <TransparentHeader />
        <div className="relative z-10 w-full flex-grow bg-transparent">
          {children}
        </div>

        {/* Client Service Worker Registration: Active in production, clean-unregistered in development */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                  // In local development, unregister any existing service worker to ensure fresh live code
                  navigator.serviceWorker.getRegistrations().then(function(registrations) {
                    for (var r of registrations) {
                      r.unregister();
                    }
                  });
                } else if (window.location.protocol === 'https:' || window.location.protocol === 'http:') {
                  // In production, register service worker for instant persistent caching
                  window.addEventListener('load', function() {
                    navigator.serviceWorker.register('/sw.js').catch(function(err) {
                      console.warn('SW register note:', err);
                    });
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
