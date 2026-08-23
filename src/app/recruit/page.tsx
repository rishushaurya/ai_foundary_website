import React from "react";
import { notFound } from "next/navigation";
import { getSettings } from "@/lib/data";
import { RecruitPageClient } from "@/components/ui/recruit-page-client";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "Join AI Foundry | Student Recruitment - Dayananda Sagar University",
  description:
    "Apply to join AI Foundry at Dayananda Sagar University. Join the tech, startup, events, or design wings.",
};

export default async function RecruitPage() {
  const settings = await getSettings();

  if (settings.visiblePages?.recruit === false) {
    notFound();
  }

  return <RecruitPageClient settings={settings} />;
}
