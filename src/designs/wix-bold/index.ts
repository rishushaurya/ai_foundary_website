import { DesignDefinition } from "../types";
import { WixBoldHomeView } from "./home-view";
import { WixBoldEventsPage } from "./events-page";
import { WixBoldTeamView } from "./team-view";
import { WixBoldGalleryView } from "./gallery-view";
import { WixBoldNavbar } from "./navbar";
import { WixBoldFooter } from "./footer";

export const wixBoldDesign: DesignDefinition = {
  meta: {
    id: "wix-bold",
    name: "Wix Static Minimalist (Design 2)",
    themeStyle: "Warm Ivory & Charcoal",
    description:
      "Exact static reproduction of the 'front end by me' export. Features warm ivory canvas (#FFFFE9), clean typography, robot illustrations, serif headings, and structured editorial cards with zero backend binding.",
    badge: "Static Prototype",
    thumbnail: "/images/design2/robot_about.png",
    previewColor: "#FFFFE9",
    accentColor: "#2D2E2A",
    author: "AI Foundry Wix Export",
    version: "2.0.0",
  },
  components: {
    HomeView: WixBoldHomeView,
    EventsPage: WixBoldEventsPage,
    TeamView: WixBoldTeamView,
    GalleryView: WixBoldGalleryView,
    Navbar: WixBoldNavbar,
    Footer: WixBoldFooter,
  },
};
