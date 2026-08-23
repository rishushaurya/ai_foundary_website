import { redirect, notFound } from "next/navigation";
import { getSettings } from "@/lib/data";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AboutPage() {
  const settings = await getSettings();
  if (settings.visiblePages?.about === false) {
    notFound();
  }
  redirect("/?scrollTo=about");
}
