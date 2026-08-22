import React from "react";
import { Shield, Sparkles } from "lucide-react";
import { LightFooter } from "@/components/ui/light-footer";

export const metadata = {
  title: "Privacy Policy | AI Foundry - Dayananda Sagar University",
  description: "Official privacy policy and student data protection standards for AI Foundry at DSU.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="mesh-bg min-h-screen flex flex-col justify-between pt-36 sm:pt-44 pb-16">
      <main className="max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="glass-card rounded-[2rem] p-8 sm:p-12 border border-white/80 shadow-xl space-y-8">
          <div className="border-b border-slate-100 pb-6 space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-100 text-cyan-800 text-[11px] font-extrabold uppercase tracking-wider mb-1 border border-cyan-200">
              <Shield className="size-3.5 text-cyan-600" />
              <span>Institutional Privacy Standards</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-['Hanken_Grotesk']">
              Privacy Policy
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Effective Date: Academic Year 2026-2027 • AI Foundry, Dayananda Sagar University
            </p>
          </div>

          <div className="space-y-6 text-slate-700 text-xs sm:text-sm leading-relaxed">
            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900">1. Information We Collect</h2>
              <p>
                AI Foundry collects student information submitted directly through event registrations and membership applications. This includes full name, university email address, phone number, academic branch, year of study, technical skills, and project portfolios.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900">2. How Information is Used</h2>
              <p>
                Information is exclusively utilized for club operations, hackathon team coordination, recruitment cohort evaluation, and academic workshop notifications. We do not sell, rent, or monetize student personal data.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900">3. Data Security &amp; Storage</h2>
              <p>
                All student applications and event submissions are encrypted in transit and protected using dual-layer secure persistence. Access to application records is restricted strictly to authorized faculty advisors and authenticated student leadership.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900">4. Contact &amp; Corrections</h2>
              <p>
                To request modification or deletion of your recruitment application, contact us at{" "}
                <a href="mailto:aifoundry@dsu.edu.in" className="text-cyan-700 font-semibold hover:underline">
                  aifoundry@dsu.edu.in
                </a>
                .
              </p>
            </section>
          </div>
        </div>
      </main>

      <LightFooter />
    </div>
  );
}
