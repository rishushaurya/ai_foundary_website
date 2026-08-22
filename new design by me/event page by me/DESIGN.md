---
name: Obsidian Foundry Light
colors:
  surface: '#fcf8fb'
  surface-dim: '#dcd9dc'
  surface-bright: '#fcf8fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f3f5'
  surface-container: '#f0edef'
  surface-container-high: '#eae7ea'
  surface-container-highest: '#e4e2e4'
  on-surface: '#1b1b1d'
  on-surface-variant: '#414755'
  inverse-surface: '#303032'
  inverse-on-surface: '#f3f0f2'
  outline: '#717786'
  outline-variant: '#c1c6d7'
  surface-tint: '#005bc1'
  primary: '#0058bc'
  on-primary: '#ffffff'
  primary-container: '#0070eb'
  on-primary-container: '#fefcff'
  inverse-primary: '#adc6ff'
  secondary: '#5d5e63'
  on-secondary: '#ffffff'
  secondary-container: '#e0dfe4'
  on-secondary-container: '#626267'
  tertiary: '#8a2bb9'
  on-tertiary: '#ffffff'
  tertiary-container: '#a649d5'
  on-tertiary-container: '#fffbff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d8e2ff'
  primary-fixed-dim: '#adc6ff'
  on-primary-fixed: '#001a41'
  on-primary-fixed-variant: '#004493'
  secondary-fixed: '#e3e2e7'
  secondary-fixed-dim: '#c6c6cb'
  on-secondary-fixed: '#1a1b1f'
  on-secondary-fixed-variant: '#46464b'
  tertiary-fixed: '#f6d9ff'
  tertiary-fixed-dim: '#e8b3ff'
  on-tertiary-fixed: '#310048'
  on-tertiary-fixed-variant: '#7201a2'
  background: '#fcf8fb'
  on-background: '#1b1b1d'
  surface-variant: '#e4e2e4'
typography:
  display:
    fontFamily: Hanken Grotesk
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Hanken Grotesk
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Hanken Grotesk
    fontSize: 28px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Hanken Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
    letterSpacing: 0em
  body-lg:
    fontFamily: Hanken Grotesk
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
    letterSpacing: 0.01em
  body-md:
    fontFamily: Hanken Grotesk
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
    letterSpacing: 0.01em
  label-md:
    fontFamily: Hanken Grotesk
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1.4'
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Hanken Grotesk
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: 0.08em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 24px
  lg: 40px
  xl: 64px
  gutter: 24px
  margin: 32px
---

## Brand & Style

The design system is a high-fidelity, light-mode interface that bridges the gap between premium consumer hardware aesthetics and cutting-edge AI utility. It draws heavily from **Glassmorphism** and **Minimalism**, prioritizing clarity, depth, and a sense of "digital precision."

The target audience consists of power users, AI researchers, and creative professionals who value an environment that feels both sophisticated and high-tech. The UI should evoke a sense of calm intelligence—providing a spacious, breathable workspace that leverages translucent layers to maintain context and continuity across the application.

## Colors

The palette is centered around a high-energy **Electric Blue** primary color, used sparingly for critical actions and focus states. The foundational surface is a warm, off-white **Apple-inspired Grey**, which acts as the canvas for the glass layers.

- **Primary:** Electric Blue (#007AFF) for primary buttons, active states, and AI-related indicators.
- **Surface:** The base layer is solid #F5F5F7. All floating panels and cards utilize a semi-transparent white (70% opacity) with a 20px backdrop blur.
- **Text:** Primary content uses a deep charcoal (#1D1D1F) for maximum legibility. Secondary content uses a muted grey to establish clear hierarchy.
- **Accents:** Subtle indigo and violet gradients may be used for AI "thinking" states or premium feature highlights.

## Typography

This design system utilizes **Hanken Grotesk** exclusively to maintain a contemporary, geometric feel. The typographic character is defined by **wide tracking** in labels and high-contrast weights in headlines.

- **Scale:** Use tight tracking and heavier weights for large display text to create impact.
- **Labels:** Small labels and captions should always use increased letter-spacing (0.05em to 0.08em) and medium/bold weights to ensure legibility despite the small size.
- **Hierarchy:** Rely on weight shifts (Regular to SemiBold) rather than color shifts where possible to maintain the clean, "Foundry" aesthetic.

## Layout & Spacing

The layout philosophy follows a **fluid grid** with generous internal padding to emphasize the premium, airy nature of the brand.

- **Grid:** A 12-column system for desktop, transitioning to a 4-column system for mobile.
- **Margins:** High-impact pages should utilize large horizontal margins (32px+) to center the focus on content.
- **Rhythm:** Use an 8px base unit. Component internal padding should default to 16px or 24px to ensure elements do not feel crowded.
- **Adaptive:** On mobile, backdrop blurs should be slightly more opaque (85%) to maintain legibility on smaller, more cluttered screens.

## Elevation & Depth

Depth in the design system is achieved through **Glassmorphism** and multi-layered, diffused shadows rather than solid fills.

- **Surface Tiers:**
    - **Layer 0 (Background):** Solid #F5F5F7.
    - **Layer 1 (Cards/Sidebar):** `rgba(255, 255, 255, 0.7)` with 20px+ backdrop-blur and a 1px solid `rgba(255, 255, 255, 0.2)` border.
    - **Layer 2 (Modals/Popovers):** Higher opacity white with a more pronounced shadow.
- **Shadows:** Avoid single-line shadows. Use a combination of a soft, wide ambient shadow and a tighter, slightly more opaque shadow to ground elements. Example: `0 4px 6px -1px rgba(0,0,0,0.05), 0 10px 15px -3px rgba(0,0,0,0.03)`.

## Shapes

The shape language is extremely soft and approachable. We avoid sharp corners entirely to maintain the "foundry" feel of a polished, high-tech object.

- **Primary Radius:** Use **24px** (ROUND_TWENTY_FOUR) for cards, main containers, and large buttons.
- **Secondary Radius:** Use **12px** for smaller nested elements like input fields or chips.
- **Pills:** All action buttons and tags should ideally use a fully rounded "pill" shape if the height allows, reinforcing the friendly, premium aesthetic.

## Components

### Buttons
- **Primary:** Solid #007AFF with white text. Pill-shaped.
- **Secondary:** Glass background with thin border.
- **Interactions:** On hover, buttons should scale to **1.02x**, deepen their shadow slightly, and increase brightness by 5%.

### Input Fields
- Background should be a subtle `rgba(0, 0, 0, 0.03)` with a 24px radius. 
- On focus, the border transitions to Primary Blue with a soft blue outer glow (3px spread).

### Cards
- Use the glass layer specification (70% white, 20px blur).
- Borders should be nearly invisible, providing just enough definition against the background.

### Chips & Tags
- Small, pill-shaped elements with semi-transparent primary or neutral fills. 
- High letter-spacing on text within.

### AI Indicators
- Use a soft, animated gradient (Electric Blue to Violet) for AI processing states. These should always appear as blurred, glowing orbs or subtle underlines to keep with the "light and airy" theme.