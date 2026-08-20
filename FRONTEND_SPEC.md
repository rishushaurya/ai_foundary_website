# Frontend Engineering Specification (FRONTEND_SPEC.md)
Version: 1.0.0
Date: 2026-08-18
Project: AI Foundry (RAISE AI CLUB) - Dayananda Sagar University

---

## 1. Universal UI Rules & Architecture

### 1.1 The 4-State Component Rule
Every data-driven component (Events Feed, Team Grid, Gallery View, Blog Catalog, Admin Lists) must explicitly implement four discrete visual states:
1. **Loading State**: Displays a custom content-shaped skeleton placeholder with a CSS shimmer gradient animation. Never use spinning circles.
2. **Success State**: Renders rich data with smooth entrance fade and interactive hover effects.
3. **Empty State**: Renders an icon from Lucide React, a title, a helpful explanation, and a call-to-action button.
4. **Error State**: Displays a non-destructive error boundary banner with a user-friendly error message and an interactive "Retry" trigger.

### 1.2 Form Data Persistence
All user-facing input forms (Event Registration, Member Recruitment Application, Contact Inquiry) implement keystroke-level persistence:
- Data is saved to `localStorage` under keys formatted as `aifoundry:form:[form_id]`.
- On page refresh or network disconnection, form values restore automatically.
- Upon successful server response, the `localStorage` key is automatically purged.

### 1.3 Debouncing & Throttling Standards
- Search inputs and filter queries: Debounced at 300ms.
- Form auto-save backups: Debounced at 500ms.
- Scroll events, canvas animation recalculations: Throttled at 100ms.
- Window resize listeners: Debounced at 250ms.

---

## 2. Design System & CSS Token Architecture

All colors, spacing, border radii, and transitions are managed exclusively via CSS Custom Properties defined in `:root`:

```css
:root {
  --bg-primary: #000000;
  --bg-secondary: #0a0a0a;
  --bg-surface: rgba(255, 255, 255, 0.03);
  --bg-surface-hover: rgba(255, 255, 255, 0.08);
  --text-primary: #ffffff;
  --text-secondary: #a0a0a0;
  --text-muted: #666666;
  --accent: #00f0ff;
  --accent-glow: rgba(0, 240, 255, 0.2);
  --border: rgba(255, 255, 255, 0.1);
  --border-hover: rgba(0, 240, 255, 0.4);
  --card-bg: rgba(10, 10, 10, 0.7);
  --nav-bg: rgba(0, 0, 0, 0.6);
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-full: 9999px;
  --transition-fast: 150ms ease;
  --transition-normal: 300ms ease;
  --transition-slow: 500ms ease;
}
```

---

## 3. Responsive Breakpoints
- **Mobile (`< 640px`)**: Single column stacked views, bottom-safe navigation padding, modal drawers for registration, collapsed mobile drawer menu.
- **Tablet (`640px - 1024px`)**: 2-column grid for team and events, sticky header.
- **Desktop (`> 1024px`)**: Multi-column grids (3 to 4 columns), full liquid glass navigation with inline theme switcher.

---

## 4. Accessibility & Navigation Standards
- **Icons**: Strictly SVG components from `lucide-react`. Zero emojis or raw Unicode glyphs in UI buttons.
- **Contrast**: Text elements enforce WCAG AA minimum 4.5:1 contrast against dynamic card backgrounds.
- **Keyboard Traps**: Modal dialogues (Event Registration, Image Lightbox) trap keyboard tab order and close on `Escape`.
