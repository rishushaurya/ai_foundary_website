import React from "react";
import { notFound } from "next/navigation";
import { getGallerySections, getSettings } from "@/lib/data";
import { NewGalleryView } from "@/components/ui/new-gallery-view";
import { LightFooter } from "@/components/ui/light-footer";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "Gallery & Moments | AI Foundry - Dayananda Sagar University",
  description: "Visual journey through AI Foundry hackathons, orientation symposiums, and robotics workshops at DSU.",
};

export default async function GalleryPage() {
  const [sections, settings] = await Promise.all([
    getGallerySections(),
    getSettings(),
  ]);

  if (settings.visiblePages?.gallery === false) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#FFFFE9] text-[#2D2E2A] flex flex-col justify-between selection:bg-[#ECFF17] selection:text-[#000000]">
      <NewGalleryView sections={sections} />
      <LightFooter visiblePages={settings.visiblePages} socialLinks={settings.socialLinks} />
    </div>
  );
}
