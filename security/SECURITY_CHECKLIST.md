# Security Checklist (SECURITY_CHECKLIST.md)
Version: 1.0.0
Date: 2026-08-18
Project: AI Foundry (RAISE AI CLUB) - Dayananda Sagar University

---

## 1. Authentication & Session Security
- [x] Passwords never stored in database (Google OAuth 2.0 Single Sign-On).
- [x] Whitelisted emails stored in protected configuration.
- [x] Non-whitelisted Google accounts rejected with HTTP 403 Forbidden.
- [x] JWT sessions signed with secret HS256 key.
- [x] Session cookies set to `HttpOnly` (inaccessible to browser scripts).
- [x] Session cookies set to `Secure` (transmitted only over HTTPS).
- [x] Session cookies set to `SameSite=Lax` (guards against CSRF).
- [x] Explicit logout endpoint clears session cookie with maxAge 0.

## 2. API & Backend Security
- [x] Edge Middleware enforces authentication on `/admin/*` and `/api/admin/*`.
- [x] Public endpoints (`/api/events/register`, `/api/recruit/submit`) validate payload schemas.
- [x] Rate limiting prevents brute force / spam on submission endpoints.
- [x] No SQL concatenation (atomic JSON and Redis key writes).
- [x] Sanitization of exported CSV fields to prevent CSV injection formulas (`=`, `+`, `-`, `@`).
- [x] Server-side error handlers log full stack traces internally while returning sanitized messages to clients.

## 3. Frontend & Network Security
- [x] Security headers configured (HSTS, CSP, X-Frame-Options, X-Content-Type-Options).
- [x] Forms persist data in `localStorage` securely without storing credentials.
- [x] No sensitive API keys or private secrets in client-side code bundles.
- [x] `.env.local` added to `.gitignore`.
- [x] `.env.example` committed with safe placeholder values.
- [x] Dependency versions pinned in `package.json` to prevent supply chain tampering.
