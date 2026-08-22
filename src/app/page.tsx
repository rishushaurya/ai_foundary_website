import React from "react";
import { getEvents, getTeamMembers, getGallerySections, getContent, getSettings } from "@/lib/data";
import { HomeView } from "@/components/home/home-view";

export const metadata = {
  title: "AI Foundry | Dayananda Sagar University - Forging the Future of AI",
  description:
    "Dayananda Sagar University's premier innovation club, uniting engineers, researchers, designers, and student founders in artificial intelligence and entrepreneurship.",
};

export default async function HomePage() {
  const [events, team, gallerySections, contentList, settings] = await Promise.all([
    getEvents(),
    getTeamMembers(),
    getGallerySections(),
    getContent(),
    getSettings(),
  ]);

  const aboutSection = contentList.find((c) => c.id === "about");
  const aboutText =
    aboutSection?.paragraphs?.[0] ||
    settings.landingContent?.aboutText ||
    "AI Foundry is the premier student innovation ecosystem established under the Department of Computer Science & Engineering (AI & ML) at Dayananda Sagar University (DSU), Bengaluru.";

  return (
    <HomeView
      events={events}
      team={team}
      gallerySections={gallerySections}
      heroTagline={settings.heroTagline || "FORGING THE FUTURE OF ENTREPRENEURSHIP & ARTIFICIAL INTELLIGENCE"}
      aboutText={aboutText}
      landingContent={settings.landingContent}
    />
  );
}
