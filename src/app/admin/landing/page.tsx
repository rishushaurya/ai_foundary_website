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
  BarChart3,
  Megaphone,
  Workflow,
  Plus,
  Trash2,
} from "lucide-react";
import { SiteSettings, LandingCustomContent } from "@/lib/data";

export default function AdminLandingPage() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "saved" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  // Hero Fields
  const [heroTagline, setHeroTagline] = useState("");
  const [heroSubtext, setHeroSubtext] = useState("");

  // Landing Custom Content Model (exact match to live landing page)
  const [landingContent, setLandingContent] = useState<LandingCustomContent>({
    heroBadge: "DSU PREMIER AI & VENTURE ACCELERATOR",
    heroTagline: "FORGING THE FUTURE OF ENTREPRENEURSHIP & ARTIFICIAL INTELLIGENCE",
    heroSubtext: "Dayananda Sagar University's flagship innovation hub empowering student founders, engineers, and researchers to build and launch cutting-edge AI ventures.",
    heroDepartment: "School of Engineering • Department of AI & Robotics • DSU Bengaluru",
    aboutBadge: "ABOUT AI FOUNDRY",
    aboutHeading: "AI Foundry is the premier student innovation ecosystem established under the Department of Computer Science & Engineering (AI & ML) at Dayananda Sagar University (DSU), Bengaluru.",
    aboutSecondaryText: "AI Foundry is Dayananda Sagar University's flagship technology accelerator and student innovation hub. We bridge the gap between academic exploration and high-impact AI ventures by providing hands-on mentorship, enterprise GPU compute, and a collaborative workspace.",
    pillarsHeading: "Our approach to innovation is built on three core strategies.",
    pillarsSubtext: "Empowering students to lead in AI and entrepreneurship, fostering real-world impact and future-ready skills.",
    pillars: [
      {
        id: "p1",
        title: "Innovation",
        description: "We encourage groundbreaking ideas and provide GPU compute, lab access, and development toolkits for members to explore the frontiers of AI.",
      },
      {
        id: "p2",
        title: "Collaboration",
        description: "We believe in the power of diverse minds working together, fostering a supportive cross-disciplinary environment for peer learning and growth.",
      },
      {
        id: "p3",
        title: "Impact",
        description: "Our projects aim to solve real-world problems, making a tangible difference across healthcare, robotics, education, and venture incubation.",
      },
    ],
    approachHeading: "Where your ambition meets innovation.",
    approachSubtext: "We foster a dynamic environment where students can transform their ideas into impactful AI and entrepreneurial ventures.",
    approach: [
      {
        id: "app1",
        title: "1. Ideation",
        description: "We guide members from initial concepts to well-defined project proposals, encouraging creative problem-solving and venture scoping.",
        image: "/images/rectangle-5.png",
      },
      {
        id: "app2",
        title: "2. Development",
        description: "Providing tools, GPU compute clusters, mentorship, and a collaborative space for building production-grade AI solutions.",
      },
      {
        id: "app3",
        title: "3. Launch",
        description: "Supporting projects through deployment, venture accelerator pitch demo days, and continuous real-world user testing.",
        image: "/images/map.png",
      },
      {
        id: "app4",
        title: "4. Mentorship",
        description: "Connecting students with faculty advisors and industry executives for deep architectural and venture guidance.",
      },
      {
        id: "app5",
        title: "5. Community & Growth",
        description: "Building a strong, lifelong alumni and student network across Bangalore's tech ecosystem, fostering peer collaboration and opportunities.",
        image: "/images/rectangle-8.png",
      },
    ],
    processHeading: "How we forge the future.",
    process: [
      { num: "01", title: "Idea Generation", desc: "Brainstorming and refining concepts within our collaborative workshops and 24-hour hackathons." },
      { num: "02", title: "Team Formation", desc: "Connecting students with complementary technical and design skills to form interdisciplinary squads." },
      { num: "03", title: "Project Incubation", desc: "Providing GPU compute, mentorship, and a supportive environment for full-stack prototype development." },
      { num: "04", title: "Showcase & Launch", desc: "Presenting completed projects to the tech community, investors, and supporting venture deployment." },
    ],
    statsHeading: "We're building a vibrant ecosystem.",
    stats: {
      members: "50+",
      membersLabel: "Active Members",
      projects: "15+",
      projectsLabel: "Successful Sprints",
      duration: "1 Year",
      durationLabel: "Since Inception",
      mentors: "20+",
      mentorsLabel: "Industry Mentors",
      costReduction: "50%",
      costReductionLabel: "Build Time Saved",
      innovationHours: "500+ hrs",
      innovationHoursLabel: "Innovation Time",
    },
    teamSubheading: "LEADERSHIP & ADVISORY",
    teamHeading: "Meet the minds behind AI Foundry.",
    teamDescription: "Visionary faculty advisors and dedicated student leaders guiding innovation and community initiatives.",
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
    ctaHeading: "Ready to forge the future?",
    ctaDescription: "Join Dayananda Sagar University's premier venture and AI club. Build, collaborate, and launch alongside elite engineers.",
    ctaButtonText: "Apply to Join Us",
  });

  useEffect(() => {
    async function loadData() {
      try {
        const settingsRes = await fetch("/api/admin/settings");
        if (settingsRes.ok) {
          const s = await settingsRes.json();
          setSettings(s);
          setHeroTagline(s.heroTagline || "FORGING THE FUTURE OF ENTREPRENEURSHIP & ARTIFICIAL INTELLIGENCE");
          setHeroSubtext(s.heroSubtext || "Dayananda Sagar University's flagship innovation hub empowering student founders, engineers, and researchers to build and launch cutting-edge AI ventures.");
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
            Direct real-time editor for all 8 sections displayed on the main landing page.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-full border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-xs"
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
                placeholder="Dayananda Sagar University's flagship innovation hub empowering student founders, engineers, and researchers to build and launch cutting-edge AI ventures."
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

        {/* ===== BOX 2: ABOUT AI FOUNDRY SECTION ===== */}
        <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white/80 shadow-sm space-y-6">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Layers className="size-5 text-cyan-600" />
            <h2 className="text-base font-extrabold uppercase tracking-wide text-slate-900">
              2. About AI Foundry Section
            </h2>
          </div>

          <div className="space-y-4 text-xs">
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
                Main Headline Statement
              </label>
              <textarea
                rows={2}
                value={landingContent.aboutHeading || ""}
                onChange={(e) => setLandingContent({ ...landingContent, aboutHeading: e.target.value })}
                placeholder="AI Foundry is the premier student innovation ecosystem established under the Department of Computer Science & Engineering (AI & ML) at Dayananda Sagar University (DSU), Bengaluru."
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white font-bold text-slate-900 focus:outline-none focus:border-cyan-500 leading-relaxed"
              />
            </div>

            <div>
              <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
                Description Paragraph
              </label>
              <textarea
                rows={3}
                value={landingContent.aboutSecondaryText || ""}
                onChange={(e) => setLandingContent({ ...landingContent, aboutSecondaryText: e.target.value })}
                placeholder="AI Foundry is Dayananda Sagar University's flagship technology accelerator and student innovation hub. We bridge the gap between academic exploration and high-impact AI ventures by providing hands-on mentorship, enterprise GPU compute, and a collaborative workspace."
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 font-medium focus:outline-none focus:border-cyan-500 leading-relaxed"
              />
            </div>
          </div>
        </div>

        {/* ===== BOX 3: OUR 3 CORE PILLARS ===== */}
        <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white/80 shadow-sm space-y-6">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Award className="size-5 text-cyan-600" />
            <h2 className="text-base font-extrabold uppercase tracking-wide text-slate-900">
              3. Our 3 Core Pillars
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
                Section Heading
              </label>
              <input
                type="text"
                value={landingContent.pillarsHeading || ""}
                onChange={(e) => setLandingContent({ ...landingContent, pillarsHeading: e.target.value })}
                placeholder="Our approach to innovation is built on three core strategies."
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white font-bold text-slate-900 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
                Section Subtitle
              </label>
              <input
                type="text"
                value={landingContent.pillarsSubtext || ""}
                onChange={(e) => setLandingContent({ ...landingContent, pillarsSubtext: e.target.value })}
                placeholder="Empowering students to lead in AI and entrepreneurship, fostering real-world impact and future-ready skills."
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white font-medium text-slate-800 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
            {(landingContent.pillars || []).map((pillar, idx) => (
              <div key={pillar.id || idx} className="p-5 rounded-2xl bg-white border border-slate-200 space-y-3">
                <span className="font-extrabold text-cyan-700 uppercase tracking-widest text-[10px]">
                  Pillar #{idx + 1}
                </span>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Pillar Title</label>
                  <input
                    type="text"
                    value={pillar.title}
                    onChange={(e) => {
                      const updated = [...(landingContent.pillars || [])];
                      updated[idx].title = e.target.value;
                      setLandingContent({ ...landingContent, pillars: updated });
                    }}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 font-bold text-slate-900 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Description</label>
                  <textarea
                    rows={3}
                    value={pillar.description}
                    onChange={(e) => {
                      const updated = [...(landingContent.pillars || [])];
                      updated[idx].description = e.target.value;
                      setLandingContent({ ...landingContent, pillars: updated });
                    }}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-700 font-medium focus:outline-none focus:border-cyan-500 leading-relaxed"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ===== BOX 4: OUR APPROACH (5 STEPS) ===== */}
        <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white/80 shadow-sm space-y-6">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Compass className="size-5 text-cyan-600" />
            <h2 className="text-base font-extrabold uppercase tracking-wide text-slate-900">
              4. Our Approach &amp; Journey (5 Stages)
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
                Section Heading
              </label>
              <input
                type="text"
                value={landingContent.approachHeading || ""}
                onChange={(e) => setLandingContent({ ...landingContent, approachHeading: e.target.value })}
                placeholder="Where your ambition meets innovation."
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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 text-xs">
            {(landingContent.approach || []).map((step, idx) => (
              <div key={step.id || idx} className="p-4 rounded-2xl bg-white border border-slate-200 space-y-3">
                <span className="font-extrabold text-cyan-700 uppercase tracking-widest text-[10px]">
                  Step #{idx + 1}
                </span>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Step Title</label>
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
                {step.image !== undefined && (
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Artwork / Image Link</label>
                    <input
                      type="text"
                      value={step.image || ""}
                      onChange={(e) => {
                        const updated = [...(landingContent.approach || [])];
                        updated[idx].image = e.target.value;
                        setLandingContent({ ...landingContent, approach: updated });
                      }}
                      placeholder="/images/rectangle-5.png"
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 font-mono text-[11px] text-slate-600 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ===== BOX 5: OUR PROCESS (4 STAGES) ===== */}
        <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white/80 shadow-sm space-y-6">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Workflow className="size-5 text-cyan-600" />
            <h2 className="text-base font-extrabold uppercase tracking-wide text-slate-900">
              5. Our Process (4 Stages)
            </h2>
          </div>

          <div>
            <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1 text-xs">
              Section Heading
            </label>
            <input
              type="text"
              value={landingContent.processHeading || "How we forge the future."}
              onChange={(e) => setLandingContent({ ...landingContent, processHeading: e.target.value })}
              placeholder="How we forge the future."
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white font-bold text-slate-900 text-xs focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 text-xs">
            {(landingContent.process || []).map((step, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-white border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-cyan-700 uppercase tracking-widest text-[10px]">
                    Stage #{step.num}
                  </span>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Stage Title</label>
                  <input
                    type="text"
                    value={step.title}
                    onChange={(e) => {
                      const updated = [...(landingContent.process || [])];
                      updated[idx].title = e.target.value;
                      setLandingContent({ ...landingContent, process: updated });
                    }}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 font-bold text-slate-900 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Description</label>
                  <textarea
                    rows={3}
                    value={step.desc}
                    onChange={(e) => {
                      const updated = [...(landingContent.process || [])];
                      updated[idx].desc = e.target.value;
                      setLandingContent({ ...landingContent, process: updated });
                    }}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-700 font-medium focus:outline-none focus:border-cyan-500 leading-relaxed"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ===== BOX 6: CLUB STATS (6 METRICS) ===== */}
        <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white/80 shadow-sm space-y-6">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <BarChart3 className="size-5 text-cyan-600" />
            <h2 className="text-base font-extrabold uppercase tracking-wide text-slate-900">
              6. Club Stats (6 Metrics)
            </h2>
          </div>

          <div>
            <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1 text-xs">
              Section Heading
            </label>
            <input
              type="text"
              value={landingContent.statsHeading || "We're building a vibrant ecosystem."}
              onChange={(e) => setLandingContent({ ...landingContent, statsHeading: e.target.value })}
              placeholder="We're building a vibrant ecosystem."
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white font-bold text-slate-900 text-xs focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 text-xs">
            <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-2">
              <label className="block font-bold text-slate-700 text-[11px]">Metric 1 Value</label>
              <input
                type="text"
                value={landingContent.stats?.members || "50+"}
                onChange={(e) =>
                  setLandingContent({
                    ...landingContent,
                    stats: { ...(landingContent.stats as any), members: e.target.value },
                  })
                }
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 font-black text-slate-900"
              />
              <label className="block font-bold text-slate-500 text-[10px]">Label</label>
              <input
                type="text"
                value={landingContent.stats?.membersLabel || "Active Members"}
                onChange={(e) =>
                  setLandingContent({
                    ...landingContent,
                    stats: { ...(landingContent.stats as any), membersLabel: e.target.value },
                  })
                }
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-700 text-[11px]"
              />
            </div>

            <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-2">
              <label className="block font-bold text-slate-700 text-[11px]">Metric 2 Value</label>
              <input
                type="text"
                value={landingContent.stats?.projects || "15+"}
                onChange={(e) =>
                  setLandingContent({
                    ...landingContent,
                    stats: { ...(landingContent.stats as any), projects: e.target.value },
                  })
                }
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 font-black text-slate-900"
              />
              <label className="block font-bold text-slate-500 text-[10px]">Label</label>
              <input
                type="text"
                value={landingContent.stats?.projectsLabel || "Successful Sprints"}
                onChange={(e) =>
                  setLandingContent({
                    ...landingContent,
                    stats: { ...(landingContent.stats as any), projectsLabel: e.target.value },
                  })
                }
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-700 text-[11px]"
              />
            </div>

            <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-2">
              <label className="block font-bold text-slate-700 text-[11px]">Metric 3 Value</label>
              <input
                type="text"
                value={landingContent.stats?.duration || "1 Year"}
                onChange={(e) =>
                  setLandingContent({
                    ...landingContent,
                    stats: { ...(landingContent.stats as any), duration: e.target.value },
                  })
                }
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 font-black text-slate-900"
              />
              <label className="block font-bold text-slate-500 text-[10px]">Label</label>
              <input
                type="text"
                value={landingContent.stats?.durationLabel || "Since Inception"}
                onChange={(e) =>
                  setLandingContent({
                    ...landingContent,
                    stats: { ...(landingContent.stats as any), durationLabel: e.target.value },
                  })
                }
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-700 text-[11px]"
              />
            </div>

            <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-2">
              <label className="block font-bold text-slate-700 text-[11px]">Metric 4 Value</label>
              <input
                type="text"
                value={landingContent.stats?.mentors || "20+"}
                onChange={(e) =>
                  setLandingContent({
                    ...landingContent,
                    stats: { ...(landingContent.stats as any), mentors: e.target.value },
                  })
                }
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 font-black text-slate-900"
              />
              <label className="block font-bold text-slate-500 text-[10px]">Label</label>
              <input
                type="text"
                value={landingContent.stats?.mentorsLabel || "Industry Mentors"}
                onChange={(e) =>
                  setLandingContent({
                    ...landingContent,
                    stats: { ...(landingContent.stats as any), mentorsLabel: e.target.value },
                  })
                }
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-700 text-[11px]"
              />
            </div>

            <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-2">
              <label className="block font-bold text-slate-700 text-[11px]">Metric 5 Value</label>
              <input
                type="text"
                value={landingContent.stats?.costReduction || "50%"}
                onChange={(e) =>
                  setLandingContent({
                    ...landingContent,
                    stats: { ...(landingContent.stats as any), costReduction: e.target.value },
                  })
                }
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 font-black text-slate-900"
              />
              <label className="block font-bold text-slate-500 text-[10px]">Label</label>
              <input
                type="text"
                value={landingContent.stats?.costReductionLabel || "Build Time Saved"}
                onChange={(e) =>
                  setLandingContent({
                    ...landingContent,
                    stats: { ...(landingContent.stats as any), costReductionLabel: e.target.value },
                  })
                }
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-700 text-[11px]"
              />
            </div>

            <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-2">
              <label className="block font-bold text-slate-700 text-[11px]">Metric 6 Value</label>
              <input
                type="text"
                value={landingContent.stats?.innovationHours || "500+ hrs"}
                onChange={(e) =>
                  setLandingContent({
                    ...landingContent,
                    stats: { ...(landingContent.stats as any), innovationHours: e.target.value },
                  })
                }
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 font-black text-slate-900"
              />
              <label className="block font-bold text-slate-500 text-[10px]">Label</label>
              <input
                type="text"
                value={landingContent.stats?.innovationHoursLabel || "Innovation Time"}
                onChange={(e) =>
                  setLandingContent({
                    ...landingContent,
                    stats: { ...(landingContent.stats as any), innovationHoursLabel: e.target.value },
                  })
                }
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-700 text-[11px]"
              />
            </div>
          </div>
        </div>

        {/* ===== BOX 7: LEADERSHIP & ADVISORY SHOWCASE ===== */}
        <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white/80 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Award className="size-5 text-cyan-600" />
              <h2 className="text-base font-extrabold uppercase tracking-wide text-slate-900">
                7. Leadership &amp; Advisory Showcase
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
                value={landingContent.teamSubheading || ""}
                onChange={(e) =>
                  setLandingContent({ ...landingContent, teamSubheading: e.target.value })
                }
                placeholder="LEADERSHIP & ADVISORY"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white font-bold text-slate-900 focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
                Main Heading
              </label>
              <input
                type="text"
                value={landingContent.teamHeading || ""}
                onChange={(e) =>
                  setLandingContent({ ...landingContent, teamHeading: e.target.value })
                }
                placeholder="Meet the minds behind AI Foundry."
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
                  <label className="block font-bold text-slate-700 mb-1">Photo Image URL</label>
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

        {/* ===== BOX 8: BOTTOM CTA ===== */}
        <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white/80 shadow-sm space-y-6">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Megaphone className="size-5 text-cyan-600" />
            <h2 className="text-base font-extrabold uppercase tracking-wide text-slate-900">
              8. Bottom Call to Action
            </h2>
          </div>

          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
                  CTA Heading
                </label>
                <input
                  type="text"
                  value={landingContent.ctaHeading || ""}
                  onChange={(e) =>
                    setLandingContent({ ...landingContent, ctaHeading: e.target.value })
                  }
                  placeholder="Ready to forge the future?"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white font-bold text-slate-900 focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Button Label
                </label>
                <input
                  type="text"
                  value={landingContent.ctaButtonText || ""}
                  onChange={(e) =>
                    setLandingContent({ ...landingContent, ctaButtonText: e.target.value })
                  }
                  placeholder="Apply to Join Us"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white font-bold text-slate-900 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
                Description Subtext
              </label>
              <textarea
                rows={2}
                value={landingContent.ctaDescription || ""}
                onChange={(e) =>
                  setLandingContent({ ...landingContent, ctaDescription: e.target.value })
                }
                placeholder="Join Dayananda Sagar University's premier venture and AI club. Build, collaborate, and launch alongside elite engineers."
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 font-medium focus:outline-none focus:border-cyan-500 leading-relaxed"
              />
            </div>
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
    </div>
  );
}
