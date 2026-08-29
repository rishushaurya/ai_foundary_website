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
              <h2 className="text-base font-bold text-slate-900">1. Acceptance of Terms &amp; Eligibility</h2>
              <p>
                By accessing or using the AI Foundry web platform, registering for events, or submitting recruitment applications, you agree to comply with these Terms &amp; Conditions and all applicable Dayananda Sagar University (DSU) student regulations. Active membership is open to currently enrolled students of Dayananda Sagar University.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900">2. Responsible AI &amp; Academic Integrity (RAISE Charter)</h2>
              <p>
                As DSU&apos;s flagship Responsible AI student organization, members and hackathon participants agree not to develop, train, or deploy AI models designed for malicious exploitation, unauthorized data harvesting, non-consensual deepfakes, or academic plagiarism. All submissions must represent genuine student work with transparent attribution of pre-trained weights and open-source packages.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900">3. Intellectual Property (IP) Rights</h2>
              <p>
                Student creators retain 100% intellectual property rights over codebases, neural models, architectures, and startup concepts built during AI Foundry hackathons and build sprints. Projects created under official incubator wings are encouraged to follow permissive open-source licensing (MIT/Apache 2.0). AI Foundry and DSU logos, branding, and design tokens remain the exclusive property of the university and club executive leadership.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900">4. Event Participation &amp; Attendance Commitment</h2>
              <p>
                Registration for workshops, hackathons, and symposiums constitutes a confirmed seat reservation. Participants who register but fail to attend without at least 24 hours prior written notice may have future registration privileges suspended to ensure fair resource allocation.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900">5. Compute Cluster &amp; Platform Acceptable Use</h2>
              <p>
                Access to club compute infrastructure, GPU clusters, lab machines, and administrative endpoints is strictly audited. Any attempt to scrape participant data, bypass authentication controls, perform denial-of-service tests, or misuse computing resources for unauthorized purposes will result in immediate termination of membership and escalation to university disciplinary authorities.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900">6. Media &amp; Photographic Release</h2>
              <p>
                By attending on-campus AI Foundry events and workshops, participants grant the club permission to capture and publish photographs, audio, and video recordings for official archival, gallery, and educational promotional purposes.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900">7. Campus Location &amp; Inquiries</h2>
              <p>
                AI Foundry operates under the Department of Computer Science &amp; Engineering (AI &amp; Robotics / AI &amp; ML) at:
                <br />
                <span className="font-semibold text-slate-900">
                  Innovation Center, Harohalli Campus, Kanakapura Road, Ramanagara District / Bengaluru South, Karnataka - 562112
                </span>
                <br />
                For legal notices or official inquiries, please write to{" "}
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
