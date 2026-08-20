# Technical Architecture Document (TAD)
Version: 1.0.0
Date: 2026-08-18
Project: AI Foundry - Dayananda Sagar University

---

## 1. System Architecture Overview

```
+-----------------------------------------------------------------------------------+
|                                 CLIENT CLIENTS                                    |
|   Desktop Browser (Chrome/Firefox/Safari)  |  Mobile / Tablet (iOS/Android Web)  |
+-----------------------------------------------------------------------------------+
                                         |
                                         | HTTPS (Vercel Edge Network / CDN)
                                         v
+-----------------------------------------------------------------------------------+
|                              NEXT.JS 16 APP ROUTER                                |
|                                                                                   |
|  +-----------------------------------------------------------------------------+  |
|  |                           EDGE MIDDLEWARE (src/middleware.ts)               |  |
|  | - Intercepts /admin/* & /api/admin/*                                        |  |
|  | - Verifies JWT Session Cookie (jose HS256)                                 |  |
|  | - Enforces Whitelisted Email Authorization                                  |  |
|  +-----------------------------------------------------------------------------+  |
|                                        |                                          |
|       +--------------------------------+--------------------------------+         |
|       |                                                                 |         |
|       v                                                                 v         |
|  +---------------------------+                             +--------------------+ |
|  |   PUBLIC SSR/CSR ROUTES   |                             | ADMIN API ROUTES   | |
|  | - / (Home / Hero / Events)|                             | - /api/admin/team  | |
|  | - /about (Mission / Ment) |                             | - /api/admin/events| |
|  | - /events (Registrations) |                             | - /api/admin/media | |
|  | - /team (Hierarchy/Leads) |                             | - /api/admin/sett. | |
|  | - /gallery (Media Grid)   |                             | - /api/admin/export| |
|  | - /blog (Tech Articles)   |                             | - /api/auth/*      | |
|  | - /projects (Showcase)    |                             +--------------------+ |
|  | - /contact & /recruit     |                                        |           |
|  +---------------------------+                                        |           |
|                |                                                      |           |
|                +-----------------------+------------------------------+           |
|                                        v                                          |
|                      +----------------------------------+                         |
|                      |  DATA ACCESS LAYER (src/lib/)    |                         |
|                      |  - lib/data.ts (Domain API)      |                         |
|                      |  - lib/local-db.ts (Dual Storage)|                         |
|                      +----------------------------------+                         |
+----------------------------------------|------------------------------------------+
                                         |
                       +-----------------+-----------------+
                       |                                   |
                       v                                   v
+--------------------------------------+ +------------------------------------------+
|       PRIMARY: UPSTASH REDIS         | |      FALLBACK: LOCAL JSON STORAGE        |
| - REST API over HTTPS                | | - Synchronous / Asynchronous FS read/write|
| - Global key-value cache             | | - Initial seed datasets in /data/*.json   |
| - Free tier (10k requests/day)       | | - Zero runtime external dependencies     |
+--------------------------------------+ +------------------------------------------+
```

---

## 2. Component Inventory & Technology Stack

| Layer | Technology | Version | Rationale & Architectural Fit |
|---|---|---|---|
| Framework | Next.js App Router | 16.x | Hybrid Server Component rendering for rapid SEO, coupled with API route handlers for CMS operations on Vercel. |
| Language | TypeScript | 5.x | End-to-end type safety across domain interfaces, API responses, and theme configurations. |
| UI Runtime | React & React-DOM | 19.x | Concurrent rendering and streaming SSR. |
| Styling | Tailwind CSS & CSS Vars | 4.x | Utility-first styling combined with a fluid CSS variable system for dynamic runtime palette swaps. |
| Animation | Framer Motion & GSAP | 12.x / 3.x | Hardware-accelerated transitions, marquee scrolling, morphing card stacks, and liquid nav interactions. |
| Icons | Lucide React | Latest | Clean, accessible SVG icon components without raw emoji dependencies. |
| Authentication | NextAuth.js / Jose JWT | 6.x | Secure Google OAuth 2.0 authorization, backed by encrypted HTTP-only session cookies. |
| Primary Database | Upstash Redis | 1.37.x | Serverless REST-based Redis client ideal for stateless cloud functions with no connection pooling bottleneck. |
| Fallback Database | Local JSON File Engine | Builtin | Guarantees local development mode works out-of-the-box with zero environment configuration. |

---

## 3. Data Flow Architecture

### Public Event Registration Flow:
1. User enters registration details on `/events` page.
2. Client-side input validation executes (email format, 10-digit phone, mandatory name).
3. Payload is optimistically stored in `localStorage` to guard against network dropouts.
4. HTTP POST dispatched to `/api/events/register` with rate-limit check.
5. Server validates payload via schema validation.
6. Record appended to Redis `aifoundry:events.json` (and written to disk).
7. Success response returned; client clears `localStorage` backup and displays animated confirmation badge.

### Admin Content Modification Flow:
1. Admin authenticates via Google OAuth; server verifies email against `settings.json` whitelist.
2. On success, an encrypted `admin-token` JWT cookie is issued.
3. Admin edits team rosters, reorders items, or toggles page visibility in `/admin/settings`.
4. HTTP PUT dispatched to `/api/admin/*` carrying the session cookie.
5. Edge middleware verifies JWT signature.
6. Handler writes updated entity payload to Upstash Redis and local JSON cache.
7. Next.js revalidation triggers cache purge, updating the public SSR pages instantly.

---

## 4. Security Architecture

- **Token Security**: HS256-signed JWTs containing subject email, issued timestamp, and 7-day expiration.
- **Zero-Trust Backend**: Edge middleware guards `/admin/*` and `/api/admin/*`. Public endpoints strictly reject administrative payloads.
- **CORS Policy**: Restricted strictly to self-origin (`same-origin`).
- **HTTP Security Headers**:
  - `Content-Security-Policy`: Default self, styles unsafe-inline (required for CSS variables), images from self + authorized CDNs.
  - `X-Frame-Options`: DENY.
  - `X-Content-Type-Options`: nosniff.
  - `Referrer-Policy`: strict-origin-when-cross-origin.
  - `Strict-Transport-Security`: max-age=31536000; includeSubDomains; preload.

---

## 5. Scalability & Resilience Strategy
- **Traffic Spikes (e.g. Hackathon Launch)**: Public views are statically optimized with incremental cache revalidation. Static assets served globally via Vercel Edge CDN.
- **Database Limits**: If Upstash daily free-tier request quota approaches limits, in-memory caching and local JSON fallback activate seamlessly without throwing 500 errors.
- **Fault Isolation**: Public user journeys (viewing club info, registering for events) are decoupled from the Admin CMS infrastructure.
