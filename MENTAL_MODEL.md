# Mental Model (MENTAL_MODEL.md)
Version: 1.0.0
Date: 2026-08-18
Project: AI Foundry (RAISE AI CLUB) - Dayananda Sagar University

---

## 1. How the System Works in Plain English

AI Foundry's web application is designed so that any student, club executive, or future developer can understand how data moves without inspecting lines of source code.

### 1.1 "When a visitor opens the website..."
- The browser contacts the server (hosted free on Vercel).
- Next.js fetches the site settings, team roster, upcoming events, and gallery items using the data layer (`lib/data.ts`).
- The data layer looks in Upstash Redis first (cloud key-value store). If it's the very first time running or if Redis is offline, it instantly reads the local JSON files stored right inside the project (`data/*.json`).
- The web page renders with glowing dark-theme aesthetics, ASCII particle backgrounds, and the club's cyan-accented branding.
- If the visitor switches the theme from "Cyan" to "Emerald" or "Purple Void", the site instantly swaps CSS variables across the entire document without reloading the page.

### 1.2 "When a visitor registers for an event..."
- The student fills out their name, college email, phone number, and branch.
- On every single keystroke, the form saves a backup into their browser's `localStorage`. If their browser crashes or network drops, their typed text is never lost.
- When they click "Register", the server receives the request, checks that the phone and email are valid, appends their registration to the event record, and responds with a success signal.
- The browser clears the `localStorage` draft and displays an animated confirmation badge.
- If the event organizer chose "Google Form Mode" instead, clicking register opens the official Google Form in a new tab.

### 1.3 "When an admin logs into the CMS..."
- The admin navigates to `/admin/login` and signs in with their Google account.
- The server checks: *"Is this Google email address listed in our approved `adminEmails` list inside `settings.json`?"*
- If **NO**, the server blocks the request and shows an "Unauthorized Account" notice.
- If **YES**, the server creates a cryptographically signed cookie (`admin-token`).
- With this token, the admin enters the Dashboard. They can:
  - Add new team members or move people between CEO, COO, CTO, Tech, Media, and Faculty groups.
  - Create new hackathons, set registration deadlines, and flip the countdown switch.
  - Download an Excel/CSV spreadsheet of all registered attendees with one click.
  - Turn pages like "Blog", "Projects", "Gallery", or "Recruitment" ON or OFF. Turning a page off hides it from the navbar and disables direct visitor access until the club is ready to publish it.

### 1.4 "Zero Cost, Zero Maintenance Guarantee"
- The website requires **no paid monthly database** and **no paid server subscriptions**.
- When running locally on a developer's laptop, it works 100% offline using `data/*.json`.
- When deployed live to Vercel, it uses Upstash Redis's generous free tier (10,000 requests/day).
- If the free tier limits are ever exceeded during high traffic, the app automatically falls back to local data without crashing.
