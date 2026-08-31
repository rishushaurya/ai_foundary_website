import React from "react";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { getEvents, getSettings } from "@/lib/data";
import { getDesign, isDesignAvailable } from "@/designs/registry";
import { AdminPreviewBar } from "@/components/ui/admin-preview-bar";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "Events & Hackathons | AI Foundry - Dayananda Sagar University",
  description: "Browse upcoming hackathons, AI workshops, guest lectures, and symposiums at DSU.",
};

export default async function EventsPage({
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

  const [events, settings] = await Promise.all([getEvents(), getSettings()]);

  if (settings.visiblePages?.events === false) {
    notFound();
  }

  const activeDesignId = settings.activeDesign || "ivory-light";
  const isPreviewing = !!(previewParam && isAdmin && isDesignAvailable(previewParam));
  const effectiveDesignId = isPreviewing ? (previewParam as string) : activeDesignId;

  const design = getDesign(effectiveDesignId);
  const EventsPageComponent = design.components.EventsPage;
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
      <EventsPageComponent
        events={events}
        visiblePages={settings.visiblePages}
        socialLinks={settings.socialLinks}
      />
      <FooterComponent
        visiblePages={settings.visiblePages}
        socialLinks={settings.socialLinks}
      />
    </div>
  );
}
