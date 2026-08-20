# Product Requirement Document (PRD)
Version: 1.0.0
Date: 2026-08-18
Project: AI Foundry  - Dayananda Sagar University

---

## 1. Executive Summary
AI Foundry is the flagship Entrepreneurship and Artificial Intelligence student organization at Dayananda Sagar University (DSU), Bengaluru, branded as  (Responsible Artificial Intelligence). This web platform provides a public-facing showcase for club initiatives, executive leadership, specialized functional teams (Tech, Media, Product, Events), faculty mentorship, event registrations, projects, gallery, and blog publications. Backed by a zero-maintenance, zero-cost architecture with a Google OAuth-protected Admin CMS, club executives can manage all site content, toggle modules dynamically, and export event registrations without touching code.

---

## 2. Problem Statement
College clubs struggle with static websites that quickly become outdated due to code modification overhead. Furthermore, student organizations lack the budget for costly hosting tiers, complex database infrastructures, and commercial CMS platforms. AI Foundry requires a modern, high-aesthetic, animated web portal that runs entirely on free tier infrastructure (Vercel, Upstash Redis, Local JSON fallback) and empowers non-technical club leads to update events, team rosters, photo galleries, and page visibilities seamlessly.

---

## 3. Target Users & Personas

### Persona 1: Prospective Member / Student Visitor
- **Name**: Aryan Sharma (2nd Year B.Tech CSE)
- **Goals**: Discover what AI Foundry does, browse ongoing AI & startup projects, register for upcoming hackathons/workshops, apply for team recruitment.
- **Frustrations**: Clunky registration forms, lack of mobile optimization, broken links, outdated event dates.

### Persona 2: Club Executive / Administrator
- **Name**: Syed Amaan (CEO) / Suhil Khan (COO) / Mallikarjuna DM (CTO)
- **Goals**: Create new event postings, toggle registration modes (built-in form vs Google Form), reorder team hierarchy, upload event photos, review incoming member applications, disable unready pages (e.g., Blog or Projects).
- **Frustrations**: Hardcoded site changes requiring developer intervention, database maintenance overhead, costly hosting bills.

### Persona 3: Faculty & University Leadership
- **Name**: Dr. Jayavrinda Vrindavanam V (Chairperson CSE AI & ML, Club Coordinator)
- **Goals**: Review student club activities, verify event legitimacy, share official club presence with university stakeholders and industry partners.

---

## 4. User Stories

- **As a Student**, I want to browse upcoming events and register via mobile or desktop so that I can participate in club workshops.
- **As a Student**, I want to view the club hierarchy and executive leads so that I can reach out to relevant department heads.
- **As an Admin**, I want to log in securely with my approved Google account so that I can modify site content without passwords.
- **As an Admin**, I want to toggle page visibility (e.g. Blog or Projects) on/off so that unpopulated sections do not show on the live site.
- **As an Admin**, I want to switch between built-in event registration and external Google Forms so that I have flexibility per event type.
- **As an Admin**, I want to download event registrations and recruitment responses as CSV spreadsheets for operational use.

---

## 5. Feature List & Priority Matrix

| ID | Feature | Description | Priority | Acceptance Criteria | Assigned Chunk |
|---|---|---|---|---|---|
| F01 | Dynamic Hero & Navigation | Full viewport interactive hero with club logo, DSU badge, animated ASCII particle backdrop, and liquid glass navbar. | P0 | Loads fast, displays tagline, renders theme toggle and responsive drawer on mobile. | Chunk 06, 07 |
| F02 | About Section | Club mission, AI-first vision, faculty mentors, inauguration photo showcase. | P0 | Data fetched dynamically from CMS, renders Markdown/paragraphs cleanly. | Chunk 07 |
| F03 | Team Directory | Hierarchical grouping: Executive (CEO, COO, CTO), Functional Teams, Faculty Advisors. | P0 | Displays cards with hover effects, social links, role badges, and email contacts. | Chunk 07 |
| F04 | Events System & Countdown | Upcoming/Past event feeds, featured event countdown timer, venue and deadline displays. | P0 | Event card 4-state handling, auto-expiration of deadlines, countdown ticker. | Chunk 07 |
| F05 | Event Registration System | Built-in registration form with localStorage persistence and Google Form link support. | P0 | Validates email/phone, saves submission, shows instant success confirmation. | Chunk 07 |
| F06 | Google OAuth Admin Access | Whitelisted Google email authentication for club executives. | P0 | Blocks unauthorized accounts with 403, signs secure JWT session cookie. | Chunk 03 |
| F07 | Admin Control Center | Central dashboard with real-time statistics, registration feeds, and shortcut controls. | P0 | Displays active counts, system health, and navigation to sub-managers. | Chunk 08 |
| F08 | Dynamic Content CMS | Form editors for Hero text, About text, Team members, Events, and Media. | P0 | Real-time CRUD operations, image URL binding, drag-reorder capabilities. | Chunk 08 |
| F09 | Page Visibility Manager | Checkbox toggles to show/hide Blog, Projects, Gallery, Contact, Recruitment. | P0 | Hidden pages vanish from navbar and return 404 for visitors while accessible to Admin preview. | Chunk 04, 08 |
| F10 | Registrations CSV Export | One-click spreadsheet download of event attendees and recruitment candidates. | P0 | Generates sanitized UTF-8 CSV formatted file with timestamp. | Chunk 04, 08 |
| F11 | Theme Engine & Design Tokens | Multi-palette system (Cyan Glow, Emerald, Purple Void, Amber) with instant CSS variable switching. | P1 | Smooth 400ms color transition, persists in localStorage. | Chunk 06 |
| F12 | Photo & Video Gallery | Categorized media albums with auto-scrolling marquee and modal lightbox. | P1 | Supports YouTube embeds and direct CDN images with responsive aspect ratios. | Chunk 09 |
| F13 | Project Showcase | Interactive cards for student-built AI models, startup MVPs, and research papers. | P1 | Tagged by tech stack with GitHub and demo links. Toggleable. | Chunk 09 |
| F14 | Blog & Technical Articles | Markdown-rendered articles with reading time and author attribution. | P1 | Rich text editor in admin, searchable and filterable. Toggleable. | Chunk 09 |
| F15 | Member Recruitment Portal | Multi-step recruitment application form with team preference selection. | P1 | Captures resume links, portfolio, and motivation. Submissions stored in CMS. | Chunk 09 |
| F16 | Contact & Campus Map | Contact inquiry form, DSU campus coordinates, official email links. | P1 | Rate-limited form, maps embed, anti-spam validation. | Chunk 09 |

---

## 6. Non-Functional Requirements
- **Performance**: Lighthouse score >= 90; Largest Contentful Paint (LCP) < 2.0s; First Input Delay (FID) < 100ms.
- **Security**: Strict Content Security Policy (CSP), HTTP-only SameSite JWT cookies, parameterized and sanitized JSON storage, rate-limiting on all public endpoints.
- **Accessibility**: WCAG AA compliance, semantic HTML5, keyboard navigation focus rings, screen-reader aria-labels.
- **Reliability**: Dual-layer storage (Upstash Redis with automatic Local JSON seeding and fallback) ensuring zero downtime even if Redis is unreachable.
- **Mobile First**: 100% viewport optimization across 360px (mobile) to 1920px (ultra-wide desktop).

---

## 7. Out of Scope
- Public user accounts / student login portals (all public features are open access).
- Paid ticketing / payment gateway processing (all club events are free or handled via university portals).
- Real-time chat servers (communication remains on official Discord/WhatsApp channels).
