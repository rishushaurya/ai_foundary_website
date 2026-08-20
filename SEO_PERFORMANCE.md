# SEO & Performance Specification (SEO_PERFORMANCE.md)
Version: 1.0.0
Date: 2026-08-18
Project: AI Foundry (RAISE AI CLUB) - Dayananda Sagar University

---

## 1. Core Web Vitals Performance Targets

| Metric | Target | Measurement |
|---|---|---|
| **Largest Contentful Paint (LCP)** | < 2.0 seconds | Hero title & logo render speed on mobile 4G |
| **First Input Delay (FID)** | < 100 milliseconds | Modal & nav drawer responsiveness |
| **Cumulative Layout Shift (CLS)** | < 0.05 | Zero layout jumps during image / skeleton load |
| **First Contentful Paint (FCP)** | < 1.2 seconds | Initial SSR payload delivery |

---

## 2. Meta Tags & Open Graph Specifications

### Root Meta Configuration:
- **Title Template**: `%s | AI Foundry - Dayananda Sagar University`
- **Default Title**: `AI Foundry | RAISE AI CLUB - Dayananda Sagar University`
- **Meta Description**: `Official portal of AI Foundry (RAISE AI CLUB) at Dayananda Sagar University, Bengaluru. Empowering students in AI engineering, startup entrepreneurship, hackathons, and research.`
- **Canonical URL**: `https://aifoundry.club`

### Open Graph & Twitter Cards:
- `og:type`: `website`
- `og:locale`: `en_IN`
- `og:site_name`: `AI Foundry - DSU`
- `og:image`: `https://aifoundry.club/club-logo.png`
- `twitter:card`: `summary_large_image`

---

## 3. Structured Data (JSON-LD)

Each page will render schema metadata:
```json
{
  "@context": "https://schema.org",
  "@type": "EducationalOrganization",
  "name": "AI Foundry - RAISE AI CLUB",
  "parentOrganization": {
    "@type": "CollegeOrUniversity",
    "name": "Dayananda Sagar University",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Bengaluru",
      "addressRegion": "Karnataka",
      "addressCountry": "IN"
    }
  },
  "url": "https://aifoundry.club",
  "logo": "https://aifoundry.club/club-logo.png"
}
```
