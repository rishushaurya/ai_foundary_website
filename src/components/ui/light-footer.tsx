"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { VisiblePagesConfig, SiteSocialLinks } from "@/lib/data";

interface LightFooterProps {
  visiblePages?: VisiblePagesConfig;
  socialLinks?: SiteSocialLinks;
}

export function LightFooter({ visiblePages: propPages, socialLinks: propSocials }: LightFooterProps) {
  const [visiblePages, setVisiblePages] = useState<VisiblePagesConfig>(
    propPages || {
      about: true,
      events: true,
      team: true,
      gallery: true,
      recruit: true,
    }
  );
  const [socialLinks, setSocialLinks] = useState<SiteSocialLinks>(propSocials || {});

  useEffect(() => {
    if (propPages) setVisiblePages(propPages);
    if (propSocials) setSocialLinks(propSocials);

    if (!propPages || !propSocials) {
      async function loadSettings() {
        try {
          const res = await fetch("/api/public/settings");
          if (res.ok) {
            const data = await res.json();
            if (data.visiblePages && !propPages) setVisiblePages(data.visiblePages);
            if (data.socialLinks && !propSocials) setSocialLinks(data.socialLinks);
          }
        } catch {}
      }
      loadSettings();
    }
  }, [propPages, propSocials]);

  const linkedinUrl = socialLinks?.linkedin || "https://linkedin.com/";
  const instagramUrl = socialLinks?.instagram || "https://instagram.com/";
  const githubUrl = socialLinks?.github || "https://github.com/";
  const twitterUrl = socialLinks?.twitter || "https://x.com/";
  const contactEmail = socialLinks?.email || "info@aifoundry.com";

  return (
    <footer
      id="comp-kbgakxmn_r_comp-kbgakgyt"
      className="w-full bg-[#FFFFE9] border-t border-[#C6CCBD] text-[#2D2E2A] transition-colors duration-300 relative z-20 py-16 px-6 sm:px-12 lg:px-16"
      style={{ backgroundColor: "#FFFFE9" }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-14 pb-14 border-b border-[#C6CCBD]/60">
          {/* Column 1: Institution Credentials & Campus Info */}
          <div className="md:col-span-5 space-y-4">
            <div className="space-y-2">
              <h3 className="font-libre font-bold text-xl sm:text-2xl text-[#2D2E2A] tracking-tight">
                AI FOUNDRY
              </h3>
              <p className="font-jetbrains text-[10px] sm:text-xs uppercase tracking-widest text-[#7A836F] font-semibold">
                RAISE AI CLUB • DAYANANDA SAGAR UNIVERSITY
              </p>
            </div>

            <p className="font-inter text-xs sm:text-sm text-[#424440] leading-relaxed max-w-md">
              Dayananda Sagar University&apos;s flagship technology accelerator and student innovation hub, uniting engineers, researchers, and student founders in artificial intelligence and venture incubation.
            </p>

            <div className="pt-2 text-xs text-[#424440] space-y-1 font-inter">
              <p className="font-semibold text-[#2D2E2A]">
                School of Engineering • Dept of CSE (AI &amp; ML)
              </p>
              <p className="text-[#5F6360] leading-relaxed">
                Dayananda Sagar University operates across multiple campuses in Bengaluru, with its primary residential and administrative hub located in the south of the city. The main campus is situated at Devarakaggalahalli, Harohalli, Kanakapura Road, Bengaluru South District, Karnataka, 562112.
              </p>
              <p className="pt-1">
                <a
                  href={`mailto:${contactEmail}`}
                  className="font-jetbrains text-xs font-bold text-[#2D2E2A] hover:underline underline-offset-4"
                >
                  {contactEmail}
                </a>
              </p>
            </div>
          </div>

          {/* Column 2: Social Connect & Networks */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="font-jetbrains text-xs font-bold uppercase tracking-wider text-[#7A836F] mb-4">
              Connect &amp; Social
            </h4>
            <ul className="space-y-3 font-jetbrains text-xs uppercase tracking-wider">
              <li>
                <a
                  href={linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#2D2E2A] hover:text-[#000000] hover:underline underline-offset-4 transition-colors inline-block"
                >
                  LinkedIn
                </a>
              </li>
              <li>
                <a
                  href={instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#2D2E2A] hover:text-[#000000] hover:underline underline-offset-4 transition-colors inline-block"
                >
                  Instagram
                </a>
              </li>
              <li>
                <a
                  href={githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#2D2E2A] hover:text-[#000000] hover:underline underline-offset-4 transition-colors inline-block"
                >
                  GitHub
                </a>
              </li>
              <li>
                <a
                  href={twitterUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#2D2E2A] hover:text-[#000000] hover:underline underline-offset-4 transition-colors inline-block"
                >
                  X (Twitter)
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Platform Navigation & Legal Links */}
          <div className="md:col-span-4 space-y-3">
            <h4 className="font-jetbrains text-xs font-bold uppercase tracking-wider text-[#7A836F] mb-4">
              Explore &amp; Legal
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <ul className="space-y-3 font-jetbrains text-xs uppercase tracking-wider">
                <li>
                  <Link
                    href="/"
                    className="text-[#2D2E2A] hover:text-[#000000] hover:underline underline-offset-4 transition-colors inline-block"
                  >
                    Home
                  </Link>
                </li>
                {visiblePages.events !== false && (
                  <li>
                    <Link
                      href="/events"
                      className="text-[#2D2E2A] hover:text-[#000000] hover:underline underline-offset-4 transition-colors inline-block"
                    >
                      Events
                    </Link>
                  </li>
                )}
                {visiblePages.team !== false && (
                  <li>
                    <Link
                      href="/team"
                      className="text-[#2D2E2A] hover:text-[#000000] hover:underline underline-offset-4 transition-colors inline-block"
                    >
                      Team
                    </Link>
                  </li>
                )}
                {visiblePages.gallery !== false && (
                  <li>
                    <Link
                      href="/gallery"
                      className="text-[#2D2E2A] hover:text-[#000000] hover:underline underline-offset-4 transition-colors inline-block"
                    >
                      Gallery
                    </Link>
                  </li>
                )}
                {visiblePages.recruit !== false && (
                  <li>
                    <Link
                      href="/recruit"
                      className="text-[#2D2E2A] hover:text-[#000000] hover:underline underline-offset-4 transition-colors font-bold inline-block"
                    >
                      Join Us
                    </Link>
                  </li>
                )}
              </ul>

              <ul className="space-y-3 font-inter text-xs">
                <li>
                  <Link
                    href="/privacy"
                    className="text-[#424440] hover:text-[#2D2E2A] hover:underline underline-offset-4 transition-colors inline-block"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms"
                    className="text-[#424440] hover:text-[#2D2E2A] hover:underline underline-offset-4 transition-colors inline-block"
                  >
                    Terms &amp; Conditions
                  </Link>
                </li>
                <li>
                  <span className="text-[#7A836F] text-[11px] block mt-1 leading-relaxed">
                    Accessibility Statement: AI Foundry is dedicated to digital accessibility for all creators.
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Copyright & Slogan Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-jetbrains text-[#7A836F]">
          <p>
            &copy; {new Date().getFullYear()} AI Foundry (RAISE AI). Dayananda Sagar University. All rights reserved.
          </p>
          <p className="text-[#2D2E2A] font-semibold">
            Forging Future Innovators in AI &amp; Entrepreneurship
          </p>
        </div>
      </div>
    </footer>
  );
}
