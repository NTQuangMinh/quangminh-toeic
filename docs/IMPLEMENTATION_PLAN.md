# QUANG MINH TOEIC — PRODUCTION READINESS IMPLEMENTATION PLAN

## Overview
This implementation plan outlines the prioritized sequence of tasks to transform the Quang Minh TOEIC platform into an enterprise-grade, secure, and production-ready application.

---

## Task Matrix & Priorities

### Priority 0: Safety & Integrity (Security & Persistence)
- [x] **P0-1: Atomic File Persistence** — Prevent corrupted JSON databases using atomic write (`.tmp` + `renameSync`).
- [x] **P0-2: Guest Session Isolation** — Implement `toeic_guest_id` cookies to prevent unauthenticated data pollution.
- [x] **P0-3: Timing-Attack Safe Comparison** — Implement `safeCompare` using fixed-length SHA-256 + `crypto.timingSafeEqual`.
- [x] **P0-4: Server-Side Quiz Anti-Tampering** — Issue HMAC-signed tokens (`questionToken`) to ensure clients cannot falsify answers.
- [ ] **P0-5: Fix Predictable AI Question Generator** — Fix `generateAIQuestion` in `src/lib/ai.ts` where Option A is always the answer.
- [ ] **P0-6: Add Rate Limiting to Question Generator** — Throttle `POST /api/ai/generate-question` to 20 req/min.

### Priority 1: Core Correctness & Business Logic
- [x] **P1-1: Spaced Repetition (SM-2) Integrity** — Ensure both reviewed words and quiz results execute proper SM-2 updates.
- [x] **P1-2: Accurate Streak Calculation** — Remove fake fallbacks; calculate consecutive active days based on Vietnam timezone (`Asia/Ho_Chi_Minh`).
- [ ] **P1-3: Deterministic Verification Suite** — Update `scripts/verify_all.ts` so daily goal tests are date-invariant.

### Priority 2: Learning Experience & Advanced Features
- [x] **P2-1: Audio Speed Controls** — Support `0.75x`, `1.0x`, `1.25x`, `1.5x` with cross-component persistence.
- [x] **P2-2: Exam Countdown & Study Pace Planner** — Provide real-time countdown and daily target word pace calculation.
- [x] **P2-3: Weakness Diagnostics Dashboard** — Categorize mistakes by Topic and Part of Speech with 1-click drill button.

### Priority 3: Automated Regression Testing (8 Critical Journeys)
- [ ] **P3-1: End-to-End User Journey Tests** — Build `scripts/verify_journeys.ts` covering:
  1. Register → Log in → Learn session → Refresh → Verify persistence.
  2. Flashcards → SM-2 grade → Review schedule & difficult words verification.
  3. Quiz completion → Score calculation → History & Mistake review.
  4. Bookmark word → Log out → Log back in → Verify retention.
  5. Student attempt to access `/admin` and admin APIs → Verify 403 Forbidden.
  6. Attempt IDOR across user records → Verify server-side isolation.
  7. Admin creates/updates vocabulary → Verify visible to learners.
  8. AI provider fallback / DB error simulation → Verify graceful degradation.

### Priority 4: Production Documentation & Release
- [ ] **P4-1: Update README.md** — Accurate setup, docker-compose, environment variables, and deployment instructions.
- [ ] **P4-2: Final Implementation Report** — Create `docs/FINAL_IMPLEMENTATION_REPORT.md`.
- [ ] **P4-3: Git Commit & Push** — Commit changes and push to `origin main`.

---

## Verification Criteria
- All tests in `npm test` and `scripts/verify_journeys.ts` exit with code 0 (100% pass).
- `npm run build` generates 25/25 routes without type or lint errors.
