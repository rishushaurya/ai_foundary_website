# Teammate & Presentation Guide (TEAMMATE_GUIDE.md)
Version: 1.0.0
Date: 2026-08-18
Project: AI Foundry (RAISE AI CLUB) - Dayananda Sagar University

---

## 1. What Is AI Foundry in One Sentence?
**AI Foundry (RAISE AI CLUB)** is Dayananda Sagar University's student-led innovation hub that transforms engineering students into AI innovators and startup founders through hands-on hackathons, research initiatives, and multidisciplinary projects.

---

## 2. The Problem We Solve
Engineering colleges have immense student talent, but AI enthusiasts, web developers, UI designers, and business minds often work in silos. Furthermore, student clubs struggle with static websites that quickly become outdated. **AI Foundry** unites these disciplines under one roof and powers its entire organization with an autonomous, zero-cost, CMS-driven web platform.

---

## 3. How It Works

### Simple Version (For General Audience & New Recruits)
- Students visit the website to discover upcoming hackathons, workshops, and AI projects.
- They register with one tap on their phones.
- Behind the scenes, club leads manage every photo, event, and announcement from a secure Admin Dashboard without writing a single line of code.

### Technical Version (For Faculty, Judges & Tech Mentors)
- Built on **Next.js 16 App Router** with TypeScript and Tailwind CSS 4.
- Dual-tier data persistence: **Upstash Serverless Redis** for production on Vercel with zero-cost **Local JSON** fallback.
- **Edge Middleware** enforces Google OAuth 2.0 single sign-on with cryptographic JWT verification and strict email whitelisting.
- **CSS Variable Theme Engine** provides instant runtime theme swaps across 4 custom dark palettes with zero layout shift.

---

## 4. 3-Minute Pitch Script

- **[0:00 - 0:30] Hook & Problem**:
  *"Good morning/afternoon everyone. Artificial Intelligence is transforming every industry, but universities face a challenge: how do we empower students to move beyond classroom theory into building real AI startups? At Dayananda Sagar University, our answer is AI Foundry."*

- **[0:30 - 1:15] The Solution & Club Structure**:
  *"Branded as the RAISE AI Club—Responsible Artificial Intelligence—we unite Tech, Media, Product, and Event management teams under faculty mentorship from our Department of CSE AI & ML. Together, we conduct hackathons, build open-source tools, and incubate student-led ventures."*

- **[1:15 - 2:15] The Platform Demonstration**:
  *"To support our mission, we built this dynamic web ecosystem. It features live countdowns for hackathons, 1-click mobile registration with offline data preservation, and a custom Admin CMS. Our executives can update events, toggle new pages on/off, and export attendee rosters in seconds—operating at $0 hosting cost."*

- **[2:15 - 3:00] Impact & Call to Action**:
  *"Whether you are a student looking to build your first neural network, a designer creating next-gen interfaces, or an aspiring founder, AI Foundry is your launchpad. Explore our projects, register for our upcoming hackathon, and join the AI Foundry family today. Thank you!"*

---

## 5. Judge Q&A Cheat Sheet

- **Q: How much does it cost to host and maintain this website?**
  *A: Exactly $0. We engineered the platform to run entirely on Vercel's serverless edge tier combined with Upstash Redis and local JSON caching, maintaining high speed without server bills.*

- **Q: How do you prevent unauthorized students from changing event data?**
  *A: Security is enforced at the edge middleware level using Google OAuth. Only university and club email addresses explicitly whitelisted by leadership can sign in and receive an authenticated JWT session.*

- **Q: What happens if internet connectivity drops during registration?**
  *A: The forms implement keystroke-level localStorage persistence. Even if a student's browser closes or reloads, their form inputs remain intact.*
