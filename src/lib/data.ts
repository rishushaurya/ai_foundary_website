import { readData, writeData } from "@/lib/local-db";

// ---- Team Interfaces ----
export interface TeamSocialLinks {
  linkedin?: string;
  github?: string;
  instagram?: string;
  twitter?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  category: "faculty" | "executive" | "team";
  affiliation?: string;
  email?: string;
  image: string;
  socialLinks?: TeamSocialLinks;
  order?: number;
  showOnHome?: boolean;
}

export async function getTeamMembers(): Promise<TeamMember[]> {
  const members = await readData<TeamMember[]>("team.json", []);
  return members.sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
}

export async function getFaculty(): Promise<TeamMember[]> {
  const members = await getTeamMembers();
  return members.filter((m) => m.category === "faculty");
}

export async function getExecutives(): Promise<TeamMember[]> {
  const members = await getTeamMembers();
  return members.filter((m) => m.category === "executive");
}

export async function getTeamWings(): Promise<TeamMember[]> {
  const members = await getTeamMembers();
  return members.filter((m) => m.category === "team");
}

export async function saveTeamMembers(members: TeamMember[]): Promise<boolean> {
  return writeData("team.json", members);
}

// ---- Event Interfaces ----
export interface EventLink {
  label: string;
  url: string;
}

export interface EventDownload {
  name: string;
  url: string;
}

export interface EventRegistration {
  id: string;
  name: string;
  email: string;
  phone: string;
  college: string;
  branch: string;
  timestamp: string;
}

export interface EventData {
  id: string;
  title: string;
  description: string;
  date: string;
  venue: string;
  image: string;
  images?: string[];
  status: "upcoming" | "ongoing" | "ended";
  registrationMode: "builtin" | "google-form";
  googleFormUrl?: string;
  registrationDeadline?: string;
  isCountdownEvent?: boolean;
  showOnHome?: boolean;
  showOnEventPage?: boolean;
  links?: EventLink[];
  downloads?: EventDownload[];
  registrations?: EventRegistration[];
}

export async function getEvents(): Promise<EventData[]> {
  return readData<EventData[]>("events.json", []);
}

export async function getHomeEvents(): Promise<EventData[]> {
  const events = await getEvents();
  return events.filter((e) => e.showOnHome);
}

export async function saveEvents(events: EventData[]): Promise<boolean> {
  return writeData("events.json", events);
}

// ---- Content & About ----
export interface ContentSection {
  id: string;
  title: string;
  paragraphs: string[];
}

export async function getContent(): Promise<ContentSection[]> {
  return readData<ContentSection[]>("content.json", []);
}

export async function getAboutContent(): Promise<ContentSection | null> {
  const sections = await getContent();
  return sections.find((s) => s.id === "about") || null;
}

export async function saveContent(content: ContentSection[]): Promise<boolean> {
  return writeData("content.json", content);
}

// ---- Gallery ----
export interface GalleryItem {
  id: string;
  type: "image" | "video";
  url: string;
  name: string;
}

export interface GallerySection {
  id: string;
  name: string;
  showOnHome: boolean;
  showOnGalleryPage?: boolean;
  items: GalleryItem[];
}

export async function getGallerySections(): Promise<GallerySection[]> {
  return readData<GallerySection[]>("gallery.json", []);
}

export async function getHomeGallerySections(): Promise<GallerySection[]> {
  const sections = await getGallerySections();
  return sections.filter((s) => s.showOnHome && s.items.length > 0);
}

export async function saveGallerySections(sections: GallerySection[]): Promise<boolean> {
  return writeData("gallery.json", sections);
}

// ---- Recruitment ----
export interface RecruitmentEntry {
  id: string;
  name: string;
  email: string;
  phone: string;
  year: string;
  branch: string;
  preferredTeam: string;
  skills: string;
  portfolioUrl?: string;
  whyJoin: string;
  timestamp: string;
  status: "pending" | "reviewed" | "accepted" | "rejected";
}

export async function getRecruitmentEntries(): Promise<RecruitmentEntry[]> {
  return readData<RecruitmentEntry[]>("recruitment.json", []);
}

export async function saveRecruitmentEntries(entries: RecruitmentEntry[]): Promise<boolean> {
  return writeData("recruitment.json", entries);
}

// ---- Settings ----
export interface VisiblePagesConfig {
  about: boolean;
  events: boolean;
  team: boolean;
  gallery: boolean;
  recruit: boolean;
}

export interface SiteSocialLinks {
  instagram?: string;
  linkedin?: string;
  github?: string;
  discord?: string;
  whatsapp?: string;
  email?: string;
}

export interface SiteSettings {
  siteTitle: string;
  defaultTheme: string;
  defaultAppearance: string;
  adminEmails: string[];
  heroTagline: string;
  heroSubtext: string;
  facultyHeading: string;
  studentHeading: string;
  developerHeading: string;
  facultyGridCols: number;
  studentGridCols: number;
  visiblePages: VisiblePagesConfig;
  socialLinks: SiteSocialLinks;
}

export async function getSettings(): Promise<SiteSettings> {
  return readData<SiteSettings>("settings.json", {
    siteTitle: "AI Foundry | Dayananda Sagar University",
    defaultTheme: "cyan",
    defaultAppearance: "dark",
    adminEmails: ["admin@aifoundry.club", "demo@aifoundry.club"],
    heroTagline: "FORGING THE FUTURE OF ENTREPRENEURSHIP & ARTIFICIAL INTELLIGENCE",
    heroSubtext: "Dayananda Sagar University's premier innovation ecosystem uniting engineers, designers, researchers, and student founders.",
    facultyHeading: "FACULTY MENTORS",
    studentHeading: "CLUB LEADERSHIP & TEAMS",
    developerHeading: "PLATFORM ARCHITECTS",
    facultyGridCols: 3,
    studentGridCols: 4,
    visiblePages: {
      about: true,
      events: true,
      team: true,
      gallery: true,
      recruit: true,
    },
    socialLinks: {
      instagram: "https://instagram.com/aifoundry_dsu",
      linkedin: "https://linkedin.com/company/aifoundry-dsu",
      github: "https://github.com/aifoundry-dsu",
      discord: "https://discord.gg/aifoundry",
      whatsapp: "https://chat.whatsapp.com/aifoundry",
      email: "aifoundry@dsu.edu.in",
    },
  });
}

export async function saveSettings(settings: SiteSettings): Promise<boolean> {
  return writeData("settings.json", settings);
}
