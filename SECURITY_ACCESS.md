# Security & Access Control Specification (SECURITY_ACCESS.md)
Version: 1.0.0
Date: 2026-08-18
Project: AI Foundry (RAISE AI CLUB) - Dayananda Sagar University

---

## 1. Authentication & Authorization Matrix

| Role | Public Pages | Event Registration | Admin Dashboard | Content CRUD | Settings & Whitelist |
|---|---|---|---|---|---|
| **Visitor** (Anonymous) | Read | Submit | Denied (401) | Denied (403) | Denied (403) |
| **Whitelisted Admin** | Read | Submit | Full Access | Full Access | Full Access |
| **Non-Whitelisted User**| Read | Submit | Denied (403) | Denied (403) | Denied (403) |

---

## 2. Google OAuth & JWT Flow

```
1. Admin initiates Google OAuth sign-in at /admin/login.
2. User authenticates via Google Accounts.
3. Server receives OAuth callback and extracts verified email address.
4. Server validates email against `settings.adminEmails` whitelist.
5. If invalid: Reject with HTTP 403 Forbidden ("Email not in approved administrator roster").
6. If valid: Issue HS256-signed JWT stored in HTTP-Only, Secure, SameSite=Lax cookie named `admin-token`.
7. Edge Middleware intercepts subsequent /admin/* requests and verifies JWT signature via Jose library.
```

---

## 3. Input Validation & Parameterized Operations
- **Event Registrations**: Validates full name (min 2 chars), email format (`@`), phone number (10-15 digits), and prevents duplicate registrations for the same event per email address.
- **Data Writes**: All JSON write operations are atomic, preventing partial file writes or corruption.

---

## 4. Rate Limiting Specifications
- `/api/events/register`: Maximum 10 requests per minute per IP.
- `/api/recruit/submit`: Maximum 5 requests per minute per IP.
- `/api/auth/login`: Maximum 10 attempts per minute per IP.
- Violations return HTTP 429 (`Too Many Requests`) with a `Retry-After: 60` header.

---

## 5. Security Headers
All Next.js HTTP responses enforce:
- `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`
