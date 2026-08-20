# Human Command Shortcuts (COMMANDS.md)
Version: 1.0.0
Date: 2026-08-18
Project: AI Foundry (RAISE AI CLUB) - Dayananda Sagar University

This document contains copy-paste prompts and instructions for humans to command any AI assistant working on this repository.

---

## 1. Setup & Build Commands

| Command | Action Performed |
|---|---|
| `"Run diagnostics"` | Executes `node diagnostics.js` to verify environment, storage files, dependencies, and syntax. |
| `"Set up the development environment"` | Runs `npm install`, copies `.env.example` to `.env.local`, and checks seed datasets. |
| `"Build everything from scratch"` | Executes chunks 00 through 09 sequentially, running tests after each chunk. |
| `"Execute Chunk [X]"` | Locks Chunk [X] in `build/MANIFEST.md`, writes code according to `build/chunk-[X].md`, and runs verification. |

---

## 2. Emergency & Troubleshooting Commands

| Command | Action Performed |
|---|---|
| `"The backend won't start — fix it"` | Inspects `src/app/api/` and `src/lib/local-db.ts`, checks port conflicts and missing env vars, and repairs startup sequence. |
| `"Everything is broken — start fresh from docs"` | Keeps `PRD.md`, `TAD.md`, and specifications; re-runs build starting from Chunk 01. |
| `"I have 5 minutes before demo — make it work"` | Enables `DEMO_MODE=true`, seeds fallback local data, and ensures public views and admin previews run with 0 errors. |
| `"Fix all lint/type errors"` | Runs `npm run lint` and `npx tsc --noEmit` and fixes every reported TypeScript or ESLint warning. |

---

## 3. UI & Design Commands

| Command | Action Performed |
|---|---|
| `"Switch default theme to [cyan/emerald/purple/amber]"` | Updates `settings.json` default theme swatch and adjusts CSS variables. |
| `"Redesign the [component name]"` | Refactors component in `src/components/ui/` adhering strictly to the 4-state lifecycle (Loading, Success, Error, Empty). |
| `"Add animation to [section]"` | Implements Framer Motion or GSAP scroll triggers and viewport reveal transitions. |

---

## 4. Feature & Content Commands

| Command | Action Performed |
|---|---|
| `"Add a new admin email: [email@gmail.com]"` | Appends the email to `adminEmails` in `data/settings.json` and updates access list. |
| `"Toggle [Blog / Projects / Gallery] on/off"` | Updates `visiblePages` in `data/settings.json` and verifies navbar updates immediately. |
| `"Add seed data for [Event/Team Member]"` | Injects new record into `data/events.json` or `data/team.json`. |
| `"Export all event registrations to CSV"` | Triggers `/api/admin/export?type=events` and saves CSV file to workspace root. |
