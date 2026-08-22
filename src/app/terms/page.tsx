import React from "react";
import { Shield, FileText } from "lucide-react";
import { LightFooter } from "@/components/ui/light-footer";

export const metadata = {
  title: "Terms & Conditions | AI Foundry - Dayananda Sagar University",
  description: "Terms and conditions of participation in AI Foundry student initiatives and hackathons.",
};

export default function TermsPage() {
  return (
    <div className="mesh-bg min-h-screen flex flex-col justify-between pt-36 sm:pt-44 pb-16">
      <main className="max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="glass-card rounded-[2rem] p-8 sm:p-12 border border-white/80 shadow-xl space-y-8">
          <div className="border-b border-slate-100 pb-6 space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-100 text-cyan-800 text-[11px] font-extrabold uppercase tracking-wider mb-1 border border-cyan-200">
              <FileText className="size-3.5 text-cyan-600" />
              <span>Membership &amp; Participation Guidelines</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-['Hanken_Grotesk']">
              Terms &amp; Conditions
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Effective Date: Academic Year 2026-2027 • AI Foundry, Dayananda Sagar University
            </p>
          </div>

          <div className="space-y-6 text-slate-700 text-xs sm:text-sm leading-relaxed">
            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900">1. Eligibility &amp; Membership</h2>
              <p>
                Membership in AI Foundry is open to enrolled students of Dayananda Sagar University. Members agree to uphold academic integrity, foster inclusive collaboration, and adhere to university codes of conduct during all hackathons and workshops.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900">2. Intellectual Property</h2>
              <p>
                Projects and prototypes developed during club hackathons and build sprints remain the intellectual property of the respective student creators, subject to university incubation guidelines and open-source project licenses.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900">3. Code of Conduct &amp; Ethics</h2>
              <p>
                All members and event participants must foster a safe, respectful environment free of harassment. Unethical behavior, academic plagiarism, or misuse of club computing resources will result in immediate revocation of membership.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900">4. Modifications</h2>
              <p>
                The executive leadership and faculty advisory board reserve the right to update these terms to align with institutional policies and club expansion goals.
              </p>
            </section>
          </div>
        </div>
      </main>

      <LightFooter />
    </div>
  );
}
