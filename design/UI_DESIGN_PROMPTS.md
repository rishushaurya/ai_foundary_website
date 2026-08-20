# UI Design Prompts & Aesthetics (UI_DESIGN_PROMPTS.md)
Version: 1.0.0
Date: 2026-08-18
Project: AI Foundry (RAISE AI CLUB) - Dayananda Sagar University

---

## 1. Aesthetic Direction & Mood
- **Visual Identity**: Cybernetic, High-Aesthetic Dark Mode, Precision Monospace Typography, Subtle Cyan/Neon Glows, Frosted Glass (Liquid Glassmorphism), and Interactive ASCII Particle Backgrounds.
- **Inspirations**: Linear.app, Vercel, Raycast, and the Brahmagupta Mathematics Club portal.
- **Rule**: NO emojis anywhere in the interface. Use clean Lucide SVG icons.

---

## 2. Component Specifications

### 2.1 Hero Section
- **Background**: Interactive Canvas particle mesh with mouse-proximity reactive nodes.
- **Center**: High-resolution metallic AI Brain logo with glowing gear perimeter.
- **Typography**: Large uppercase monospace heading (`font-mono tracking-widest`), subtitle in clean sans-serif.
- **Badges**: DSU institutional badge with yellow/blue crest, department affiliation.

### 2.2 Liquid Glass Navigation Bar
- **Desktop**: Pill-shaped floating container with backdrop-filter `blur(16px)`, translucent border, hover-glow links, and inline theme switcher.
- **Mobile**: Minimalist sticky header with slide-down full-screen animated navigation drawer.

### 2.3 Event Cards & Countdown
- **Frame**: Semi-transparent card (`rgba(10, 10, 10, 0.7)`) with 1px dotted border that transitions to accent glow on hover.
- **Badge**: Status indicator (`UPCOMING`, `ONGOING`, `ENDED`).
- **Registration Trigger**: Modal popup with smooth backdrop blur.
