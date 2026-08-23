import React from "react";
import { getGallerySections } from "@/lib/data";
import { NewGalleryView } from "@/components/ui/new-gallery-view";
import { LightFooter } from "@/components/ui/light-footer";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "Gallery & Moments | AI Foundry - Dayananda Sagar University",
  description: "Visual journey through AI Foundry hackathons, orientation symposiums, and robotics workshops at DSU.",
};

export default async function GalleryPage() {
  const sections = await getGallerySections();

  return (
    <div className="mesh-bg min-h-screen flex flex-col justify-between">
      <NewGalleryView sections={sections} />
      <LightFooter />
    </div>
  );
}
