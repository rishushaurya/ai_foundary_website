# Testing Strategy Specification (TESTING_STRATEGY.md)
Version: 1.0.0
Date: 2026-08-18
Project: AI Foundry (RAISE AI CLUB) - Dayananda Sagar University

---

## 1. Quality Assurance Tiers

```
+-------------------------------------------------------------+
|                      E2E & MANUAL TESTS                     |
|  - Event registration flow on mobile / desktop              |
|  - Google OAuth whitelist check & Admin CMS CRUD operations |
|  - CSV export verification                                  |
+-------------------------------------------------------------+
                              |
+-------------------------------------------------------------+
|                    INTEGRATION TESTS                        |
|  - API route handlers (/api/admin/*, /api/events/*)         |
|  - Storage fallback (Upstash Redis <-> Local JSON)          |
|  - Edge Middleware token validation                         |
+-------------------------------------------------------------+
                              |
+-------------------------------------------------------------+
|                  STATIC & AUTOMATED CHECKS                  |
|  - `node diagnostics.js` (Environment & File Integrity)     |
|  - `npm run build` (Next.js compilation & SSR validation)   |
|  - `npx tsc --noEmit` (TypeScript strict type safety)       |
+-------------------------------------------------------------+
```

---

## 2. Mandatory Verification Checklist

Every chunk execution must pass:
1. `node diagnostics.js` -> 0 failures.
2. `npx tsc --noEmit` -> 0 errors.
3. `npm run build` -> Next.js static generation succeeds for all public and admin pages.
4. Admin routes strictly block non-whitelisted callers.
5. All data-driven components render correctly with seed data.
