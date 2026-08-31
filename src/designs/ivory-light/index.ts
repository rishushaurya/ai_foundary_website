import { DesignDefinition } from "../types";
import { HomeView } from "@/components/home/home-view";
import { EventsPageClient as EventsPage } from "@/components/ui/events-page-client";
import { NewTeamView as TeamView } from "@/components/ui/new-team-view";
import { NewGalleryView as GalleryView } from "@/components/ui/new-gallery-view";
import { LightNavbar as Navbar } from "@/components/ui/light-navbar";
import { LightFooter as Footer } from "@/components/ui/light-footer";

export const ivoryLightDesign: DesignDefinition = {
  meta: {
    id: "ivory-light",
    name: "Ivory Minimalist (Design 1)",
    themeStyle: "Light Ivory & Deep Charcoal",
    description:
      "The clean, editorial aesthetic featuring warm ivory canvas (#FFFFE9), high-legibility serif headings, modern glassmorphic cards, and luminous lime accents.",
    badge: "Official Baseline",
    thumbnail: "/images/architectural-bg.jpg",
    previewColor: "#FFFFE9",
    accentColor: "#ECFF17",
    author: "AI Foundry Design Wing",
    version: "1.0.0",
  },
  components: {
    HomeView,
    EventsPage,
    TeamView,
    GalleryView,
    Navbar,
    Footer,
  },
};
