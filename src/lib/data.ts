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
  imageFit?: "cover" | "contain";
  imagePosition?: "center" | "top" | "bottom";
  homeImage?: string;
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

export interface EventCustomQuestion {
  id: string;
  label: string;
  type: "text" | "select" | "textarea";
  options?: string[];
  required: boolean;
}

export interface EventRegistration {
  id: string;
  name: string;
  email: string;
  phone: string;
  college: string;
  branch: string;
  timestamp: string;
  customAnswers?: Record<string, string>;
}

export interface EventData {
  id: string;
  title: string;
  description: string;
  date: string;
  venue: string;
  image: string;
  imageFit?: "cover" | "contain";
  imagePosition?: "center" | "top" | "bottom";
  homeImage?: string;
  images?: string[];
  status: "upcoming" | "ongoing" | "ended";
  registrationMode: "builtin" | "external" | "google-form";
  externalRegistrationUrl?: string;
  googleFormUrl?: string;
  isRegistrationOpen?: boolean;
  registrationStartDate?: string;
  registrationDeadline?: string;
  closedMessage?: string;
  isCountdownEvent?: boolean;
  showOnHome?: boolean;
  showOnEventPage?: boolean;
  links?: EventLink[];
  downloads?: EventDownload[];
  customQuestions?: EventCustomQuestion[];
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

// ---- Gallery Interfaces ----
export interface GalleryItem {
  id: string;
  type: "image" | "video";
  name: string;
  url: string;
  thumbnail?: string;
}

export interface GallerySection {
  id: string;
  name: string;
  showOnHome?: boolean;
  showOnGalleryPage?: boolean;
  items: GalleryItem[];
}

export async function getGallerySections(): Promise<GallerySection[]> {
  return readData<GallerySection[]>("gallery.json", []);
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

// ---- Settings & Landing Visual Customization ----
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
  twitter?: string;
  discord?: string;
  whatsapp?: string;
  email?: string;
}

export interface LandingPillarItem {
  id: string;
  title: string;
  description: string;
  icon?: string;
}

export interface LandingProjectItem {
  id: string;
  title: string;
  tag: string;
  description: string;
  image: string;
}

export interface LandingApproachItem {
  id: string;
  title: string;
  description: string;
  image?: string;
}

export interface LandingProcessItem {
  id?: string;
  num: string;
  title: string;
  desc: string;
}

export interface LandingStatsConfig {
  members: string;
  membersLabel?: string;
  projects: string;
  projectsLabel?: string;
  duration: string;
  durationLabel?: string;
  mentors: string;
  mentorsLabel?: string;
  costReduction: string;
  costReductionLabel?: string;
  innovationHours: string;
  innovationHoursLabel?: string;
}

export interface LandingTestimonialItem {
  id: string;
  quote: string;
  name: string;
  role: string;
  avatar: string;
}

export interface LandingTeamMember {
  id: string;
  name: string;
  role: string;
  bio?: string;
  image: string;
  imageFit?: "cover" | "contain";
  imagePosition?: "center" | "top" | "bottom";
  homeImage?: string;
  profileUrl?: string;
}

export interface LandingCustomContent {
  heroBadge?: string;
  heroTagline?: string;
  heroSubtext?: string;
  heroDepartment?: string;
  aboutBadge?: string;
  aboutTitle?: string;
  aboutHeading?: string;
  aboutText?: string;
  aboutSecondaryText?: string;
  aboutImage?: string;
  aboutImageFit?: "cover" | "contain";
  aboutImagePosition?: "center" | "top" | "bottom";
  missionHeading?: string;
  missionText?: string;
  pillarsHeading?: string;
  pillarsSubtext?: string;
  pillars?: LandingPillarItem[];
  projectsHeading?: string;
  projectsSubtext?: string;
  projects?: LandingProjectItem[];
  approachHeading?: string;
  approachSubtext?: string;
  approach?: LandingApproachItem[];
  processHeading?: string;
  process?: LandingProcessItem[];
  statsHeading?: string;
  stats?: LandingStatsConfig;
  testimonialsHeading?: string;
  testimonials?: LandingTestimonialItem[];
  teamHeading?: string;
  teamSubheading?: string;
  teamDescription?: string;
  teamMembers?: LandingTeamMember[];
  ctaHeading?: string;
  ctaDescription?: string;
  ctaButtonText?: string;
}

export interface SiteSettings {
  siteTitle: string;
  activeDesign?: string;
  defaultTheme: string;
  defaultAppearance: string;
  adminEmails: string[];
  rootAdminEmails?: string[]; // Permanent root administrators who can promote others
  heroTagline: string;
  heroSubtext: string;
  facultyHeading: string;
  studentHeading: string;
  developerHeading: string;
  facultyGridCols: number;
  studentGridCols: number;
  visiblePages: VisiblePagesConfig;
  socialLinks: SiteSocialLinks;
  landingContent?: LandingCustomContent;
}

export async function getSettings(): Promise<SiteSettings> {
  const settings = await readData<SiteSettings>("settings.json", {
    siteTitle: "AI Foundry | Dayananda Sagar University",
    activeDesign: "ivory-light",
    defaultTheme: "cyan",
    defaultAppearance: "dark",
    adminEmails: ["priyanshushaurya9431@gmail.com"],
    rootAdminEmails: ["priyanshushaurya9431@gmail.com"],
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
    landingContent: {
      aboutHeading: "ABOUT US",
      aboutText: "To cultivate a vibrant community at DSU, fostering innovation in AI and entrepreneurship through collaborative projects.",
      missionHeading: "OUR MISSION",
      missionText: "Uniting minds, shaping tomorrow.",
      pillarsHeading: "OUR PILLARS",
      pillarsSubtext: "Our approach to innovation is built on three core strategies.",
      pillars: [
        {
          id: "p1",
          title: "Innovation",
          description: "We encourage groundbreaking ideas and provide the resources for members to explore the frontiers of AI and business.",
          icon: "/images/asterisk-streamline-unicons.svg",
        },
        {
          id: "p2",
          title: "Collaboration",
          description: "We believe in the power of diverse minds working together, fostering a supportive environment for shared learning and growth.",
          icon: "/images/channel-streamline-unicons.svg",
        },
        {
          id: "p3",
          title: "Impact",
          description: "Our projects aim to solve real-world problems, making a tangible difference in the community and beyond.",
          icon: "/images/border-vertical-streamline-unicons.svg",
        },
      ],
      projectsHeading: "OUR PROJECTS",
      projectsSubtext: "Explore our innovative projects, where theory meets practice in the exciting fields of AI and entrepreneurship, driving real change.",
      projects: [
        {
          id: "proj1",
          title: "Project Alpha",
          tag: "AI & ML",
          description: "An AI-powered solution for optimizing campus resource allocation, developed by our student engineers.",
          image: "/images/rectangle-902.png",
        },
        {
          id: "proj2",
          title: "Venture Beta",
          tag: "Incubation",
          description: "A student-led startup focusing on sustainable urban farming using intelligent automation and data analytics.",
          image: "/images/image-1929.png",
        },
        {
          id: "proj3",
          title: "Research Gamma",
          tag: "Research",
          description: "Cutting-edge research into explainable AI for ethical decision-making in financial technology.",
          image: "/images/rectangle-3.png",
        },
      ],
      approachHeading: "OUR APPROACH",
      approachSubtext: "We foster a dynamic environment where students can transform their ideas into impactful AI and entrepreneurial ventures.",
      approach: [
        {
          id: "app1",
          title: "Ideation",
          description: "We guide members from initial concepts to well-defined project proposals, encouraging creative problem-solving.",
          image: "/images/rectangle-5.png",
        },
        {
          id: "app2",
          title: "Development",
          description: "Providing tools, mentorship, and a collaborative space for building and refining AI solutions and business models.",
        },
        {
          id: "app3",
          title: "Launch",
          description: "Supporting projects through deployment, market entry, and continuous iteration for sustained success.",
          image: "/images/map.png",
        },
        {
          id: "app4",
          title: "Community",
          description: "Building a strong network of innovators, fostering peer learning and collaborative opportunities.",
          image: "/images/rectangle-8.png",
        },
      ],
      stats: {
        members: "50 +",
        projects: "x 15",
        duration: "1 year",
        mentors: "+ 20",
        costReduction: "- 50%",
        innovationHours: "500 hrs",
      },
      testimonialsHeading: "Hear it from our members.",
      testimonials: [
        {
          id: "t1",
          name: "Aisha Sharma",
          role: "Student Founder, DSU",
          quote: "Ai Foundry transformed my understanding of AI and gave me the confidence to launch my own startup idea.",
          avatar: "/images/image-1931.png",
        },
        {
          id: "t2",
          name: "Rahul Verma",
          role: "Engineering Student, DSU",
          quote: "The collaborative environment here is unparalleled. I've learned so much from my peers and mentors.",
          avatar: "/images/image-1927.png",
        },
        {
          id: "t3",
          name: "Priya Singh",
          role: "Design Student, DSU",
          quote: "Being part of Ai Foundry has opened doors to incredible opportunities and a network I wouldn't have otherwise.",
          avatar: "/images/image-1928.png",
        },
      ],
      ctaHeading: "Ready to forge the future?",
      ctaButtonText: "Join Us",
    },
  });

  if (!settings.rootAdminEmails || !Array.isArray(settings.rootAdminEmails) || settings.rootAdminEmails.length === 0) {
    settings.rootAdminEmails = ["priyanshushaurya9431@gmail.com"];
  } else if (!settings.rootAdminEmails.some((e) => e.toLowerCase() === "priyanshushaurya9431@gmail.com")) {
    settings.rootAdminEmails.unshift("priyanshushaurya9431@gmail.com");
  }

  return settings;
}

export async function saveSettings(settings: SiteSettings): Promise<boolean> {
  const current = await getSettings();
  const existingRoots = (current.rootAdminEmails || ["priyanshushaurya9431@gmail.com"]).map((e) => e.toLowerCase());

  // Enforce irreversible hierarchy: existing root admins can never be demoted back to normal admin
  const proposedRoots = (settings.rootAdminEmails || []).map((e) => e.toLowerCase());
  const mergedRoots = Array.from(new Set([...existingRoots, ...proposedRoots]));
  if (!mergedRoots.includes("priyanshushaurya9431@gmail.com")) {
    mergedRoots.unshift("priyanshushaurya9431@gmail.com");
  }
  settings.rootAdminEmails = mergedRoots;

  // Root admins must unconditionally remain in adminEmails
  const proposedAdmins = (settings.adminEmails || []).map((e) => e.toLowerCase());
  const mergedAdmins = Array.from(new Set([...proposedAdmins, ...mergedRoots]));
  settings.adminEmails = mergedAdmins;

  return writeData("settings.json", settings);
}
