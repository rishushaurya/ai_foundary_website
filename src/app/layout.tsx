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
    <html lang="en" className="h-full antialiased dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&family=Hanken+Grotesk:wght@300;400;500;600;700;800;900&family=Inter:wght@100..900&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=block"
        />
        <link rel="stylesheet" href="/css/website-base.css" />
        <link rel="stylesheet" href="/css/styles.css" />
        <link rel="preload" href="/images/architectural-bg.jpg" as="image" />
        <link rel="preload" href="/fonts/helveticanowdisplay-medium.ttf" as="font" type="font/ttf" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/helvetica-now-display-regular.ttf" as="font" type="font/ttf" crossOrigin="anonymous" />
      </head>
      <body
        id="i6mb"
        className="min-h-full flex flex-col bg-[#F8FAFC] text-slate-900 antialiased overflow-x-hidden selection:bg-cyan-500 selection:text-black"
        style={{ backgroundColor: "#F8FAFC", color: "#0F172A" }}
        suppressHydrationWarning
      >
        <TransparentHeader />
        <div className="relative z-10 w-full flex-grow bg-transparent">
          {children}
        </div>

        {/* Client DOM Safety & Service Worker */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // 1. DOM Safety Patch for external WebGL / 3D Canvas manipulation
              (function() {
                if (typeof window !== 'undefined') {
                  var origRemove = Node.prototype.removeChild;
                  Node.prototype.removeChild = function(child) {
                    if (child && child.parentNode !== this) {
                      if (child.parentNode) {
                        return child.parentNode.removeChild(child);
                      }
                      return child;
                    }
                    return origRemove.call(this, child);
                  };

                  var origInsert = Node.prototype.insertBefore;
                  Node.prototype.insertBefore = function(newNode, ref) {
                    if (ref && ref.parentNode !== this) {
                      return origInsert.call(this, newNode, null);
                    }
                    return origInsert.call(this, newNode, ref);
                  };

                  // Fallback for .pwb-error-page-wrap element replacement
                  if (typeof Element !== 'undefined' && Element.prototype.replaceWith) {
                    var origReplace = Element.prototype.replaceWith;
                    Element.prototype.replaceWith = function() {
                      if (!this.parentNode) return;
                      origReplace.apply(this, arguments);
                    };
                  }
                }
              })();

              // 2. Service Worker handling
              if ('serviceWorker' in navigator) {
                if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                  navigator.serviceWorker.getRegistrations().then(function(registrations) {
                    for (var r of registrations) {
                      r.unregister();
                    }
                  });
                } else if (window.location.protocol === 'https:' || window.location.protocol === 'http:') {
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
