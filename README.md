# AI Foundry (RAISE AI CLUB) - Web Platform
**Dayananda Sagar University, Bengaluru**

---

## 1. Project Identity
- **Organization**: AI Foundry (RAISE AI CLUB - Responsible Artificial Intelligence)
- **Institution**: Dayananda Sagar University (DSU), Bengaluru
- **Mission**: Bridging AI research, student entrepreneurship, and hands-on engineering across multidisciplinary student teams.
- **Repository Type**: Production Web Platform & Content Management System (CMS)
- **Hosting & Infrastructure Cost**: $0.00 / month (100% Free Tier on Vercel + Upstash Redis + Local Storage)

---

## 2. Complete File Map

```
ai-foundary-website/
├── data/                                 # Zero-cost local JSON storage
│   ├── blog.json                         # Technical articles & publications
│   ├── content.json                      # Hero, About, and Mission text
│   ├── events.json                       # Upcoming/Past events & registrations
│   ├── gallery.json                      # Photos, albums, and video links
│   ├── projects.json                     # AI & Startup project showcases
│   ├── recruitment.json                  # Member application entries
│   ├── settings.json                     # Site config, admin emails, page toggles
│   └── team.json                         # Executive, Teams & Faculty rosters
├── public/                               # Static assets & uploads
│   ├── college-logo.png                  # Dayananda Sagar University emblem
│   ├── club-logo.png                     # AI Foundry (RAISE AI CLUB) logo
│   └── uploads/                          # Dynamically uploaded images/media
├── src/
│   ├── app/                              # Next.js 16 App Router
│   │   ├── about/page.tsx                # About AI Foundry & DSU Vision
│   │   ├── admin/                        # Google OAuth-protected CMS
│   │   │   ├── content/page.tsx          # Hero & About copy editor
│   │   │   ├── events/page.tsx           # Event management & registrations
│   │   │   ├── gallery/page.tsx          # Media library & albums
│   │   │   ├── login/page.tsx            # Google OAuth sign-in portal
│   │   │   ├── settings/page.tsx         # Page toggles, themes & whitelist
│   │   │   ├── team/page.tsx             # Team hierarchy & member cards
│   │   │   ├── layout.tsx                # Admin sidebar shell
│   │   │   └── page.tsx                  # Dashboard analytics & quick actions
│   │   ├── api/                          # Next.js Serverless Route Handlers
│   │   │   ├── admin/                    # Protected admin REST endpoints
│   │   │   ├── auth/                     # Google OAuth & session verification
│   │   │   └── events/register/route.ts  # Public event registration handler
│   │   ├── blog/page.tsx                 # Technical articles list (toggleable)
│   │   ├── contact/page.tsx              # Campus map & contact form (toggleable)
│   │   ├── events/page.tsx               # Events catalog & registration modal
│   │   ├── gallery/page.tsx              # Photo & video gallery (toggleable)
│   │   ├── projects/page.tsx             # AI & Startup project showcases
│   │   ├── recruit/page.tsx              # Join AI Foundry recruitment portal
│   │   ├── team/page.tsx                 # Full leadership & team directory
│   │   ├── globals.css                   # Tailwind 4 theme & CSS variable tokens
│   │   ├── layout.tsx                    # Root layout with ASCII canvas & Nav
│   │   └── page.tsx                      # Main landing page
│   ├── components/
│   │   ├── admin/                        # CMS management UI components
│   │   └── ui/                           # High-aesthetic visitor UI components
│   │       ├── ascii-grid-background.tsx # Interactive canvas particle backdrop
│   │       ├── event-countdown.tsx       # Live ticker for featured event
│   │       ├── liquid-glass-nav.tsx      # Frosted glass navbar & theme picker
│   │       ├── minimal-footer.tsx        # Institutional footer with DSU links
│   │       ├── morphing-card-stack.tsx   # Interactive animated card container
│   │       ├── team-grid.tsx             # Hierarchical leadership & faculty grid
│   │       └── theme-switch-button.tsx   # Instant palette switcher
│   ├── lib/
│   │   ├── data.ts                       # Domain API data access abstraction
│   │   ├── local-db.ts                   # Upstash Redis + Local JSON dual engine
│   │   ├── theme-config.ts               # Color swatches & CSS variable sets
│   │   └── theme-context.tsx             # React theme provider & state hook
│   └── middleware.ts                     # Edge JWT & email whitelist validator
├── build/                                # Build chunk specifications
│   ├── MANIFEST.md                       # Multi-AI chunk lock & status tracker
│   ├── chunk-00.md                       # Diagnostics & test suite
│   ├── chunk-01.md                       # Next.js scaffolding & setup
│   └── ...                               # Chunks 02 through 09
├── CHANGELOG.md                          # Systematic session history
├── COMMANDS.md                           # Human shortcut commands
├── FEATURE_TICKETS.md                    # Work breakdown structure
├── IMPLEMENTATION_PLAN.md                # Full technical blueprint
├── MENTAL_MODEL.md                       # Plain English architectural explanation
├── PRD.md                                # Product requirements
├── TAD.md                                # Technical architecture
└── diagnostics.js                        # Automated self-test script
```

---

## 3. Build Order & Dependency Graph

```
[Chunk 00: Diagnostics]
          |
          v
[Chunk 01: Scaffolding & Setup]
          |
     +----+----+
     |         |
     v         v
[Chunk 02: Data Layer]    [Chunk 03: Auth System]
     |         |                   |
     v         +---------+---------+
[Chunk 05: Seed Data]    |
     |                   v
     |         [Chunk 04: Admin API Handlers]
     |                   |
     +---------+---------+
               |
               v
     [Chunk 06: Frontend Shell & Nav]
               |
          +----+----+
          |         |
          v         v
[Chunk 07: Public Pages]  [Chunk 08: Admin CMS UI]
          |         |
          +----+----+
               |
               v
[Chunk 09: Extended Modules & Polish]
```

---

## 4. Environment Variables Configuration

Create a `.env.local` file in the root directory (refer to `.env.example`):

```env
# Google OAuth Configuration (for Admin Login)
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=generate-a-secure-random-secret-here

# JWT Secret for Session Cookies
JWT_SECRET=super-secret-jwt-key-change-in-production

# Upstash Redis (Optional - for Cloud Persistence on Vercel)
KV_REST_API_URL=https://your-upstash-instance.upstash.io
KV_REST_API_TOKEN=your-upstash-rest-token

# Demo Mode (Set to true to bypass OAuth locally with mock credentials)
DEMO_MODE=true
```

---

## 5. Development & Deployment Guide

```bash
# 1. Install dependencies
npm install

# 2. Run automated diagnostics
node diagnostics.js

# 3. Start local development server
npm run dev

# 4. Open in browser
http://localhost:3000
```
