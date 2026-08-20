# Database & Storage Specification (DATABASE_SPEC.md)
Version: 1.0.0
Date: 2026-08-18
Project: AI Foundry (RAISE AI CLUB) - Dayananda Sagar University

---

## 1. Storage Architecture Overview

AI Foundry implements a serverless-optimized **Dual-Storage Engine** (`src/lib/local-db.ts`):
1. **Primary Cloud Layer (Production)**: Upstash Redis accessed via HTTP REST API. Key namespaces are prefixed with `aifoundry:`.
2. **Fallback Layer (Local Dev & Disaster Recovery)**: Synchronous and atomic JSON file reads/writes in the `data/` directory.

---

## 2. Entity Schemas & Key Maps

| File Name | Redis Key | TypeScript Interface | Description |
|---|---|---|---|
| `data/team.json` | `aifoundry:team.json` | `TeamMember[]` | Club executives, functional subteams, and faculty mentors. |
| `data/events.json` | `aifoundry:events.json` | `EventData[]` | Club events, hackathons, deadlines, and attendee lists. |
| `data/content.json` | `aifoundry:content.json` | `ContentSection[]` | Hero title, mission paragraphs, and dynamic text blocks. |
| `data/gallery.json` | `aifoundry:gallery.json` | `GallerySection[]` | Photo albums, video URLs, and inauguration archives. |
| `data/projects.json`| `aifoundry:projects.json`| `ProjectItem[]` | Student AI models, venture MVPs, and research papers. |
| `data/blog.json` | `aifoundry:blog.json` | `BlogPost[]` | Technical articles, news updates, and event recaps. |
| `data/recruitment.json`| `aifoundry:recruitment.json`| `RecruitmentEntry[]` | Member recruitment applications submitted by students. |
| `data/settings.json`| `aifoundry:settings.json`| `SiteSettings` | Site configuration, default theme, page visibilities, admin whitelist. |

---

## 3. Data Integrity & Concurrency
- Writes execute as atomic file replacements on the local filesystem.
- Reads cache the JSON structure in memory with a short revalidation window.
- In-memory cache is immediately invalidated on successful write operations.
