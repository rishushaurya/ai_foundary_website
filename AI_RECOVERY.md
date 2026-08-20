# AI Recovery Guide (AI_RECOVERY.md)
Version: 1.0.0
Date: 2026-08-18
Project: AI Foundry (RAISE AI CLUB) - Dayananda Sagar University

This document specifies standard operational recovery protocols for AI assistants navigating context loss, multi-AI handoffs, or unexpected runtime bugs.

---

## 1. Context Loss Recovery Protocol

If an AI loses context mid-session or across sessions:
1. **Halt Execution Immediately**.
2. **Read Primary Source of Truth Files in Sequence**:
   - `README.md` (Repository anatomy and technology stack)
   - `CHANGELOG.md` (Last 3 session entries, especially "NEXT AI SHOULD:")
   - `build/MANIFEST.md` (Chunk lock statuses: DONE, IN-PROGRESS, READY, BLOCKED)
   - `MENTAL_MODEL.md` (System behavior in plain English)
3. **State Clear Understanding**:
   - "I have restored context. Status: [X/10 chunks complete]. Current target: Chunk [YY]. Reason: [ZZ]."
4. **Resume Execution**: Follow the specific chunk specification in `build/chunk-[YY].md`.

---

## 2. Hallucination Recovery Protocol

If an AI introduces unsupported frameworks (e.g. attempting to install MongoDB, Prisma, or external paid services):
- **Command to Human/AI**: *"Stop. Read IMPLEMENTATION_PLAN.md. We use Next.js 16 + Tailwind 4 + Upstash Redis with local JSON fallback. Revert non-standard libraries."*
- **Action**: Clean `package.json`, remove extraneous files, and verify `npm run build`.

---

## 3. Broken Code Recovery Protocol

If a previous AI left incomplete or failing code:
1. Inspect the failing file and match against `build/chunk-XX.md`.
2. Check for missing imports (Lucide icons, Framer Motion, Jose JWT).
3. Execute `node diagnostics.js` to pinpoint the exact failure.
4. Apply the required fix, verify with `npx tsc --noEmit`, and log the remediation in `CHANGELOG.md`.

---

## 4. Multi-AI Chunk Locking Protocol

- **Never** modify a chunk marked `IN-PROGRESS` by another active agent unless a timeout has elapsed.
- **Always** claim a chunk by setting its status to `IN-PROGRESS` in `build/MANIFEST.md` before generating source files.
- **Always** mark the chunk `DONE` only after passing automated diagnostics and build checks.
