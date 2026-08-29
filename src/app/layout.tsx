import type { Metadata, Viewport } from "next";
import "./globals.css";
import { TransparentHeader } from "@/components/ui/transparent-header";

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full scroll-smooth">
      <head>
        <link rel="preload" href="/images/architectural-bg.jpg" as="image" />
        <link rel="preload" href="/fonts/helveticanowdisplay-medium.ttf" as="font" type="font/ttf" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/helvetica-now-display-regular.ttf" as="font" type="font/ttf" crossOrigin="anonymous" />
      </head>
      <body
        id="i6mb"
        className="min-h-full flex flex-col bg-[#FFFFE9] text-[#2D2E2A] antialiased overflow-x-hidden selection:bg-[#ECFF17] selection:text-[#000000]"
        style={{ backgroundColor: "#FFFFE9", color: "#2D2E2A" }}
        suppressHydrationWarning
      >
        <TransparentHeader />
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
