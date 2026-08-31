import React from "react";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { getFaculty, getExecutives, getTeamWings, getSettings } from "@/lib/data";
import { getDesign, isDesignAvailable } from "@/designs/registry";
import { AdminPreviewBar } from "@/components/ui/admin-preview-bar";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "Leadership & Teams | AI Foundry - Dayananda Sagar University",
  description: "Executive leadership, functional wings, and faculty advisory board of AI Foundry at DSU.",
};

export default async function TeamPage({
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

  const [settings, faculty, executives, wings] = await Promise.all([
    getSettings(),
    getFaculty(),
    getExecutives(),
    getTeamWings(),
  ]);

  if (settings.visiblePages?.team === false) {
    notFound();
  }

  const activeDesignId = settings.activeDesign || "ivory-light";
  const isPreviewing = !!(previewParam && isAdmin && isDesignAvailable(previewParam));
  const effectiveDesignId = isPreviewing ? (previewParam as string) : activeDesignId;

  const design = getDesign(effectiveDesignId);
  const TeamViewComponent = design.components.TeamView;
  const FooterComponent = design.components.Footer;

  return (
    <div className="min-h-screen flex flex-col justify-between">
      {isPreviewing && (
        <AdminPreviewBar
          designId={effectiveDesignId}
          designName={design.meta.name}
          isLive={effectiveDesignId === activeDesignId}
        />
      )}
      <TeamViewComponent
        settings={settings}
        faculty={faculty}
        executives={executives}
        wings={wings}
      />
      <FooterComponent
        visiblePages={settings.visiblePages}
        socialLinks={settings.socialLinks}
      />
    </div>
  );
}
