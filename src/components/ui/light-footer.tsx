"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { VisiblePagesConfig, SiteSocialLinks } from "@/lib/data";
import { LinkedinIcon, InstagramIcon, GithubIcon, TwitterIcon } from "@/components/ui/icons";

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

  const linkedinUrl = socialLinks?.linkedin || "https://linkedin.com";
  const instagramUrl = socialLinks?.instagram || "https://instagram.com";
  const githubUrl = socialLinks?.github || "https://github.com";
  const twitterUrl = socialLinks?.twitter || "https://x.com";

  return (
    <footer className="w-full border-t border-slate-200/80 bg-white/70 backdrop-blur-md mt-24 py-12 px-6 text-slate-800">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-slate-500 font-medium">
        {/* Brand & DSU Affiliation */}
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white">
            <Sparkles className="size-3.5" />
          </div>
          <div>
            <span className="font-bold text-slate-800">AI FOUNDRY</span>
            <span className="mx-2 text-slate-300">•</span>
            <span>Dayananda Sagar University, Bengaluru</span>
          </div>
        </div>

        {/* Navigation Quick Links (filtered by visiblePages) */}
        <div className="flex flex-wrap items-center justify-center gap-6">
          <Link href="/" className="hover:text-slate-900 transition-colors">
            Home
          </Link>
          {visiblePages.about !== false && (
            <Link href="/about" className="hover:text-slate-900 transition-colors">
              About
            </Link>
          )}
          {visiblePages.events !== false && (
            <Link href="/events" className="hover:text-slate-900 transition-colors">
              Events
            </Link>
          )}
          {visiblePages.team !== false && (
            <Link href="/team" className="hover:text-slate-900 transition-colors">
              Team
            </Link>
          )}
          {visiblePages.gallery !== false && (
            <Link href="/gallery" className="hover:text-slate-900 transition-colors">
              Gallery
            </Link>
          )}
          {visiblePages.recruit !== false && (
            <Link href="/recruit" className="hover:text-slate-900 transition-colors">
              Recruitment
            </Link>
          )}
        </div>

        {/* Social Connect Links */}
        <div className="flex items-center gap-4">
          <a
            href={linkedinUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-400 hover:text-blue-600 transition-colors"
            aria-label="LinkedIn"
          >
            <LinkedinIcon className="size-4" />
          </a>
          <a
            href={instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-400 hover:text-pink-600 transition-colors"
            aria-label="Instagram"
          >
            <InstagramIcon className="size-4" />
          </a>
          <a
            href={githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-400 hover:text-slate-900 transition-colors"
            aria-label="GitHub"
          >
            <GithubIcon className="size-4" />
          </a>
          <a
            href={twitterUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-400 hover:text-sky-500 transition-colors"
            aria-label="X (Twitter)"
          >
            <TwitterIcon className="size-4" />
          </a>
        </div>

        {/* Copyright */}
        <div className="flex items-center gap-1 text-slate-400">
          <span>&copy; {new Date().getFullYear()} AI Foundry. All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
}
