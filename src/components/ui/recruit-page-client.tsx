"use client";

import React, { useState, useEffect } from "react";
import { Sparkles, CheckCircle, AlertCircle, Loader2, UserPlus } from "lucide-react";
import { LightFooter } from "@/components/ui/light-footer";
import { SiteSettings } from "@/lib/data";

interface RecruitPageClientProps {
  settings?: SiteSettings;
}

export function RecruitPageClient({ settings }: RecruitPageClientProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    year: "1st Year",
    branch: "B.Tech CSE (AI & ML)",
    preferredTeam: "AI & Tech Wing",
    skills: "",
    portfolioUrl: "",
    whyJoin: "",
  });

  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  // Restore draft from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("aifoundry:recruit_draft");
      if (saved) {
        setFormData((prev) => ({ ...prev, ...JSON.parse(saved) }));
      }
    } catch {}
  }, []);

  // Keystroke-level persistence
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    const updated = { ...formData, [name]: value };
    setFormData(updated);
    try {
      localStorage.setItem("aifoundry:recruit_draft", JSON.stringify(updated));
    } catch {}
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    try {
      const res = await fetch("/api/recruit/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Submission failed");

      setStatus("success");
      try {
        localStorage.removeItem("aifoundry:recruit_draft");
      } catch {}
    } catch (err: any) {
      setStatus("error");
      setErrorMessage(err.message || "Failed to submit application");
    }
  };

  return (
    <div className="flex flex-col min-h-screen justify-between recruit-robot-bg font-mono text-white">
      <main className="subpage-container recruit-robot-bg flex-grow">
        <div className="subpage-inner max-w-3xl">
          {/* Header Section */}
          <section className="text-center space-y-4 max-w-2xl mx-auto w-full">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-cyan-500/40 bg-cyan-950/60 text-cyan-300 text-xs font-bold uppercase tracking-widest shadow-sm backdrop-blur-md">
              <Sparkles className="size-3.5 text-cyan-400" />
              <span>Spring &amp; Fall Cohorts</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white">
              JOIN AI FOUNDRY
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 normal-case leading-relaxed font-sans max-w-xl mx-auto">
              Become part of Dayananda Sagar University&apos;s elite engineering and venture hub. Build real-world AI applications, organize national hackathons, and collaborate with industry mentors.
            </p>
          </section>

          {/* Form Container */}
          <div className="rounded-3xl border border-white/15 bg-black/40 backdrop-blur-xl p-8 sm:p-12 shadow-2xl w-full">
            {status === "success" ? (
              <div className="py-12 text-center space-y-4">
                <div className="size-16 rounded-full bg-emerald-950/80 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/40">
                  <CheckCircle className="size-8" />
                </div>
                <h2 className="text-xl font-bold uppercase text-white">
                  Application Received!
                </h2>
                <p className="text-xs text-slate-300 max-w-md mx-auto font-sans leading-relaxed">
                  Thank you for applying to AI Foundry. The executive board will review your profile and reach out via email for the interview round.
                </p>
                <div className="pt-4">
                  <button
                    type="button"
                    onClick={() => setStatus("idle")}
                    className="px-6 py-2.5 rounded-full text-xs font-bold uppercase text-black bg-cyan-400 hover:bg-cyan-300 transition-colors cursor-pointer shadow-[0_0_15px_rgba(0,210,255,0.4)]"
                  >
                    Submit Another Response
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6 text-xs">
                {/* Hidden Honeypot Field for Bot Mitigation */}
                <input
                  type="text"
                  name="botField"
                  tabIndex={-1}
                  autoComplete="off"
                  style={{ display: "none", opacity: 0, position: "absolute", left: "-9999px" }}
                  aria-hidden="true"
                />

                {status === "error" && (
                  <div className="flex items-center gap-2 p-4 rounded-2xl bg-red-950/60 text-red-300 border border-red-500/40 font-bold uppercase">
                    <AlertCircle className="size-4 flex-shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold uppercase text-slate-300">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="e.g. Syed Amaan"
                      className="w-full px-4 py-3 rounded-xl border border-white/20 bg-white/5 text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 focus:bg-white/10 transition-colors"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold uppercase text-slate-300">
                      DSU / Personal Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="e.g. candidate@dsu.edu.in"
                      className="w-full px-4 py-3 rounded-xl border border-white/20 bg-white/5 text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 focus:bg-white/10 transition-colors"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold uppercase text-slate-300">
                      WhatsApp / Phone *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="e.g. +91 9876543210"
                      className="w-full px-4 py-3 rounded-xl border border-white/20 bg-white/5 text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 focus:bg-white/10 transition-colors"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold uppercase text-slate-300">
                      Academic Year *
                    </label>
                    <select
                      name="year"
                      value={formData.year}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-white/20 bg-slate-900 text-white focus:outline-none focus:border-cyan-400 transition-colors"
                    >
                      <option value="1st Year">1st Year (Freshman)</option>
                      <option value="2nd Year">2nd Year (Sophomore)</option>
                      <option value="3rd Year">3rd Year (Junior)</option>
                      <option value="4th Year">4th Year (Senior)</option>
                      <option value="Postgraduate">Postgraduate (M.Tech / MCA)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold uppercase text-slate-300">
                      Branch / Department *
                    </label>
                    <input
                      type="text"
                      name="branch"
                      required
                      value={formData.branch}
                      onChange={handleChange}
                      placeholder="e.g. B.Tech CSE (AI & ML)"
                      className="w-full px-4 py-3 rounded-xl border border-white/20 bg-white/5 text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 focus:bg-white/10 transition-colors"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold uppercase text-slate-300">
                      Preferred Wing *
                    </label>
                    <select
                      name="preferredTeam"
                      value={formData.preferredTeam}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-white/20 bg-slate-900 text-white focus:outline-none focus:border-cyan-400 transition-colors"
                    >
                      <option value="AI & Tech Wing">AI &amp; Tech Engineering Wing</option>
                      <option value="Product & Startup Wing">Product &amp; Startup Wing</option>
                      <option value="Events & Operations Wing">Events &amp; Operations Wing</option>
                      <option value="Design & Media Wing">Design &amp; Media Wing</option>
                      <option value="Outreach & Partnerships Wing">Outreach &amp; Partnerships Wing</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold uppercase text-slate-300">
                    Core Technical / Non-Technical Skills *
                  </label>
                  <input
                    type="text"
                    name="skills"
                    required
                    value={formData.skills}
                    onChange={handleChange}
                    placeholder="e.g. Python, PyTorch, React, Figma, Event Management, Public Speaking"
                    className="w-full px-4 py-3 rounded-xl border border-white/20 bg-white/5 text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 focus:bg-white/10 transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold uppercase text-slate-300">
                    GitHub / Portfolio / LinkedIn URL
                  </label>
                  <input
                    type="url"
                    name="portfolioUrl"
                    value={formData.portfolioUrl}
                    onChange={handleChange}
                    placeholder="https://github.com/yourhandle"
                    className="w-full px-4 py-3 rounded-xl border border-white/20 bg-white/5 text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 focus:bg-white/10 transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold uppercase text-slate-300">
                    Why do you want to join AI Foundry? *
                  </label>
                  <textarea
                    rows={4}
                    name="whyJoin"
                    required
                    value={formData.whyJoin}
                    onChange={handleChange}
                    placeholder="Tell us about what you want to build or achieve in the club..."
                    className="w-full px-4 py-3 rounded-xl border border-white/20 bg-white/5 text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 focus:bg-white/10 transition-colors leading-relaxed"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={status === "loading"}
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-full font-bold uppercase tracking-wider text-black bg-cyan-400 hover:bg-cyan-300 transition-transform hover:scale-102 cursor-pointer shadow-[0_0_20px_rgba(0,210,255,0.4)] disabled:opacity-50"
                  >
                    {status === "loading" ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <UserPlus className="size-4" />
                    )}
                    <span>Submit Membership Application</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </main>

      <LightFooter visiblePages={settings?.visiblePages} socialLinks={settings?.socialLinks} />
    </div>
  );
}
