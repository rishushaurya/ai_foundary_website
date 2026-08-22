"use client";

import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Save,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Eye,
  Layers,
  Award,
  FolderGit2,
  Compass,
  BarChart3,
  MessageSquareQuote,
  Megaphone,
} from "lucide-react";
import { SiteSettings, ContentSection, LandingCustomContent } from "@/lib/data";

export default function AdminLandingPage() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [content, setContent] = useState<ContentSection[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "saved" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  // Hero Fields
  const [heroTagline, setHeroTagline] = useState("");
  const [heroSubtext, setHeroSubtext] = useState("");

  // Landing Custom Content Model
  const [landingContent, setLandingContent] = useState<LandingCustomContent>({
    aboutHeading: "ABOUT US",
    aboutText: "To cultivate a vibrant community at DSU, fostering innovation in AI and entrepreneurship through collaborative projects.",
    missionHeading: "OUR MISSION",
    missionText: "Uniting minds, shaping tomorrow.",
    pillarsHeading: "OUR PILLARS",
    pillarsSubtext: "Our approach to innovation is built on three core strategies.",
    pillars: [
      {
        id: "p1",
        title: "Innovation",
        description: "We encourage groundbreaking ideas and provide the resources for members to explore the frontiers of AI and business.",
        icon: "/images/asterisk-streamline-unicons.svg",
      },
      {
        id: "p2",
        title: "Collaboration",
        description: "We believe in the power of diverse minds working together, fostering a supportive environment for shared learning and growth.",
        icon: "/images/channel-streamline-unicons.svg",
      },
      {
        id: "p3",
        title: "Impact",
        description: "Our projects aim to solve real-world problems, making a tangible difference in the community and beyond.",
        icon: "/images/border-vertical-streamline-unicons.svg",
      },
    ],
    projectsHeading: "OUR PROJECTS",
    projectsSubtext: "Explore our innovative projects, where theory meets practice in the exciting fields of AI and entrepreneurship, driving real change.",
    projects: [
      {
        id: "proj1",
        title: "Project Alpha",
        tag: "AI & ML",
        description: "An AI-powered solution for optimizing campus resource allocation, developed by our student engineers.",
        image: "/images/rectangle-902.png",
      },
      {
        id: "proj2",
        title: "Venture Beta",
        tag: "Incubation",
        description: "A student-led startup focusing on sustainable urban farming using intelligent automation and data analytics.",
        image: "/images/image-1929.png",
      },
      {
        id: "proj3",
        title: "Research Gamma",
        tag: "Research",
        description: "Cutting-edge research into explainable AI for ethical decision-making in financial technology.",
        image: "/images/rectangle-3.png",
      },
    ],
    approachHeading: "OUR APPROACH",
    approachSubtext: "We foster a dynamic environment where students can transform their ideas into impactful AI and entrepreneurial ventures.",
    approach: [
      {
        id: "app1",
        title: "Ideation",
        description: "We guide members from initial concepts to well-defined project proposals, encouraging creative problem-solving.",
        image: "/images/rectangle-5.png",
      },
      {
        id: "app2",
        title: "Development",
        description: "Providing tools, mentorship, and a collaborative space for building and refining AI solutions and business models.",
      },
      {
        id: "app3",
        title: "Launch",
        description: "Supporting projects through deployment, market entry, and continuous iteration for sustained success.",
        image: "/images/map.png",
      },
      {
        id: "app4",
        title: "Community",
        description: "Building a strong network of innovators, fostering peer learning and collaborative opportunities.",
        image: "/images/rectangle-8.png",
      },
    ],
    stats: {
      members: "50 +",
      projects: "x 15",
      duration: "1 year",
      mentors: "+ 20",
      costReduction: "- 50%",
      innovationHours: "500 hrs",
    },
    testimonialsHeading: "Hear it from our members.",
    testimonials: [
      {
        id: "t1",
        name: "Aisha Sharma",
        role: "Student Founder, DSU",
        quote: "Ai Foundry transformed my understanding of AI and gave me the confidence to launch my own startup idea.",
        avatar: "/images/image-1931.png",
      },
      {
        id: "t2",
        name: "Rahul Verma",
        role: "Engineering Student, DSU",
        quote: "The collaborative environment here is unparalleled. I've learned so much from my peers and mentors.",
        avatar: "/images/image-1927.png",
      },
      {
        id: "t3",
        name: "Priya Singh",
        role: "Design Student, DSU",
        quote: "Being part of Ai Foundry has opened doors to incredible opportunities and a network I wouldn't have otherwise.",
        avatar: "/images/image-1928.png",
      },
    ],
    ctaHeading: "Ready to forge the future?",
    ctaButtonText: "Join Us",
  });

  useEffect(() => {
    async function loadData() {
      try {
        const [settingsRes, contentRes] = await Promise.all([
          fetch("/api/admin/settings"),
          fetch("/api/admin/content"),
        ]);
        if (settingsRes.ok) {
          const s = await settingsRes.json();
          setSettings(s);
          setHeroTagline(s.heroTagline || "");
          setHeroSubtext(s.heroSubtext || "");
          if (s.landingContent) {
            setLandingContent((prev) => ({ ...prev, ...s.landingContent }));
          }
        }
        if (contentRes.ok) {
          const c: ContentSection[] = await contentRes.json();
          setContent(c);
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
        const updatedSettings: SiteSettings = {
          ...settings,
          heroTagline,
          heroSubtext,
          landingContent,
        };
        const sRes = await fetch("/api/admin/settings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedSettings),
        });
        if (!sRes.ok) throw new Error("Failed to save hero settings.");
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
            <span>Visual Landing Page CMS</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Homepage &amp; 3D Scene Content
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Customize all copy, pillars, project cards, stats, approach steps, and testimonials in real time.
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
          <span>All Landing Page changes saved &amp; revalidated live across the website!</span>
        </div>
      )}

      {status === "error" && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs font-bold flex items-center gap-2">
          <AlertCircle className="size-4 text-red-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-8">
        {/* ===== BOX 1: 3D HERO SECTION ===== */}
        <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white/80 shadow-sm space-y-6">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Sparkles className="size-5 text-cyan-600" />
            <h2 className="text-base font-extrabold uppercase tracking-wide text-slate-900">
              1. Hero 3D Title &amp; Subtitle
            </h2>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
                Main Hero Tagline (Large Display Text)
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
                Hero Subtext (Subtitle Paragraph)
              </label>
              <textarea
                rows={2}
                value={heroSubtext}
                onChange={(e) => setHeroSubtext(e.target.value)}
                placeholder="Dayananda Sagar University's premier innovation ecosystem uniting engineers, designers, researchers, and student founders."
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 font-medium focus:outline-none focus:border-cyan-500"
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
            <div>
              <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
                Section Heading
              </label>
              <input
                type="text"
                value={landingContent.aboutHeading || ""}
                onChange={(e) =>
                  setLandingContent({ ...landingContent, aboutHeading: e.target.value })
                }
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white font-bold text-slate-900 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
                About Headline &amp; Story Statement
              </label>
              <textarea
                rows={3}
                value={landingContent.aboutText || ""}
                onChange={(e) =>
                  setLandingContent({ ...landingContent, aboutText: e.target.value })
                }
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 font-medium focus:outline-none focus:border-cyan-500 leading-relaxed"
              />
            </div>
          </div>
        </div>

        {/* ===== BOX 3: OUR PILLARS (3 CARDS) ===== */}
        <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white/80 shadow-sm space-y-6">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Award className="size-5 text-cyan-600" />
            <h2 className="text-base font-extrabold uppercase tracking-wide text-slate-900">
              3. Our 3 Core Pillars
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
            {(landingContent.pillars || []).map((pillar, idx) => (
              <div key={pillar.id} className="p-5 rounded-2xl bg-white border border-slate-200 space-y-3">
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
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-700 font-medium focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Icon / SVG URL</label>
                  <input
                    type="text"
                    value={pillar.icon || ""}
                    onChange={(e) => {
                      const updated = [...(landingContent.pillars || [])];
                      updated[idx].icon = e.target.value;
                      setLandingContent({ ...landingContent, pillars: updated });
                    }}
                    placeholder="/images/asterisk-streamline-unicons.svg"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 font-mono text-[11px] text-slate-600 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ===== BOX 4: OUR PROJECTS SHOWCASE ===== */}
        <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white/80 shadow-sm space-y-6">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <FolderGit2 className="size-5 text-cyan-600" />
            <h2 className="text-base font-extrabold uppercase tracking-wide text-slate-900">
              4. Featured Project Showcases
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
            {(landingContent.projects || []).map((project, idx) => (
              <div key={project.id} className="p-5 rounded-2xl bg-white border border-slate-200 space-y-3">
                <span className="font-extrabold text-cyan-700 uppercase tracking-widest text-[10px]">
                  Project #{idx + 1}
                </span>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Project Name</label>
                  <input
                    type="text"
                    value={project.title}
                    onChange={(e) => {
                      const updated = [...(landingContent.projects || [])];
                      updated[idx].title = e.target.value;
                      setLandingContent({ ...landingContent, projects: updated });
                    }}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 font-bold text-slate-900 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Domain Tag</label>
                  <input
                    type="text"
                    value={project.tag}
                    onChange={(e) => {
                      const updated = [...(landingContent.projects || [])];
                      updated[idx].tag = e.target.value;
                      setLandingContent({ ...landingContent, projects: updated });
                    }}
                    placeholder="e.g. AI & ML / Incubation"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 font-semibold text-slate-900 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Description</label>
                  <textarea
                    rows={3}
                    value={project.description}
                    onChange={(e) => {
                      const updated = [...(landingContent.projects || [])];
                      updated[idx].description = e.target.value;
                      setLandingContent({ ...landingContent, projects: updated });
                    }}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-700 font-medium focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Image URL / Direct Link</label>
                  <input
                    type="text"
                    value={project.image}
                    onChange={(e) => {
                      const updated = [...(landingContent.projects || [])];
                      updated[idx].image = e.target.value;
                      setLandingContent({ ...landingContent, projects: updated });
                    }}
                    placeholder="https://drive.google.com/... or /images/..."
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 font-mono text-[11px] text-slate-600 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ===== BOX 5: OUR APPROACH STEPS ===== */}
        <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white/80 shadow-sm space-y-6">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Compass className="size-5 text-cyan-600" />
            <h2 className="text-base font-extrabold uppercase tracking-wide text-slate-900">
              5. Our Approach Steps (Ideation, Dev, Launch, Community)
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 text-xs">
            {(landingContent.approach || []).map((step, idx) => (
              <div key={step.id} className="p-4 rounded-2xl bg-white border border-slate-200 space-y-3">
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
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-700 font-medium focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Image URL</label>
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
              </div>
            ))}
          </div>
        </div>

        {/* ===== BOX 6: CLUB STATS COUNTERS ===== */}
        <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white/80 shadow-sm space-y-6">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <BarChart3 className="size-5 text-cyan-600" />
            <h2 className="text-base font-extrabold uppercase tracking-wide text-slate-900">
              6. Live Club Statistics
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Active Members</label>
              <input
                type="text"
                value={landingContent.stats?.members || "50 +"}
                onChange={(e) =>
                  setLandingContent({
                    ...landingContent,
                    stats: { ...(landingContent.stats as any), members: e.target.value },
                  })
                }
                className="w-full px-3 py-2 rounded-lg border border-slate-200 font-black text-slate-900 focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Projects</label>
              <input
                type="text"
                value={landingContent.stats?.projects || "x 15"}
                onChange={(e) =>
                  setLandingContent({
                    ...landingContent,
                    stats: { ...(landingContent.stats as any), projects: e.target.value },
                  })
                }
                className="w-full px-3 py-2 rounded-lg border border-slate-200 font-black text-slate-900 focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Duration</label>
              <input
                type="text"
                value={landingContent.stats?.duration || "1 year"}
                onChange={(e) =>
                  setLandingContent({
                    ...landingContent,
                    stats: { ...(landingContent.stats as any), duration: e.target.value },
                  })
                }
                className="w-full px-3 py-2 rounded-lg border border-slate-200 font-black text-slate-900 focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Mentors</label>
              <input
                type="text"
                value={landingContent.stats?.mentors || "+ 20"}
                onChange={(e) =>
                  setLandingContent({
                    ...landingContent,
                    stats: { ...(landingContent.stats as any), mentors: e.target.value },
                  })
                }
                className="w-full px-3 py-2 rounded-lg border border-slate-200 font-black text-slate-900 focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Cost Reduction</label>
              <input
                type="text"
                value={landingContent.stats?.costReduction || "- 50%"}
                onChange={(e) =>
                  setLandingContent({
                    ...landingContent,
                    stats: { ...(landingContent.stats as any), costReduction: e.target.value },
                  })
                }
                className="w-full px-3 py-2 rounded-lg border border-slate-200 font-black text-slate-900 focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Innovation Hours</label>
              <input
                type="text"
                value={landingContent.stats?.innovationHours || "500 hrs"}
                onChange={(e) =>
                  setLandingContent({
                    ...landingContent,
                    stats: { ...(landingContent.stats as any), innovationHours: e.target.value },
                  })
                }
                className="w-full px-3 py-2 rounded-lg border border-slate-200 font-black text-slate-900 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>
        </div>

        {/* ===== BOX 7: TESTIMONIALS ===== */}
        <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white/80 shadow-sm space-y-6">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <MessageSquareQuote className="size-5 text-cyan-600" />
            <h2 className="text-base font-extrabold uppercase tracking-wide text-slate-900">
              7. Member Testimonials
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
            {(landingContent.testimonials || []).map((test, idx) => (
              <div key={test.id} className="p-5 rounded-2xl bg-white border border-slate-200 space-y-3">
                <span className="font-extrabold text-cyan-700 uppercase tracking-widest text-[10px]">
                  Quote #{idx + 1}
                </span>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Student Name</label>
                  <input
                    type="text"
                    value={test.name}
                    onChange={(e) => {
                      const updated = [...(landingContent.testimonials || [])];
                      updated[idx].name = e.target.value;
                      setLandingContent({ ...landingContent, testimonials: updated });
                    }}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 font-bold text-slate-900 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Role / Department</label>
                  <input
                    type="text"
                    value={test.role}
                    onChange={(e) => {
                      const updated = [...(landingContent.testimonials || [])];
                      updated[idx].role = e.target.value;
                      setLandingContent({ ...landingContent, testimonials: updated });
                    }}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 font-semibold text-slate-900 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Testimonial Quote</label>
                  <textarea
                    rows={3}
                    value={test.quote}
                    onChange={(e) => {
                      const updated = [...(landingContent.testimonials || [])];
                      updated[idx].quote = e.target.value;
                      setLandingContent({ ...landingContent, testimonials: updated });
                    }}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-700 font-medium focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Avatar Image URL</label>
                  <input
                    type="text"
                    value={test.avatar}
                    onChange={(e) => {
                      const updated = [...(landingContent.testimonials || [])];
                      updated[idx].avatar = e.target.value;
                      setLandingContent({ ...landingContent, testimonials: updated });
                    }}
                    placeholder="/images/image-1931.png"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 font-mono text-[11px] text-slate-600 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ===== BOX 8: LANDING TEAM & LEADERSHIP SHOWCASE ===== */}
        <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white/80 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Award className="size-5 text-cyan-600" />
              <h2 className="text-base font-extrabold uppercase tracking-wide text-slate-900">
                8. Landing Team &amp; Leadership Showcase
              </h2>
            </div>
            <button
              type="button"
              onClick={() => {
                const updated = [
                  ...(landingContent.teamMembers || []),
                  {
                    id: `tm-${Date.now()}`,
                    name: "New Member",
                    role: "Executive Lead",
                    image: "/images/rectangle-899.png",
                    profileUrl: "/team",
                  },
                ];
                setLandingContent({ ...landingContent, teamMembers: updated });
              }}
              className="px-3 py-1.5 rounded-lg text-xs font-bold text-cyan-700 bg-cyan-50 hover:bg-cyan-100 transition-colors"
            >
              + Add Member Card
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
                placeholder="OUR TEAM"
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
            <div className="sm:col-span-2">
              <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
                Description Subtext
              </label>
              <textarea
                rows={2}
                value={landingContent.teamDescription || ""}
                onChange={(e) =>
                  setLandingContent({ ...landingContent, teamDescription: e.target.value })
                }
                placeholder="The dedicated faculty mentors and student executives guiding our club's vision..."
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-700 font-medium focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
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
                      className="text-red-500 hover:text-red-700 text-xs font-bold"
                    >
                      Remove
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2">
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

        {/* ===== BOX 9: BOTTOM CTA ===== */}
        <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white/80 shadow-sm space-y-6">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Megaphone className="size-5 text-cyan-600" />
            <h2 className="text-base font-extrabold uppercase tracking-wide text-slate-900">
              9. Bottom Call to Action
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
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
                placeholder="Join Us"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white font-bold text-slate-900 focus:outline-none focus:border-cyan-500"
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
