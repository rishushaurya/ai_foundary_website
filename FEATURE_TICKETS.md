# Feature Tickets (FEATURE_TICKETS.md)
Version: 1.0.0
Date: 2026-08-18
Project: AI Foundry (RAISE AI CLUB) - Dayananda Sagar University

---

## Ticket Overview Matrix

| Ticket ID | Title | Priority | Effort | Chunk | Dependencies |
|---|---|---|---|---|---|
| T-001 | Diagnostics Script & Environment Verification | P0 | Small | Chunk 00 | None |
| T-002 | Next.js 16 Project Scaffolding & Dependencies | P0 | Medium | Chunk 01 | T-001 |
| T-003 | Local JSON & Upstash Dual-Layer Storage Engine | P0 | Medium | Chunk 02 | T-002 |
| T-004 | Google OAuth Authentication & Edge Security Middleware | P0 | Medium | Chunk 03 | T-002 |
| T-005 | Admin REST API Route Handlers (CRUD & CSV Export) | P0 | Large | Chunk 04 | T-003, T-004 |
| T-006 | Deterministic Seed Datasets (Club, Faculty, Events) | P0 | Small | Chunk 05 | T-003 |
| T-007 | Liquid Glass Nav, ASCII Background & Design Tokens | P0 | Large | Chunk 06 | T-002, T-005 |
| T-008 | Core Public Pages (Home, About, Team, Events, Registration) | P0 | Large | Chunk 07 | T-005, T-006, T-007 |
| T-009 | Admin CMS Dashboard & Management Interfaces | P0 | Large | Chunk 08 | T-005, T-007 |
| T-010 | Extended Modules (Gallery, Blog, Projects, Recruitment, Contact) | P1 | Large | Chunk 09 | T-008, T-009 |

---

## Detailed Feature Tickets

### Ticket T-001: Diagnostics Script & Environment Verification
- **Acceptance Criteria**: `node diagnostics.js` verifies Node.js version, file permissions, environment configuration, and structure.
- **Test Case**: Run command; returns all green PASS checks with zero exit code.

### Ticket T-002: Next.js 16 Project Scaffolding & Dependencies
- **Acceptance Criteria**: Clean Next.js 16 application configured with TypeScript, Tailwind CSS 4, Framer Motion, Lucide React, and Jose JWT.
- **Test Case**: `npm run build` completes with 0 errors.

### Ticket T-003: Local JSON & Upstash Dual-Layer Storage Engine
- **Acceptance Criteria**: `lib/local-db.ts` reads/writes to Upstash Redis if environment variables are provided; gracefully falls back to local `data/*.json` without error.
- **Test Case**: Query data with Redis disabled; reads local file effortlessly.

### Ticket T-004: Google OAuth Authentication & Edge Security Middleware
- **Acceptance Criteria**: `/admin/*` routes intercept unauthorized requests and redirect to `/admin/login`. Valid login issues HTTP-only JWT cookie.
- **Test Case**: Visiting `/admin` unauthenticated yields 307 redirect to `/admin/login`.

### Ticket T-005: Admin REST API Route Handlers (CRUD & CSV Export)
- **Acceptance Criteria**: Full CRUD endpoints for team, events, content, gallery, settings, and registrations. `/api/admin/export` produces downloadable CSV.
- **Test Case**: POST new team member; GET confirms member is present in dataset.

### Ticket T-006: Deterministic Seed Datasets (Club, Faculty, Events)
- **Acceptance Criteria**: Pre-loaded data for Dayananda Sagar University, Dr. Jayavrinda Vrindavanam V, Dr. M Lakshmanan, Dr. A. A. Nippun Kumaar, Syed Amaan, Suhil Khan, Mallikarjuna DM.
- **Test Case**: Verify initial dataset includes all verified faculty and executive names.

### Ticket T-007: Liquid Glass Nav, ASCII Background & Design Tokens
- **Acceptance Criteria**: Interactive ASCII particle backdrop with liquid glass navigation, theme picker modal, and responsive mobile menu.
- **Test Case**: Clicking theme swatch updates global CSS variables instantly.

### Ticket T-008: Core Public Pages (Home, About, Team, Events, Registration)
- **Acceptance Criteria**: 4-state components for all feeds, event countdown timer, interactive team cards with role badges, modal registration form with localStorage preservation.
- **Test Case**: Submit event registration; verifies payload is stored and visible to admin.

### Ticket T-009: Admin CMS Dashboard & Management Interfaces
- **Acceptance Criteria**: Intuitive control center allowing live edits to hero text, team rosters, event dates, registration modes, and page visibility toggles.
- **Test Case**: Toggle "Blog" off in settings; verify Blog disappears from visitor navbar.

### Ticket T-010: Extended Modules (Gallery, Blog, Projects, Recruitment, Contact)
- **Acceptance Criteria**: Auto-scrolling photo marquee, project showcase cards, Markdown blog renderer, club recruitment application form, contact form with DSU map.
- **Test Case**: Submit recruitment application; entry is recorded and exportable.
