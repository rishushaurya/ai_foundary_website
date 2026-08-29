import React from "react";
import { notFound } from "next/navigation";
import { getFaculty, getExecutives, getTeamWings, getSettings } from "@/lib/data";
import { NewTeamView } from "@/components/ui/new-team-view";
import { LightFooter } from "@/components/ui/light-footer";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "Leadership & Teams | AI Foundry - Dayananda Sagar University",
  description: "Executive leadership, functional wings, and faculty advisory board of AI Foundry at DSU.",
};

export default async function TeamPage() {
  const [settings, faculty, executives, wings] = await Promise.all([
    getSettings(),
    getFaculty(),
    getExecutives(),
    getTeamWings(),
  ]);

  if (settings.visiblePages?.team === false) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#FFFFE9] text-[#2D2E2A] flex flex-col justify-between selection:bg-[#ECFF17] selection:text-[#000000]">
      <NewTeamView
        settings={settings}
        faculty={faculty}
        executives={executives}
        wings={wings}
      />
      <LightFooter visiblePages={settings.visiblePages} socialLinks={settings.socialLinks} />
    </div>
  );
}
