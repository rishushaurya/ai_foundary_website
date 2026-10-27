# Remediation Plan: Security, Hackathon Integrity and Live Updates

Date: 2026-10-27. Scope: the whole Next.js 16 app, with the hackathon system (admin setup, judging, voting, leaderboard) as the priority.

Stack: Next.js 16.2 App Router, React 19, Upstash Redis (REST) with a local JSON fallback in `data/`, JWT cookies via `jose`, Google Identity Services for admins.

---

## 1. Audit findings

Severity: **P0** = exploitable now or loses data during a live event. **P1** = wrong results or broken flows. **P2** = hardening or UX.

### 1.1 Security

| # | Sev | Where | Problem | Fix |
|---|-----|-------|---------|-----|
| S1 | P0 | `src/middleware.ts`, every `/api/admin/*` route | Admin access only checks that the JWT signature is valid. Judge and participant tokens are signed with the same secret, so a team that logs in on `/leaderboard` can copy its `participant-session` cookie into `admin-token` and get full admin access. | Check `role === "admin"` in the proxy and in a shared `requireAdmin()` used by every admin route. |
| S2 | P0 | `src/lib/audit-logger.ts` `getAdminEmailFromRequest` | When it can't read an email from the token it **returns the root admin's email**. With S1, a participant token (no email) becomes "root" and can promote itself in `/api/admin/settings`. | Return `null`. Callers use `requireAdmin()`, which fails closed. |
| S3 | P0 | `src/app/page.tsx`, `src/app/events/page.tsx`, `/api/content` | Full event objects, **including every registrant's name, email, phone and college**, are passed to client components and the public JSON API. They show up in the page source for anyone. `/api/content` also exposes `rootAdminEmails`. | Add `getPublicEvents()` that drops registrations. Move registrations out of the public events blob into their own collection. |
| S4 | P0 | `.env.example`, 6 files with `process.env.JWT_SECRET \|\| "..."` | If `JWT_SECRET` is unset, tokens are signed with a hard-coded public string, and anyone can forge an admin token. `design/route.ts` uses a *different* fallback, so it silently breaks too. | One `src/lib/auth.ts` holds the secret. Production refuses to start auth with a missing or known-default secret. |
| S5 | P0 | `validators.ts` `parseTeamsCSV` | The passkey column is found with `h.includes("code")`, which matches `team_code` first. **Every CSV-imported team gets its own public team code as its passkey.** Missing passkeys default to `"AI2026"`. | Passkey column must say pass/secret/pin. Missing passkeys get a random 8-character code from `crypto`. |
| S6 | P1 | `/api/auth/google` | The token audience is checked only when a client ID is configured, and placeholder IDs skip the check. A Google ID token minted for any other app could be replayed here. No rate limit. | Always require `aud` to match the configured client ID and `iss` to be Google. Rate-limit by IP. |
| S7 | P1 | Admin JWT | Removing an admin from the whitelist doesn't revoke their 7-day token. | `requireAdmin()` re-checks the whitelist on every admin API call. |
| S8 | P1 | Judge JWT | A deactivated or deleted judge keeps scoring for up to 8 hours. `assignedRoundIds` is never enforced. | `requireJudge()` loads the judge record: it must exist, be active and be assigned to the round. |
| S9 | P1 | Event delete, hackathon log delete/clear | Any admin can wipe an event or erase the hackathon audit trail. | Root-admin only. |
| S10 | P2 | Passkeys and judge codes | Generated with `Math.random()`. | `crypto.randomInt`, unambiguous alphabet. |
| S11 | P2 | Mutating API calls | Defence in depth against CSRF (SameSite=Lax already blocks most). | Proxy rejects non-GET API requests whose `Origin` host differs from the app host. |
| S12 | P2 | `public/uploads/*.svg` | An uploaded SVG can run script on the site origin when opened directly. | `Content-Security-Policy: sandbox` on `/uploads/*`. |
| S13 | P2 | `x-forwarded-for` | The full header (possibly a list) is used as the IP and rate-limit key. | Use the first hop. |

### 1.2 Data integrity (live-event critical)

Every hackathon "table" is one JSON blob in Redis, written with read-modify-write. Two requests at the same moment both read the old blob and the second write erases the first.

| # | Sev | Path | What gets lost |
|---|-----|------|----------------|
| D1 | P0 | `recordHackathonVote` | Votes cast in the same second; the one-vote-per-team check can also be bypassed by two simultaneous requests. |
| D2 | P0 | `saveHackathonScore` | Judge scores submitted at the same time. "One evaluation per team per round" isn't atomic either. |
| D3 | P0 | `verify-team` rewrites the whole teams blob on every login | A login during round advancement can **revert a team's elimination/finalist status**. Logins also erase each other's sessions. |
| D4 | P1 | `logHackathonActivity`, `logAdminAction` | Concurrent log lines. |
| D5 | P1 | `/api/events/register`, `/api/recruit/submit` | Concurrent registrations or applications. An admin saving an event from a stale page wipes registrations that arrived meanwhile. |

**Fix (one place, all callers route through it):** add collection primitives to `src/lib/local-db.ts`, backed by Redis hashes and lists:

- `listRecords(collection)`: `HGETALL`
- `putRecords(collection, records)`: `HSET` (atomic per record)
- `insertRecordIfAbsent(collection, key, record)`: `HSETNX`, an atomic uniqueness guarantee
  - votes keyed `eventId:voterTeamId`: exactly one vote per team, guaranteed by Redis
  - scores keyed `roundId:teamId`: exactly one evaluation per team per round
  - registrations keyed `eventId:email`: exactly one registration per email
- `deleteRecords(collection, keys)`: `HDEL`
- `pushLog` / `readLog`: `LPUSH` + `LTRIM` (capped, append-only)

Team device sessions move out of the team record into their own collection, so logins never touch team data.

Local dev without Redis keeps the same JSON files. Writes are synchronous inside one Node process, so they're atomic there too.

**Migration:** on first access each collection seeds itself from the legacy blob with `HSETNX` (idempotent, safe if two instances race) and sets a marker key. No manual step, no downtime, and the old blobs are left in place as a backup.

### 1.3 Hackathon logic bugs

| # | Sev | Where | Problem | Fix |
|---|-----|-------|---------|-----|
| H1 | P0 | `admin/hackathon/advance` | Ranks **all** teams, including ones eliminated in earlier rounds. When 0-score teams tie at the cutoff, previously eliminated teams are "advanced" and **un-eliminated**. A double click advances twice. Teams are written one at a time (N blob writes). | Rank only teams competing in the round. Refuse if the round is already completed. One batch write. |
| H2 | P1 | `scores/request-change` | The fallback match `teamId === x \|\| judgeId === y` can unlock a **different team's** score by the same judge. | Match strictly on `scoreId`, or `roundId + teamId`. |
| H3 | P1 | `judge/score` | A judge can score a team that isn't competing in the round (eliminated earlier). | Check with `getCompetingTeamsForRound`. |
| H4 | P1 | `leaderboard/vote` | A revoked device session or a disqualified team can still vote. | Check the session is the team's active one and the voter isn't disqualified. |
| H5 | P1 | `leaderboard/team-status` | Ranks against all teams, while the public board ranks competing teams, so the two can show different ranks and "advanced" flags. | Use the same competing-teams set. |
| H6 | P1 | `admin/hackathon/state` | `currentRoundNumber` from the round switcher is ignored. Actor is logged as `"admin"`. | Apply it; log the real email. |
| H7 | P1 | events/rounds/criteria/teams POST | No validation of enums and numbers (`status: "foo"`, `maxMarks: -5`, `roundNumber: "abc"`). | Validate at the boundary. |
| H8 | P2 | `getHackathonRounds` | Sorts the cached array in place. | Sort a copy. |
| H9 | P2 | `teams/status` PATCH | Response includes the bcrypt hash and passkey. Manual elimination doesn't record a round, so the team vanishes from every round ≥ 2. | Strip secrets; record the event's active round. |
| H10 | P2 | Admin score override | `criterionScores` isn't validated (negative or above-max marks accepted). | Same validation as the judge route. |
| H11 | P0 | `scores/request-change` + `saveHackathonScore` | Found during the fix: saving a score always resets `changeRequested` to false, so **"Request change" was cleared the moment it was saved**. Judges could never revise. | Separate `setScoreRevisionRequest()` that changes only the flag. |
| H12 | P1 | Admin "Reset session" | It cleared `activeSessionId`, but the revocation check skipped teams with no stored session, so **the old device stayed logged in**. | Sessions are their own records; a missing session means revoked. |

### 1.4 Live experience

| # | Problem |
|---|---------|
| L1 | The public leaderboard polls every 15 s. The 5 s server cache plus 3 s CDN cache plus 10 s stale-while-revalidate means a change can take ~30 s to appear. |
| L2 | The team view (scorecard, **voting panel**) never refreshes. When the admin opens voting, eliminated teams don't see the ballot until they reload. |
| L3 | The judge roster never refreshes, so two judges can open the same team and the second gets a 409 only on submit. |
| L4 | The admin dashboard never refreshes. Vote tallies and incoming scores need manual reloads. |
| L5 | Switching rounds while a poll is in flight can show the **previous round's data** (no response ordering). |
| L6 | Missing: the admin can't see computed ranks, ties or the cutoff line before publishing or advancing. The advance modal takes a cutoff number blind. |

**Design: version-stamped smart polling.** Serverless-friendly; no WebSocket server needed.

1. Every hackathon write runs `INCR aifoundry:hackathon:version`, in the data layer, so no route can forget.
2. `GET /api/hackathon/version` returns `{ version }` with `s-maxage=1`. The CDN absorbs thousands of viewers; origin sees about one request per second.
3. Server read caches flush when the version moves, so every instance serves fresh data immediately after a write.
4. Clients use one hook, `useLiveVersion()`. It polls every 2.5 s, pauses on hidden tabs, re-checks on focus and reconnect, and backs off on errors. Pages refetch their data **only when the version changes** (plus a slow safety refresh).
5. Public status URLs carry `?v=<version>`, so the CDN caches each version once and never serves a stale board after a change.
6. Responses are ordered: a slower response for an old selection can't overwrite a newer one.

Result: scores, publish toggles, voting open/close and vote tallies appear on every screen within about 3 s, with no reload, at almost no cost when nothing changes.

New admin feature: **Live Standings**. `GET /api/admin/hackathon/standings` computes the real ranking (ties, cutoff line, who advances) for any round, published or not. It's shown on the Scores tab and inside the Advance dialog, so the admin sees exactly who will advance before confirming.

### 1.5 Platform

| # | Sev | Problem | Fix |
|---|-----|---------|-----|
| P1 | P2 | `middleware.ts` is deprecated in Next 16 (renamed `proxy.ts`). | Rename. |

---


### 1.6 Second pass (full lifecycle audit)

| # | Sev | Problem | Fix |
|---|-----|---------|-----|
| A1 | P1 | Criterion **weights were ignored** in scoring. | Score = sum(marks x weight) / sum(max x weight) x 100 (unchanged when all weights are 1). The judge preview uses the same formula. Weight field added to the admin form. |
| A2 | P1 | Editing or deleting criteria after judges scored silently invalidated recorded scores. | The rubric locks once a round has scores. |
| A3 | P1 | The round status dropdown bypassed the one-live-round rule. | Shared `roundStartBlocker`; a round going live also becomes the judges' active round. |
| A4 | P1 | Duplicate round numbers or two Finals broke advancement and voting. | Both refused. Scored rounds can't be deleted or renumbered. |
| A5 | P1 | **Draft events were public**, and teams could log in before the event started. | Drafts are hidden; team login opens only when the event is Live. |
| A6 | P1 | Votes for or from teams disqualified later still diluted every finalist's vote share. | Only votes from eligible voters for eligible finalists count. |
| A7 | P0 | Voting could be re-opened after the final, changing locked results. | Refused at the state route and at the vote route. |
| A8 | P1 | "Export All Marks" exported only Round 1. | One sheet per round plus a first **Results & Winners** sheet. |
| A9 | P1 | Weak admin-typed passkeys (e.g. 4 digits) at 60 tries per minute could be guessed. | Minimum 6 characters; 10 attempts per minute per team code or judge email. Judge login gives one message for every failure. |
| A10 | P1 | Admin forms pre-filled judge codes and team passkeys with `Math.random`. | Left empty, so the server generates 8-character codes with `crypto`. |
| A11 | P1 | Deleting a team with scores or votes erased history. | Refused; disqualify instead. |
| A12 | P1 | Local mode (no Redis) gave each API route its own stale copy of the data. | One process-wide store. |
| A13 | P2 | After a page reload, the admin dashboard opened the first event, not the running one. | Opens the Live event, else the most recently changed one. |
| A14 | P2 | The ballot said each team's vote "carries 30%". | Correct wording: all audience votes together are 30%. |

`scripts/verify-hackathon-integrity.mjs` now covers the whole lifecycle in **47 checks**, from a draft prepared before the day through winners and downloads. All pass against both the dev server and the production build.

## 2. Execution order

1. **Auth core**: `src/lib/auth.ts` (secret, `requireAdmin`, `requireRootAdmin`, `clientIp`), role checks in the proxy, every admin route through `requireAdmin` (S1, S2, S4, S7, S9, S11, S13).
2. **PII**: `getPublicEvents`; registrations and recruitment in their own collections (S3, D5).
3. **Data layer**: collection primitives, migration, version counter; rewrite `src/lib/hackathon/data.ts` on top of them (D1-D4).
4. **Route fixes**: H1-H10, S5, S6, S8, S10.
5. **Live**: version endpoint, `useLiveVersion` hook, leaderboard/judge/admin wiring, standings endpoint and UI (L1-L6).
6. **Verify**: `tsc`, `next build`, scripted end-to-end checks against the local server (below).

## 3. Verification checklist

Run with `scripts/verify-hackathon-integrity.mjs` against a local dev server in local-JSON mode (instructions at the top of the script). Result on 2026-10-27: **21/21 passed**. `tsc --noEmit` and `next build` pass.

- [x] A participant cookie sent as `admin-token` gets 401. A judge cookie gets 401. A non-whitelisted admin email gets 401.
- [x] A cross-site POST gets 403.
- [x] CSV with a `team_code,...,passkey` header stores the passkey column, not the code.
- [x] Two judges scoring the same team at once: exactly one succeeds.
- [x] A revision request stays open until the judge resubmits, then closes.
- [x] A deactivated judge gets 401 immediately.
- [x] Round 2 with five teams tied at 0 inside the cutoff never un-eliminates round-1 teams. A second advance is rejected (409).
- [x] Live standings preview reports the tie on the cutoff.
- [x] 5 simultaneous votes from one team record 1. Simultaneous votes from 5 teams record 5. A finalist cannot vote. A second device is refused. An admin session reset revokes the device.
- [x] 3 simultaneous duplicate registrations record 1. Registrant email is absent from `/`, `/events` and `/api/content`. An admin saving a stale event copy keeps registrations.
- [x] Every write advances `/api/hackathon/version`.
- [ ] **Not exercised: the Upstash (Redis) code path.** The test server ran without Redis so it couldn't touch production data. The Redis path relies on `HSETNX`/`HSET`/`LPUSH`; run the same script against a *separate* Upstash database before the event.
- [ ] Manual: open `/leaderboard` as an eliminated team, toggle voting in admin, and watch the ballot appear without reloading.

## 4. Deliberately not changed (decide later)

- **Route-level admin checks**: the proxy (Node runtime in Next 16) is the single gate for `/api/admin/*`. It now checks role and the live whitelist; root-only actions also check inside the route. Repeating the admin check in all ~45 handlers is defence in depth worth adding later.

- **Single-device team login** stays as built (the second device is blocked; admin can reset or allow multi-login). Sessions now expire with the token, so a lost phone frees up after 12 h instead of never. Option: "newest login wins", which avoids admin resets but lets someone who learns a passkey kick the real team out.
- **Plaintext passkeys and judge codes** are still stored next to their hashes so admins can re-display them. That's a product feature; removing it means admins can only reset, not view.
- **Uploads on Vercel**: `public/uploads` is read-only on serverless, so uploads only work locally. Moving to Vercel Blob or S3 is a separate task.
- **`xlsx@0.18.5`** has known advisories in its *parser*. This app only *writes* workbooks, so it isn't exposed. Upgrade when convenient.
- **`data/*.json` is committed** and includes test passkeys and audit logs with admin emails and IPs. Untrack the runtime files and keep sanitised seeds.
- **Polling vs WebSockets**: version polling at 2.5 s is the right fit for Vercel plus Upstash REST. Sub-second push would need a dedicated realtime service (Ably, Pusher, or Upstash's SSE subscribe on a long-lived runtime).
