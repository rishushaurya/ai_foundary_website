# Data Handling Policy (DATA_HANDLING.md)
Version: 1.0.0
Date: 2026-08-18
Organization: AI Foundry (RAISE AI CLUB) - Dayananda Sagar University

---

## 1. Classification of Stored Data
- **Public**: Event details, team profiles, club mission, project descriptions, blog articles.
- **Internal / Restricted**: Student registration records, phone numbers, email lists, recruitment candidate evaluations, admin whitelists.

---

## 2. Encryption & Transmission Controls
- All browser-to-server traffic is encrypted via TLS 1.3 (HTTPS).
- Administrative session cookies are signed using HS256 JWT keys and transmitted exclusively with `HttpOnly`, `Secure`, and `SameSite=Lax` flags.
- Exported CSV spreadsheets are generated on-the-fly and never persisted in public web directories.
