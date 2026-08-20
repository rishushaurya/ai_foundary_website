# Implementation Plan (IMPLEMENTATION_PLAN.md)
Version: 1.0.0
Date: 2026-08-18
Project: AI Foundry (RAISE AI CLUB) - Dayananda Sagar University

---

## 1. Project Overview & Architecture Blueprint

AI Foundry is a full-stack Next.js 16 Web Application and Content Management System built for the flagship AI & Entrepreneurship club at Dayananda Sagar University. Designed for zero-cost operation on Vercel and Upstash Redis, the system enables complete dynamic control of public-facing content via a secure Google OAuth-authenticated admin panel.

---

## 2. Service Matrix & Free Tier Allocations

| Service / Resource | Provider | Role | Free Tier Capacity | Fallback Mechanism |
|---|---|---|---|---|
| Hosting & Edge CDN | Vercel | Web server, API routes, edge caching | 100 GB bandwidth, unlimited serverless invocations | Local Node.js runtime |
| Cloud Database | Upstash Redis | REST-based KV data persistence | 10,000 commands/day | Local JSON storage in `/data/*.json` |
| Authentication | Google Cloud OAuth | Single Sign-On for administrators | Unlimited OAuth 2.0 authentications | Demo admin login mode |
| Image Hosting | Local / Public CDN | Team photos, event banners, gallery | Standard static asset serving | Direct public URL links |

---

## 3. Database Schema (JSON Datasets)

### 3.1 `data/team.json`
```json
[
  {
    "id": "team-01",
    "name": "Syed Amaan",
    "role": "CEO",
    "category": "executive",
    "subteam": "Leadership",
    "image": "/uploads/team/amaan.png",
    "email": "amaan@aifoundry.club",
    "socialLinks": {
      "linkedin": "https://linkedin.com/in/syedamaan",
      "github": "https://github.com/syedamaan"
    },
    "order": 1,
    "showOnHome": true
  }
]
```

### 3.2 `data/events.json`
```json
[
  {
    "id": "evt-01",
    "title": "AI Foundry Launch & GenAI Hackathon",
    "description": "24-hour sprint developing ethical AI solutions for real-world enterprise problems.",
    "date": "2026-09-15T09:00:00Z",
    "venue": "DSU Main Auditorium / Innovation Lab",
    "image": "/uploads/events/hackathon.png",
    "status": "upcoming",
    "registrationMode": "builtin",
    "googleFormUrl": "",
    "registrationDeadline": "2026-09-14T23:59:59Z",
    "isCountdownEvent": true,
    "showOnHome": true,
    "showOnEventPage": true,
    "registrations": []
  }
]
```

### 3.3 `data/settings.json`
```json
{
  "siteTitle": "AI Foundry | Dayananda Sagar University",
  "defaultTheme": "cyan",
  "defaultAppearance": "dark",
  "adminEmails": [
    "amaan@gmail.com",
    "suhil@gmail.com",
    "mallikarjuna@gmail.com",
    "coordinator.aiml@dsu.edu.in"
  ],
  "heroTagline": "FORGING THE FUTURE OF ENTREPRENEURSHIP & ARTIFICIAL INTELLIGENCE",
  "heroSubtext": "Dayananda Sagar University's premier innovation ecosystem uniting engineers, designers, and startup founders.",
  "facultyHeading": "FACULTY MENTORS",
  "studentHeading": "CLUB LEADERSHIP & TEAMS",
  "developerHeading": "PLATFORM ARCHITECTS",
  "visiblePages": {
    "about": true,
    "events": true,
    "team": true,
    "gallery": true,
    "blog": true,
    "projects": true,
    "recruit": true,
    "contact": true
  },
  "socialLinks": {
    "instagram": "https://instagram.com/aifoundry_dsu",
    "linkedin": "https://linkedin.com/company/aifoundry-dsu",
    "github": "https://github.com/aifoundry-dsu",
    "discord": "https://discord.gg/aifoundry",
    "whatsapp": "https://chat.whatsapp.com/aifoundry"
  }
}
```

---

## 4. API Endpoints Table

| Method | Endpoint | Description | Auth Required | Rate Limit |
|---|---|---|---|---|
| GET | `/api/health` | System health, storage status & uptime check | No | 100 req/min |
| GET | `/api/content` | Public fetch for all page content & settings | No | 200 req/min |
| POST | `/api/events/register` | Submit visitor event registration | No | 10 req/min/IP |
| POST | `/api/recruit/submit` | Submit member recruitment application | No | 5 req/min/IP |
| POST | `/api/auth/login` | Google OAuth exchange or Demo login | No | 10 req/min/IP |
| POST | `/api/auth/logout` | Clear JWT session cookie | Yes | 30 req/min |
| GET | `/api/admin/overview` | Admin dashboard analytics & stats | Yes | 100 req/min |
| GET/PUT | `/api/admin/content` | Update Hero and About copy | Yes | 60 req/min |
| GET/POST/PUT/DELETE | `/api/admin/team` | CRUD operations for team roster | Yes | 60 req/min |
| GET/POST/PUT/DELETE | `/api/admin/events` | CRUD operations for club events | Yes | 60 req/min |
| GET/POST/DELETE | `/api/admin/gallery` | Manage photo albums & media links | Yes | 60 req/min |
| GET/PUT | `/api/admin/settings` | Update page visibility, themes & whitelist | Yes | 30 req/min |
| GET | `/api/admin/export` | Download CSV for events or recruitment | Yes | 20 req/min |
| POST | `/api/admin/upload` | Handle media uploads to local/cloud storage | Yes | 20 req/min |

---

## 5. Security & Isolation Measures
1. **Parameterized & Sanitized Writes**: All JSON and Redis operations enforce atomic key updates.
2. **Whitelist-Enforced Authorization**: Authenticated Google profiles are checked against `settings.adminEmails` before issuing session tokens.
3. **Form Persistence**: Keystroke-level `localStorage` caching ensures forms never lose user data upon network failures.
4. **Rate-Limiting**: IP-based sliding window rate-limiting on registration forms protects against spam attacks.
5. **No Leaked Stack Traces**: Production API responses return clean error objects with unique `requestId` references.
