# Design Tokens & Theme Palettes (DESIGN_TOKENS.md)
Version: 1.0.0
Date: 2026-08-18
Project: AI Foundry (RAISE AI CLUB) - Dayananda Sagar University

---

## 1. Color Palettes (CSS Variable Sets)

### Theme 1: Cyan Pulse (Default AI Foundry Brand)
```css
--bg-primary: #000000;
--bg-secondary: #0a0a0a;
--text-primary: #ffffff;
--text-secondary: #94a3b8;
--text-muted: #64748b;
--accent: #00f0ff;
--accent-glow: rgba(0, 240, 255, 0.2);
--border: rgba(255, 255, 255, 0.1);
--border-hover: rgba(0, 240, 255, 0.4);
--card-bg: rgba(10, 10, 10, 0.7);
--nav-bg: rgba(0, 0, 0, 0.65);
```

### Theme 2: Emerald Matrix
```css
--bg-primary: #000000;
--bg-secondary: #050d0a;
--text-primary: #ffffff;
--text-secondary: #86efac;
--text-muted: #4ade80;
--accent: #10b981;
--accent-glow: rgba(16, 185, 129, 0.25);
--border: rgba(16, 185, 129, 0.15);
--border-hover: rgba(16, 185, 129, 0.5);
--card-bg: rgba(5, 13, 10, 0.7);
--nav-bg: rgba(0, 0, 0, 0.7);
```

### Theme 3: Purple Void
```css
--bg-primary: #05020a;
--bg-secondary: #0e0517;
--text-primary: #ffffff;
--text-secondary: #d8b4fe;
--text-muted: #a855f7;
--accent: #c084fc;
--accent-glow: rgba(192, 132, 252, 0.25);
--border: rgba(192, 132, 252, 0.15);
--border-hover: rgba(192, 132, 252, 0.5);
--card-bg: rgba(14, 5, 23, 0.7);
--nav-bg: rgba(5, 2, 10, 0.7);
```

### Theme 4: Solar Amber
```css
--bg-primary: #000000;
--bg-secondary: #0f0a02;
--text-primary: #ffffff;
--text-secondary: #fde047;
--text-muted: #eab308;
--accent: #f59e0b;
--accent-glow: rgba(245, 158, 11, 0.25);
--border: rgba(245, 158, 11, 0.15);
--border-hover: rgba(245, 158, 11, 0.5);
--card-bg: rgba(15, 10, 2, 0.7);
--nav-bg: rgba(0, 0, 0, 0.7);
```

---

## 2. Typography Tokens
- **Font Families**:
  - Headings & Badges: `var(--font-geist-mono), monospace`
  - Body & Descriptions: `var(--font-geist-sans), sans-serif`
- **Font Sizes**: `xs` (12px), `sm` (14px), `base` (16px), `lg` (18px), `xl` (20px), `2xl` (24px), `3xl` (30px), `4xl` (36px), `5xl` (48px), `6xl` (64px).
- **Line Heights**: `leading-none` (1), `leading-tight` (1.25), `leading-relaxed` (1.625).
