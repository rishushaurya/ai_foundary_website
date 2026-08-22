import type { Metadata } from "next";
import "./globals.css";
import { TransparentHeader } from "@/components/ui/transparent-header";

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
  viewport: "width=device-width, initial-scale=1, maximum-scale=5",
  themeColor: "#050A14",
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
        className="min-h-full flex flex-col bg-[#F8FAFC] text-slate-900 antialiased overflow-x-hidden selection:bg-cyan-500 selection:text-black"
        style={{ backgroundColor: "#F8FAFC", color: "#0F172A" }}
        suppressHydrationWarning
      >
        {/* Global Fallback Anchors for External WebGL 3D Runtime */}
        <div id="pwb-global-fallbacks" className="hidden pointer-events-none" style={{ display: "none" }} aria-hidden="true" suppressHydrationWarning>
          <div className="pwb-body-wrap" suppressHydrationWarning />
          <div className="pwb-loading-wrap" suppressHydrationWarning />
          <div className="pwb-error-page-wrap" suppressHydrationWarning />
        </div>

        <TransparentHeader />
        <div className="relative z-10 w-full flex-grow bg-transparent">
          {children}
        </div>

        {/* Client DOM Safety & Service Worker */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // 1. Universal DOM Safety Patch for External WebGL / 3D Canvas
              (function() {
                if (typeof window !== 'undefined') {
                  // Safe Node removal
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

                  // Safe Node insertion
                  var origInsert = Node.prototype.insertBefore;
                  Node.prototype.insertBefore = function(newNode, ref) {
                    if (ref && ref.parentNode !== this) {
                      return origInsert.call(this, newNode, null);
                    }
                    return origInsert.call(this, newNode, ref);
                  };

                  // Safe querySelector fallback so 3D script queries never return null
                  var origQS = Document.prototype.querySelector;
                  Document.prototype.querySelector = function(selector) {
                    var el = origQS.call(this, selector);
                    if (!el && typeof selector === 'string') {
                      if (
                        selector.indexOf('pwb-error-page-wrap') !== -1 ||
                        selector.indexOf('pwb-loading-wrap') !== -1 ||
                        selector.indexOf('pwb-body-wrap') !== -1 ||
                        selector.indexOf('pwb-scene') !== -1
                      ) {
                        var cls = selector.replace(/[#.]/g, '');
                        var fallback = document.createElement('div');
                        fallback.className = cls;
                        fallback.style.display = 'none';
                        document.body.appendChild(fallback);
                        return fallback;
                      }
                    }
                    return el;
                  };

                  // Safe Element.prototype.replaceWith fallback
                  if (typeof Element !== 'undefined' && Element.prototype.replaceWith) {
                    var origReplace = Element.prototype.replaceWith;
                    Element.prototype.replaceWith = function() {
                      if (!this.parentNode) {
                        if (document.body) {
                          for (var i = 0; i < arguments.length; i++) {
                            if (arguments[i] instanceof Node) {
                              document.body.appendChild(arguments[i]);
                            }
                          }
                        }
                        return;
                      }
                      origReplace.apply(this, arguments);
                    };
                  }

                  // Filter benign WebGL fallback console notices
                  var origConsoleError = console.error;
                  console.error = function() {
                    if (arguments.length > 0 && typeof arguments[0] === 'string') {
                      if (arguments[0].indexOf('Error page wrap not found') !== -1) {
                        return; // Silent handling
                      }
                    }
                    origConsoleError.apply(console, arguments);
                  };
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
