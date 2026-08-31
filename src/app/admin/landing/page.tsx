"use client";

import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Save,
  CheckCircle2,
  AlertCircle,
  Eye,
  Layers,
  Award,
  Compass,
  Plus,
  Trash2,
} from "lucide-react";
import { SiteSettings, LandingCustomContent } from "@/lib/data";
import { ImagePreviewModal, ImagePreviewSettings } from "@/components/admin/image-preview-modal";

export default function AdminLandingPage() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "saved" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  // Hero Fields
  const [heroTagline, setHeroTagline] = useState("");
  const [heroSubtext, setHeroSubtext] = useState("");

  // Preview Modal State
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewConfig, setPreviewConfig] = useState<{
    title: string;
    imageUrl: string;
    homeImageUrl?: string;
    imageFit?: "cover" | "contain";
    imagePosition?: "center" | "top" | "bottom";
    aspectRatioType: "event" | "team" | "about" | "general";
    cardTitle?: string;
    cardSubtitle?: string;
    onApply: (settings: ImagePreviewSettings) => void;
  } | null>(null);

  // Landing Custom Content Model (active sections only)
  const [landingContent, setLandingContent] = useState<LandingCustomContent>({
    heroBadge: "DSU PREMIER AI & VENTURE ACCELERATOR",
    heroTagline: "FORGING THE FUTURE OF ENTREPRENEURSHIP & ARTIFICIAL INTELLIGENCE",
    heroSubtext: "Dayananda Sagar University's premier innovation ecosystem uniting engineers, designers, researchers, and student founders in artificial intelligence.",
    heroDepartment: "School of Engineering • Department of AI & Robotics • DSU Bengaluru",
    aboutBadge: "ABOUT AI FOUNDRY",
    aboutHeading: "AI Foundry is the go-to spot for student creators at Dayananda Sagar University. We turn cool campus ideas into real-world tech by giving you the right mentors, beastly GPU power, and a local community that helps you grow. It's where the future of AI hits the road.",
    aboutSecondaryText: "Whether you're fine-tuning custom LLMs, building autonomous agents, designing slick interfaces, or pitching your first venture, you won't be doing it alone. From late-night hackathons and hands-on build sprints to demo days in front of industry veterans, we give you the launchpad to stop just talking about AI and start shipping it.",
    approachHeading: "OUR APPROACH",
    approachSubtext: "We foster a dynamic environment where students can transform their ideas into impactful AI and entrepreneurial ventures.",
    approach: [
      {
        id: "app1",
        title: "1. Ideation & Problem Discovery",
        description: "We guide members from initial concepts to well-defined project proposals, encouraging creative problem-solving and patent exploration.",
      },
      {
        id: "app2",
        title: "2. Prototyping & GPU Compute",
        description: "Providing high-performance compute clusters, research lab access, and technical mentorship for rapid iteration.",
      },
      {
        id: "app3",
        title: "3. Venture Incubation & Launch",
        description: "Supporting student founders through legal incorporation, pitch deck polish, and demo day showcases to seed investors.",
      },
      {
        id: "app4",
        title: "4. Community & Knowledge Transfer",
        description: "Building an enduring alumni and mentor network, hosting weekly paper reading groups, and sharing open-source code.",
      },
    ],
    teamSubheading: "MENTORSHIP & GOVERNANCE",
    teamHeading: "LEADERSHIP & ADVISORY",
    teamMembers: [
      {
        id: "tm-1",
        name: "Dr. Jayavrinda Vrindavanam",
        role: "Club Coordinator & Chairperson CSE (AI & ML)",
        image: "/images/rectangle-899.png",
      },
      {
        id: "tm-2",
        name: "Dr. M Lakshmanan",
        role: "Club Advisor",
        image: "/images/rectangle-898.png",
      },
      {
        id: "tm-3",
        name: "Dr. A. A. Nippun Kumaar",
        role: "Club Advisor",
        image: "/images/rectangle-902.png",
      },
    ],
  });

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch("/api/admin/settings");
        if (res.ok) {
          const s: SiteSettings = await res.json();
          setSettings(s);
          setHeroTagline(s.heroTagline || "FORGING THE FUTURE OF ENTREPRENEURSHIP & ARTIFICIAL INTELLIGENCE");
          setHeroSubtext(
            s.heroSubtext ||
              "Dayananda Sagar University's premier innovation ecosystem uniting engineers, designers, researchers, and student founders in artificial intelligence."
          );

          if (s.landingContent) {
            setLandingContent((prev) => ({ ...prev, ...s.landingContent }));
          }
        }
      } catch (err: any) {
        setErrorMessage("Failed to load landing page configuration.");
      }
    }
    loadData();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    try {
      if (settings) {
        const updatedLandingContent: LandingCustomContent = {
          ...landingContent,
          heroTagline,
          heroSubtext,
        };

        const updatedSettings: SiteSettings = {
          ...settings,
          heroTagline,
          heroSubtext,
          landingContent: updatedLandingContent,
        };

        const sRes = await fetch("/api/admin/settings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedSettings),
        });

        if (!sRes.ok) throw new Error("Failed to save landing page settings.");
      }

      setStatus("saved");
      setTimeout(() => setStatus("idle"), 3000);
    } catch (err: any) {
      setStatus("error");
      setErrorMessage(err.message || "Failed to update landing page.");
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-100 text-cyan-800 text-[11px] font-extrabold uppercase tracking-wider mb-2 border border-cyan-200">
            <Sparkles className="size-3 text-cyan-600" />
            <span>Landing Page Visual CMS</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Homepage Content Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Direct real-time editor for active sections displayed on the new main landing page.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-full border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-xs no-underline"
          >
            <Eye className="size-3.5 text-cyan-600" />
            <span>Preview Live Site</span>
          </a>
        </div>
      </div>

      {status === "saved" && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
          <span>All Landing Page changes saved &amp; synchronized live across the website!</span>
        </div>
      )}

      {status === "error" && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs font-bold flex items-center gap-2">
          <AlertCircle className="size-4 text-red-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-8">
        {/* ===== BOX 1: HERO DISPLAY & TAGLINES ===== */}
        <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white/80 shadow-sm space-y-6">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Sparkles className="size-5 text-cyan-600" />
            <h2 className="text-base font-extrabold uppercase tracking-wide text-slate-900">
              1. Hero Display &amp; Taglines
            </h2>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
                Top Hero Badge
              </label>
              <input
                type="text"
                value={landingContent.heroBadge || ""}
                onChange={(e) => setLandingContent({ ...landingContent, heroBadge: e.target.value })}
                placeholder="DSU PREMIER AI & VENTURE ACCELERATOR"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white font-bold text-slate-900 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
                Main Hero Tagline (Display Title)
              </label>
              <input
                type="text"
                value={heroTagline}
                onChange={(e) => setHeroTagline(e.target.value)}
                placeholder="FORGING THE FUTURE OF ENTREPRENEURSHIP & ARTIFICIAL INTELLIGENCE"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white font-bold text-slate-900 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
                Hero Subtext Paragraph
              </label>
              <textarea
                rows={2}
                value={heroSubtext}
                onChange={(e) => setHeroSubtext(e.target.value)}
                placeholder="Dayananda Sagar University's premier innovation ecosystem uniting engineers, designers, researchers, and student founders in artificial intelligence."
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 font-medium focus:outline-none focus:border-cyan-500 leading-relaxed"
              />
            </div>

            <div>
              <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
                Campus &amp; Department Footnote
              </label>
              <input
                type="text"
                value={landingContent.heroDepartment || ""}
                onChange={(e) => setLandingContent({ ...landingContent, heroDepartment: e.target.value })}
                placeholder="School of Engineering • Department of AI & Robotics • DSU Bengaluru"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white font-medium text-slate-800 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>
        </div>

        {/* ===== BOX 2: ABOUT US SECTION ===== */}
        <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white/80 shadow-sm space-y-6">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Layers className="size-5 text-cyan-600" />
            <h2 className="text-base font-extrabold uppercase tracking-wide text-slate-900">
              2. About Us Section
            </h2>
          </div>

          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Section Badge
                </label>
                <input
                  type="text"
                  value={landingContent.aboutBadge || ""}
                  onChange={(e) => setLandingContent({ ...landingContent, aboutBadge: e.target.value })}
                  placeholder="ABOUT AI FOUNDRY"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white font-bold text-slate-900 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Section Title / Main Heading
                </label>
                <input
                  type="text"
                  value={landingContent.aboutTitle || ""}
                  onChange={(e) => setLandingContent({ ...landingContent, aboutTitle: e.target.value })}
                  placeholder="About Us"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white font-bold text-slate-900 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
                Primary Description Paragraph
              </label>
              <textarea
                rows={3}
                value={landingContent.aboutHeading || ""}
                onChange={(e) => setLandingContent({ ...landingContent, aboutHeading: e.target.value })}
                placeholder="AI Foundry is the go-to spot for student creators at Dayananda Sagar University..."
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white font-medium text-slate-900 focus:outline-none focus:border-cyan-500 leading-relaxed"
              />
            </div>

            <div>
              <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
                Secondary Exploration Paragraph
              </label>
              <textarea
                rows={3}
                value={landingContent.aboutSecondaryText || ""}
                onChange={(e) => setLandingContent({ ...landingContent, aboutSecondaryText: e.target.value })}
                placeholder="Whether you're fine-tuning custom LLMs, building autonomous agents, designing slick interfaces..."
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 font-medium focus:outline-none focus:border-cyan-500 leading-relaxed"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-bold uppercase tracking-wider text-slate-700">
                  About Section Featured Image URL
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setPreviewConfig({
                      title: "About Us Feature Image Preview & Framing",
                      imageUrl: landingContent.aboutImage || "/images/Gemini_Generated_Image_arpro7arpro7arpr.png",
                      imageFit: landingContent.aboutImageFit || "cover",
                      imagePosition: landingContent.aboutImagePosition || "center",
                      aspectRatioType: "about",
                      cardTitle: landingContent.aboutTitle || "About AI Foundry",
                      onApply: (res) => {
                        setLandingContent({
                          ...landingContent,
                          aboutImage: res.imageUrl,
                          aboutImageFit: res.imageFit,
                          aboutImagePosition: res.imagePosition,
                        });
                      },
                    });
                    setPreviewModalOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-50 hover:bg-cyan-100 text-cyan-700 text-[11px] font-bold transition-colors cursor-pointer"
                >
                  <Eye className="size-3.5" />
                  <span>Preview &amp; Framing</span>
                </button>
              </div>
              <input
                type="text"
                value={landingContent.aboutImage || ""}
                onChange={(e) => setLandingContent({ ...landingContent, aboutImage: e.target.value })}
                placeholder="/images/Gemini_Generated_Image_arpro7arpro7arpr.png or https://drive.google.com/..."
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white font-mono text-xs text-slate-800 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>
        </div>

        {/* ===== BOX 3: OUR APPROACH (4 STAGES) ===== */}
        <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white/80 shadow-sm space-y-6">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Compass className="size-5 text-cyan-600" />
            <h2 className="text-base font-extrabold uppercase tracking-wide text-slate-900">
              3. Our Approach (4 Methodological Pillars)
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
                Section Heading
              </label>
              <input
                type="text"
                value={landingContent.approachHeading || "OUR APPROACH"}
                onChange={(e) => setLandingContent({ ...landingContent, approachHeading: e.target.value })}
                placeholder="OUR APPROACH"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white font-bold text-slate-900 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
                Section Subtitle
              </label>
              <input
                type="text"
                value={landingContent.approachSubtext || ""}
                onChange={(e) => setLandingContent({ ...landingContent, approachSubtext: e.target.value })}
                placeholder="We foster a dynamic environment where students can transform their ideas into impactful AI and entrepreneurial ventures."
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white font-medium text-slate-800 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 text-xs">
            {(landingContent.approach || []).map((step, idx) => (
              <div key={step.id || idx} className="p-4 rounded-2xl bg-white border border-slate-200 space-y-3">
                <span className="font-extrabold text-cyan-700 uppercase tracking-widest text-[10px]">
                  Pillar #{idx + 1}
                </span>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Title</label>
                  <input
                    type="text"
                    value={step.title}
                    onChange={(e) => {
                      const updated = [...(landingContent.approach || [])];
                      updated[idx].title = e.target.value;
                      setLandingContent({ ...landingContent, approach: updated });
                    }}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 font-bold text-slate-900 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Description</label>
                  <textarea
                    rows={3}
                    value={step.description}
                    onChange={(e) => {
                      const updated = [...(landingContent.approach || [])];
                      updated[idx].description = e.target.value;
                      setLandingContent({ ...landingContent, approach: updated });
                    }}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-700 font-medium focus:outline-none focus:border-cyan-500 leading-relaxed"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ===== BOX 4: LEADERSHIP & ADVISORY SHOWCASE ===== */}
        <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white/80 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Award className="size-5 text-cyan-600" />
              <h2 className="text-base font-extrabold uppercase tracking-wide text-slate-900">
                4. Leadership &amp; Advisory Showcase
              </h2>
            </div>
            <button
              type="button"
              onClick={() => {
                const updated = [
                  ...(landingContent.teamMembers || []),
                  {
                    id: `tm-${Date.now()}`,
                    name: "Advisor Name",
                    role: "Club Advisor",
                    image: "/images/rectangle-899.png",
                  },
                ];
                setLandingContent({ ...landingContent, teamMembers: updated });
              }}
              className="px-3 py-1.5 rounded-lg text-xs font-bold text-cyan-700 bg-cyan-50 hover:bg-cyan-100 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Plus className="size-3.5" />
              <span>Add Member Card</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
                Section Subheading
              </label>
              <input
                type="text"
                value={landingContent.teamSubheading || "MENTORSHIP & GOVERNANCE"}
                onChange={(e) =>
                  setLandingContent({ ...landingContent, teamSubheading: e.target.value })
                }
                placeholder="MENTORSHIP & GOVERNANCE"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white font-bold text-slate-900 focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
                Main Heading
              </label>
              <input
                type="text"
                value={landingContent.teamHeading || "LEADERSHIP & ADVISORY"}
                onChange={(e) =>
                  setLandingContent({ ...landingContent, teamHeading: e.target.value })
                }
                placeholder="LEADERSHIP & ADVISORY"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white font-bold text-slate-900 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            {(landingContent.teamMembers || []).map((member, idx) => (
              <div
                key={member.id || idx}
                className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-3 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700 uppercase text-[11px]">
                    Leader #{idx + 1}
                  </span>
                  {(landingContent.teamMembers || []).length > 1 && (
                    <button
                      type="button"
                      onClick={() => {
                        const updated = (landingContent.teamMembers || []).filter((_, i) => i !== idx);
                        setLandingContent({ ...landingContent, teamMembers: updated });
                      }}
                      className="text-red-500 hover:text-red-700 text-xs font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="size-3" />
                      <span>Remove</span>
                    </button>
                  )}
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={member.name}
                    onChange={(e) => {
                      const updated = [...(landingContent.teamMembers || [])];
                      updated[idx].name = e.target.value;
                      setLandingContent({ ...landingContent, teamMembers: updated });
                    }}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 font-semibold text-slate-900 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Role / Designation</label>
                  <input
                    type="text"
                    value={member.role}
                    onChange={(e) => {
                      const updated = [...(landingContent.teamMembers || [])];
                      updated[idx].role = e.target.value;
                      setLandingContent({ ...landingContent, teamMembers: updated });
                    }}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 font-semibold text-slate-900 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-bold text-slate-700">Photo Image URL</label>
                    <button
                      type="button"
                      onClick={() => {
                        setPreviewConfig({
                          title: `Leadership Card Preview - ${member.name}`,
                          imageUrl: member.image,
                          homeImageUrl: member.homeImage,
                          imageFit: member.imageFit || "cover",
                          imagePosition: member.imagePosition || "center",
                          aspectRatioType: "team",
                          cardTitle: member.name,
                          cardSubtitle: member.role,
                          onApply: (res) => {
                            const updated = [...(landingContent.teamMembers || [])];
                            updated[idx] = {
                              ...updated[idx],
                              image: res.imageUrl,
                              homeImage: res.homeImageUrl,
                              imageFit: res.imageFit,
                              imagePosition: res.imagePosition,
                            };
                            setLandingContent({ ...landingContent, teamMembers: updated });
                          },
                        });
                        setPreviewModalOpen(true);
                      }}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-cyan-50 hover:bg-cyan-100 text-cyan-700 text-[10px] font-bold transition-colors cursor-pointer"
                    >
                      <Eye className="size-3" />
                      <span>Preview</span>
                    </button>
                  </div>
                  <input
                    type="text"
                    value={member.image}
                    onChange={(e) => {
                      const updated = [...(landingContent.teamMembers || [])];
                      updated[idx].image = e.target.value;
                      setLandingContent({ ...landingContent, teamMembers: updated });
                    }}
                    placeholder="/images/rectangle-899.png"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 font-mono text-[11px] text-slate-600 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sticky Save Action Bar */}
        <div className="sticky bottom-6 z-30 glass-card rounded-2xl p-4 border border-white/90 shadow-xl flex items-center justify-between gap-4">
          <span className="text-xs text-slate-600 font-medium">
            Remember to save your changes to publish them to the live website.
          </span>
          <button
            type="submit"
            disabled={status === "loading"}
            className="flex items-center gap-2 px-8 py-3 rounded-full font-bold text-xs sm:text-sm text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 shadow-md shadow-cyan-600/20 transition-all hover:scale-105 active:scale-95 cursor-pointer disabled:opacity-50"
          >
            <Save className="size-4" />
            <span>{status === "loading" ? "Publishing Changes..." : "Save & Revalidate Live Site"}</span>
          </button>
        </div>
      </form>

      {/* Visual Image Preview & Framing Inspector Modal */}
      {previewConfig && (
        <ImagePreviewModal
          isOpen={previewModalOpen}
          onClose={() => {
            setPreviewModalOpen(false);
            setPreviewConfig(null);
          }}
          title={previewConfig.title}
          imageUrl={previewConfig.imageUrl}
          homeImageUrl={previewConfig.homeImageUrl}
          imageFit={previewConfig.imageFit}
          imagePosition={previewConfig.imagePosition}
          aspectRatioType={previewConfig.aspectRatioType}
          cardTitle={previewConfig.cardTitle}
          cardSubtitle={previewConfig.cardSubtitle}
          onApply={previewConfig.onApply}
        />
      )}
    </div>
  );
}
