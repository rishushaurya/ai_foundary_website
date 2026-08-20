# Application Flow (APP_FLOW.md)
Version: 1.0.0
Date: 2026-08-18
Project: AI Foundry (RAISE AI CLUB) - Dayananda Sagar University

---

## 1. Visitor Navigation & State Progression

```
[VISITOR ENTERS SITE]
       |
       v
+------------------+
|  HOME / HERO     |<----------------------------------------+
|  - ASCII Canvas  |                                         |
|  - Brand Intro   |                                         |
|  - Featured Evt  |                                         |
+--------+---------+                                         |
         |                                                   |
         +-------------------+-------------------+           |
         |                   |                   |           |
         v                   v                   v           |
+-----------------+ +-----------------+ +-----------------+  |
|   ABOUT PAGE    | |   EVENTS PAGE   | |    TEAM PAGE    |  |
| - Mission & Vision| | - Upcoming list | | - CEO/COO/CTO   |  |
| - Faculty Leads | | - Past archives | | - Tech/Media/etc|  |
| - Innogration   | | - Registration  | | - Faculty Adv.  |  |
+-----------------+ +--------+--------+ +-----------------+  |
                             |                               |
                             v                               |
                    +-----------------+                      |
                    | REGISTRATION    |                      |
                    | [Built-in Modal]|                      |
                    |        OR       |                      |
                    | [Google Form]   |                      |
                    +-----------------+                      |
                             |                               |
         +-------------------+-------------------+           |
         |                   |                   |           |
         v                   v                   v           |
+-----------------+ +-----------------+ +-----------------+  |
|  GALLERY (opt)  | |   BLOG (opt)    | | PROJECTS (opt)  |  |
| - Photo Albums  | | - Articles list | | - AI MVPs & demo|  |
| - Video Players | | - Post detail   | | - Source links  |  |
+-----------------+ +-----------------+ +-----------------+  |
         |                   |                   |           |
         +-------------------+-------------------+           |
                             |                               |
                             v                               |
                    +-----------------+                      |
                    | RECRUIT / JOIN  |                      |
                    | - Application   |                      |
                    | - Team select   |                      |
                    +--------+--------+                      |
                             |                               |
                             +-------------------------------+
```

---

## 2. Admin Authentication & CMS Management Flow

```
[ADMIN ENTERS /admin/login]
             |
             v
+-----------------------------------+
|       GOOGLE OAUTH SIGN-IN        |
| - Prompts for Google account      |
+-----------------+-----------------+
                  |
                  v
+-----------------------------------+
|      AUTHORIZATION VALIDATION     |
| Is email in settings.adminEmails? |
+--------+------------------+-------+
         |                  |
     NO  |                  | YES
         v                  v
+-----------------+ +------------------------------------+
| 403 FORBIDDEN   | | ISSUE JWT SESSION COOKIE           |
| "Access Denied" | | Redirect to /admin                 |
+-----------------+ +-----------------+------------------+
                                      |
                                      v
+--------------------------------------------------------+
|                     ADMIN DASHBOARD                    |
| - Overview Stats (Registrations, Events, Team Count)   |
| - Quick Actions & Navigation Bar                       |
+-----------------------------+--------------------------+
                              |
     +------------------------+------------------------+
     |                        |                        |
     v                        v                        v
+------------------+  +------------------+  +------------------+
| CONTENT MANAGERS |  | EVENT MANAGEMENT |  | SETTINGS & TOGGLE|
| - Hero & About   |  | - Create/Edit Evt|  | - Page Vis. list |
| - Team Hierarchy |  | - Reg. Mode Sel. |  | - Theme Defaults |
| - Media & Gallery|  | - CSV Export     |  | - Admin Whitelist|
+------------------+  +------------------+  +------------------+
```

---

## 3. Component 4-State Machine Specification

Every data-driven component in the application implements a strict 4-state lifecycle:

1. **Loading State**: Displays an animated skeleton shimmer matching exact card proportions. No layout shifting.
2. **Success State**: Renders rich data with smooth entrance fade and interactive hover effects.
3. **Empty State**: Displays a descriptive graphic/icon with explanatory text and an administrative call-to-action (e.g., "No upcoming events scheduled. Check back soon!").
4. **Error State**: Non-destructive alert boundary with an inline retry trigger and local recovery fallback.
