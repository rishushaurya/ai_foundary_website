import React from "react";
import { cookies } from "next/headers";
import {
  getEvents,
  getTeamMembers,
  getGallerySections,
  getContent,
  getSettings,
} from "@/lib/data";
import { getDesign, isDesignAvailable } from "@/designs/registry";
import { AdminPreviewBar } from "@/components/ui/admin-preview-bar";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "AI Foundry | Dayananda Sagar University - Forging the Future of AI",
  description:
    "Dayananda Sagar University's premier innovation club, uniting engineers, researchers, designers, and student founders in artificial intelligence and entrepreneurship.",
};

export default async function HomePage({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const previewParam =
    typeof resolvedSearchParams["preview-design"] === "string"
      ? resolvedSearchParams["preview-design"]
      : undefined;

  const cookieStore = await cookies();
  const isAdmin = !!cookieStore.get("admin-token")?.value;

  const [events, team, gallerySections, contentList, settings] = await Promise.all([
    getEvents(),
    getTeamMembers(),
    getGallerySections(),
    getContent(),
    getSettings(),
  ]);

  const activeDesignId = settings.activeDesign || "ivory-light";
  const isPreviewing = !!(previewParam && isAdmin && isDesignAvailable(previewParam));
  const effectiveDesignId = isPreviewing ? (previewParam as string) : activeDesignId;

  const design = getDesign(effectiveDesignId);
  const HomeViewComponent = design.components.HomeView;

  const aboutSection = contentList.find((c) => c.id === "about");
  const aboutText =
    aboutSection?.paragraphs?.[0] ||
    settings.landingContent?.aboutText ||
    "AI Foundry is the premier student innovation ecosystem established under the Department of Computer Science & Engineering (AI & ML) at Dayananda Sagar University (DSU), Bengaluru.";

  return (
    <>
      {isPreviewing && (
        <AdminPreviewBar
          designId={effectiveDesignId}
          designName={design.meta.name}
          isLive={effectiveDesignId === activeDesignId}
        />
      )}
      <HomeViewComponent
        events={events}
        team={team}
        gallerySections={gallerySections}
        heroTagline={
          settings.heroTagline ||
          "FORGING THE FUTURE OF ENTREPRENEURSHIP & ARTIFICIAL INTELLIGENCE"
        }
        aboutText={aboutText}
        landingContent={settings.landingContent}
        socialLinks={settings.socialLinks}
        visiblePages={settings.visiblePages}
      />
    </>
  );
}
