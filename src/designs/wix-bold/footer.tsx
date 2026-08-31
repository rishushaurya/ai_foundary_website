import React from "react";
import Link from "next/link";
import { FooterProps } from "../types";

export function WixBoldFooter({ socialLinks, visiblePages }: FooterProps) {
  const linkedinUrl = socialLinks?.linkedin || "https://linkedin.com/company/raise-ai-club";
  const instagramUrl = socialLinks?.instagram || "https://instagram.com/raiseaiclub.dsu";
  const githubUrl = socialLinks?.github || "https://github.com";
  const twitterUrl = socialLinks?.twitter || "https://x.com";
  const whatsappUrl = socialLinks?.whatsapp || "";

  return (
    <footer className="w-full bg-[#FFFFE9] text-[#2D2E2A] py-16 sm:py-28 border-t border-[#2D2E2A]/10 font-sans">
      <div className="max-w-5xl mx-auto px-6 sm:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 sm:gap-14 items-start text-xs tracking-wider">
          {/* Column 1: Institutional Statement */}
          <div className="space-y-4">
            <p className="leading-relaxed uppercase font-normal text-[#2D2E2A] text-xs">
              DAYANANDA SAGAR UNIVERSITY&apos;S FLAGSHIP TECHNOLOGY ACCELERATOR AND
              STUDENT INNOVATION HUB, UNITING ENGINEERS, RESEARCHERS, AND STUDENT
              FOUNDERS.
            </p>
          </div>

          {/* Column 2: Social Links */}
          <div className="md:pl-8">
            <ul className="space-y-3 uppercase font-normal text-xs tracking-widest">
              <li className="flex items-center space-x-3">
                <span className="text-[#2D2E2A] text-sm leading-none">•</span>
                <a
                  href={linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:opacity-60 transition-opacity"
                >
                  LINKEDIN
                </a>
              </li>
              <li className="flex items-center space-x-3">
                <span className="text-[#2D2E2A] text-sm leading-none">•</span>
                <a
                  href={instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:opacity-60 transition-opacity"
                >
                  INSTAGRAM
                </a>
              </li>
              <li className="flex items-center space-x-3">
                <span className="text-[#2D2E2A] text-sm leading-none">•</span>
                <a
                  href={githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:opacity-60 transition-opacity"
                >
                  GITHUB
                </a>
              </li>
              <li className="flex items-center space-x-3">
                <span className="text-[#2D2E2A] text-sm leading-none">•</span>
                <a
                  href={twitterUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:opacity-60 transition-opacity"
                >
                  X (TWITTER)
                </a>
              </li>
              {whatsappUrl && (
                <li className="flex items-center space-x-3">
                  <span className="text-[#2D2E2A] text-sm leading-none">•</span>
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:opacity-60 transition-opacity"
                  >
                    WHATSAPP HUB
                  </a>
                </li>
              )}
            </ul>
          </div>

          {/* Column 3: Legal & Accessibility */}
          <div className="space-y-3 md:text-right uppercase font-normal text-xs tracking-wider">
            <p className="font-bold tracking-widest text-[#2D2E2A]">
              ACCESSIBILITY STATEMENT
            </p>
            <p>
              <Link href="/privacy" className="hover:opacity-60 transition-opacity">
                PRIVACY POLICY
              </Link>
            </p>
            <p>
              <Link href="/terms" className="hover:opacity-60 transition-opacity">
                TERMS &amp; CONDITIONS
              </Link>
            </p>
          </div>
        </div>

        {/* Bottom copyright line */}
        <div className="mt-14 pt-8 border-t border-[#2D2E2A]/10 flex flex-col sm:flex-row justify-between items-center text-[11px] text-[#424440] tracking-widest uppercase gap-3">
          <p>© {new Date().getFullYear()} AI FOUNDRY — DAYANANDA SAGAR UNIVERSITY</p>
          <p className="font-medium">ALL RIGHTS RESERVED</p>
        </div>
      </div>
    </footer>
  );
}
