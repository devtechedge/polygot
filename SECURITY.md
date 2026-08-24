# Security Assessment — PolyGlot Live

**Date:** 2026-08-24  
**Scope:** Auth, XSS, injection, CORS, secrets, speech, third-party APIs  
**Context:** Public deploy is a **portfolio demo** on Vercel. `POST /api/chat` returns canned host replies when `GEMINI_API_KEY` is unset. There are no accounts.

---

## Executive summary

| Area | Risk | Notes |
|------|------|--------|
| Authentication | **N/A (by design)** | No login, no session cookie, no JWT, no NextAuth |
| Authorization | **N/A** | Single-player client. Passport streak / level live in React state |
| XSS | **Low** | No `dangerouslySetInnerHTML`. Transcripts render as React text |
| Injection (SQL) | **N/A** | No database, no Prisma, no ORM |
| Secrets in repo | **Hardened this pass** | `.env*` gitignored. `.env.example` has an empty Gemini placeholder |
| CORS | **N/A** | Same-origin Next app + `/api/chat` |
| Payments | **N/A** | No payments |
| Gemini | **Optional** | Missing key → canned demo replies. Key stays server-side |

**Overall (public Vercel demo):** Low residual risk for a hiring-manager walkthrough. Do not treat the live Gemini path as a production language-school backend.

---

## 1. Authentication & session

**Findings**
- Public site requires no login.
- Streak, passport level, dialect, and transcripts are in-memory React state. They reset on refresh.
- There is no cookie, token, or `localStorage` identity.

**Verdict:** Do not claim NextAuth, JWT, or OAuth. Auth is intentionally absent.

---

## 2. XSS

- Host replies, learner text, IPA, and grammar toasts render as React text nodes → default escaping.
- Host avatars are first-party Unsplash URLs from `lib/scenarios.ts`, not learner input.
- No Markdown / MDX / HTML sanitizer in the graph.

---

## 3. `/api/chat`

| Path | Auth | Notes |
|------|------|--------|
| `POST /api/chat` | None | Parses body through `lib/validation.ts` (40 turns, 500 chars/turn, level allow-list) |
| Missing `GEMINI_API_KEY` | — | Returns canned JSON from `lib/demo-chat.ts` with `demo: true` |
| Live Gemini | — | Server-only key. Model is called with a JSON schema. Prompt is the capped transcript |

Do not put the key in `NEXT_PUBLIC_*` — it would leak to the browser.

A visitor can burn Gemini quota if a key is configured, because the route is unauthenticated. That is **accepted residual risk** for a portfolio demo. Rate-limit or require auth before treating this as production.

---

## 4. Speech APIs

- Microphone access is a browser permission (`webkitSpeechRecognition` / `SpeechRecognition`).
- Text-to-speech uses `window.speechSynthesis`.
- Audio never leaves the device except as the transcript string posted to `/api/chat`.
- Typing mode is the fallback when speech is unavailable (and the path Playwright uses).

---

## 5. Injection / command execution

- No SQL, no child processes, no `eval`, no `new Function`.
- Objective matching is keyword `includes()` on the learner's last utterance (`lib/objectives.ts`).

---

## 6. Secrets & config

- `.gitignore` covers `.env*`, keeps `.env.example`.
- AI Studio leftover copy (`MY_GEMINI_API_KEY`, Cloud Run `APP_URL`, `User-Agent: aistudio-build`) was removed this pass.
- `firebase-tools` and unused form/CVA packages were removed. They were never imported.

---

## 7. Dependency / supply chain

- `npm audit --omit=dev` is not a CI gate. Next 15 advisories that only clear by jumping majors are ignored (Dependabot also ignores majors).
- Weekly Dependabot groups patch + minor only.

---

## 8. Build config

- `typescript.ignoreBuildErrors` is **false**.
- ESLint is not the CI gate (`ignoreDuringBuilds: true` on the 87k client page). `tsc` and Vitest are.

---

## Residual risk (accepted)

1. Unauthenticated Gemini proxy if a key is set on Vercel.
2. Public demo replies are canned — they are not a live tutor.
3. Browser speech APIs are origin-gated; they will not run in every embedded preview.
