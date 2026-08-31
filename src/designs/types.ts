import React from "react";
import {
  EventData,
  TeamMember,
  GallerySection,
  LandingCustomContent,
  SiteSettings,
} from "@/lib/data";

export interface HomeViewProps {
  events: EventData[];
  team: TeamMember[];
  gallerySections: GallerySection[];
  heroTagline: string;
  aboutText: string;
  landingContent?: LandingCustomContent;
  socialLinks?: SiteSettings["socialLinks"];
  visiblePages?: SiteSettings["visiblePages"];
}

export interface EventsPageProps {
  events: EventData[];
  visiblePages?: SiteSettings["visiblePages"];
  socialLinks?: SiteSettings["socialLinks"];
}

export interface TeamViewProps {
  settings: SiteSettings;
  faculty: TeamMember[];
  executives: TeamMember[];
  wings: TeamMember[];
}

export interface GalleryViewProps {
  sections: GallerySection[];
  visiblePages?: SiteSettings["visiblePages"];
  socialLinks?: SiteSettings["socialLinks"];
}

export interface NavbarProps {
  visiblePages?: SiteSettings["visiblePages"];
}

export interface FooterProps {
  visiblePages?: SiteSettings["visiblePages"];
  socialLinks?: SiteSettings["socialLinks"];
}

export interface DesignMeta {
  id: string;
  name: string;
  themeStyle: string;
  description: string;
  badge: string;
  thumbnail: string;
  previewColor: string;
  accentColor: string;
  author: string;
  version: string;
}

export interface DesignComponents {
  HomeView: React.ComponentType<HomeViewProps>;
  EventsPage: React.ComponentType<EventsPageProps>;
  TeamView: React.ComponentType<TeamViewProps>;
  GalleryView: React.ComponentType<GalleryViewProps>;
  Navbar: React.ComponentType<NavbarProps>;
  Footer: React.ComponentType<FooterProps>;
}

export interface DesignDefinition {
  meta: DesignMeta;
  components: DesignComponents;
}
