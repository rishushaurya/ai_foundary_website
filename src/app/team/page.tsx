import React from "react";
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

  return (
    <div className="mesh-bg min-h-screen flex flex-col justify-between">
      <NewTeamView
        settings={settings}
        faculty={faculty}
        executives={executives}
        wings={wings}
      />
      <LightFooter />
    </div>
  );
}
