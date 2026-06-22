# aleph — Living Roadmap

> **Context:** The real product lives at `https://aleph-alpha.io`. This repo is a UI refresh / workspace rebuild. Do not treat it as a greenfield project. Copy, features, and structure must match the actual product.
>
> **Real repo:** `git@github.com:vonarchimboldi/aleph.git` — consider moving this work to a `ui-refresh` branch there.

---

## ✅ Completed (This Sprint)

- [x] Fix metadata: title/description now say "aleph — Exam Prep" (multi-exam, not GATE DA only)
- [x] Fix all `aleph_v2` branding → `aleph` across navbar, auth pages, dashboard, footer, docs layout
- [x] Fix landing page copy: removed rigid "10 problems", removed blunt "70%", added 3-subject parallel pacing and 15-day adaptive cumulative review
- [x] Fix Probability card: now says Chapters 1–10 (not 5–10), 10 chapters / 80+ sections / Built
- [x] Fix Linear Algebra card: now says Chapters 1–4 (not "Coming Soon"), 4 chapters / 32+ sections / Built
- [x] Fix About page: removed fabricated bios (Dr. Arjun Mehta, Dr. Priya Sharma), replaced with honest "Team bios coming soon" placeholder
- [x] Fix all GATE DA-only copy → generic multi-exam language across layout, page, about, workspace-logic, probability-roadmap
- [x] Add exam badges to landing page: GATE DA, ISI, CMI, IIT JAM, NBHM
- [x] Pull content from main repo: UI_HANDOFF.md, QUALITY_RUBRIC.md, MATERIAL_PAGE_STANDARD.md, probability notes, linear algebra analysis + chapter plan, week-01 pset HTML files
- [x] Re-read latest main repo (`fd16110 Preserve platinum task progress`) and integrate new findings
- [x] Document Platinum plan structure, LLM feedback endpoint, progress snapshots, weekly cron
- [x] Add schema tables: `feedback_workflows`, `pattern_submissions`, `platinum_progress_snapshots`, `prerequisite_hypotheses`, `weekly_platinum_reports`
- [x] Extend `feedback_records` for structured LLM output
- [x] Add Platinum/LLM requirements (PF-01..PF-10)
- [x] Create `docs/aleph/feedback-workflows.md` methodology doc

---

## 🔥 Current Sprint — Build the Learning Workspace (Not a Marketing Site)

The product is a **learning workspace**, not a landing page. Priority is what a logged-in student sees.

### 1. Dashboard → Learning Hub
- [ ] Replace generic dashboard with subject-level overview
- [ ] Show 3 subjects studied in parallel (Probability, Linear Algebra, Calculus)
- [ ] Progress bars per chapter, not just generic stats
- [ ] "Continue where you left off" — jump to current section
- [ ] Upcoming 15-day adaptive review quiz indicator

### 2. Subject / Chapter / Section Flow
- [ ] `/learn/[subject]` — subject landing with chapter grid
- [ ] `/learn/[subject]/[chapter]` — chapter page with section list, lock/unlock state
- [ ] `/learn/[subject]/[chapter]/[section]` — section workspace:
  - Reading material (MDX / Fumadocs)
  - Problem set with concept/integration/challenge split
  - Submit answers → instant feedback
  - Section quiz at end
  - Pass → unlock next section; Fail → review quiz generated

### 3. Quiz & Review System
- [ ] Quiz component with concept-tagged questions
- [ ] Graph-backed objective review quizzes (weak concepts resurface)
- [ ] 15-day adaptive cumulative review:
  - Weak concepts repeat more
  - Mastered concepts appear less
  - High-weight topics resurface
- [ ] Feedback UI: weak concepts, prerequisite gaps, repair actions

### 4. Content Migration (Real Product Content)
- [ ] Probability Chapters 1–10 (all built in real product)
- [ ] Linear Algebra Chapters 1–12 (all built in real product; Basic plan)
- [ ] Port actual problem sets with labelled practice + worked solutions
- [ ] Weekly Priyanka Platinum material pages
- [ ] Priyanka Platinum feedback flow:
  - [ ] Per-topic feedback workflows (`feedback_workflows` table)
  - [ ] Student submission upload (`pattern_submissions` table)
  - [ ] LLM feedback generation (`/api/generate-feedback`)
  - [ ] Progress snapshot sync (`/api/platinum-progress`)
  - [ ] Sunday adaptive planning cron (`/api/cron/platinum-weekly-check`)

### 5. Database & Static Data Cleanup
- [ ] Connect real Supabase project (add `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` to Vercel / `.env.local`)
- [ ] Create tables: `profiles`, `subjects`, `chapters`, `sections`, `tasks`, `quizzes`, `questions`, `quiz_attempts`
- [ ] Migrate MVP static content from `src/lib/courses/data.ts` into Supabase
- [ ] Replace static data helpers with Supabase queries
- [ ] Delete `src/lib/courses/data.ts` once content is in the database
- [ ] Add seed script / migration for Probability Chapter 1

### 5. Auth & Data (Deferred Until Workspace Needs It)
- [ ] Connect real Supabase project (`.env.local`)
- [ ] Create `profiles` table + trigger on `auth.users`
- [ ] Create `subjects`, `chapters`, `sections`, `tasks` tables
- [ ] Create `quizzes`, `quiz_attempts`, `review_quizzes` tables
- [ ] Create `enrollments`, `workspace_states`, `concept_mastery` tables
- [ ] Apply RLS policies
- [ ] Seed with real content (Probability 1–10, Linear Algebra 1–4)

---

## 📋 Backlog

### Content
- [ ] Calculus roadmap (chapters 1–10)
- [ ] ISI-level problem bank
- [ ] Quality checker (port `scripts/judge-material-quality.mjs` logic)
- [ ] CMS for instructors to create problems

### Auth & Users
- [ ] Enable Google OAuth (currently disabled with "COMING SOON")
- [ ] Enable GitHub OAuth
- [ ] Password reset flow
- [ ] Email change flow

### Instructor / Admin
- [ ] Content creation UI
- [ ] Quiz builder
- [ ] Student progress analytics
- [ ] Batch enrollment

### Payments
- [ ] Stripe integration
- [ ] Subscription tiers (basic / advanced / premium / platinum)
- [ ] Payment history

### Nice-to-Haves
- [ ] KaTeX math rendering in MDX
- [ ] Dark mode toggle (currently system-only)
- [ ] Mobile app
- [ ] Real-time Q&A (Supabase Realtime)

---

## 🐛 Known Issues

| Issue | Priority | Notes |
|---|---|---|
| No real Supabase project connected | P1 | Need `.env.local` with real credentials |
| Landing page still too marketing-heavy | P2 | Should redirect logged-in users to `/dashboard` |
| No actual learning workspace built | P0 | This is the whole point of the product |
| Docs have only sample content | P2 | Need real methodology + course content |

## ⏸️ Intentionally Deferred

| Item | Reason | Where to find when ready |
|---|---|---|
| OAuth login | Disabled by design for now | Auth pages have "COMING SOON" buttons |
| Database tables | Not connected yet; workspace routes now exist | `docs/supabase-setup.md` has all SQL; next step is real Supabase project + `.env.local` |
| Payment integration | No payment flow in MVP | Deferred until subscription tiers defined |

---

## 📝 Key Decisions

| Decision | Status | Notes |
|---|---|---|
| Accent color | Locked | Adopt product palette: teal #1f5f70, blue #2457c5, amber #9f681c, red #8f3248 |
| Framework | Locked | Next.js 16 + React 19 + Tailwind v4 |
| Content framework | Locked | Fumadocs for docs + course material |
| Auth | Locked | Supabase Auth, email/password only for now |
| Math rendering | Locked | KaTeX (matches real product; use npm package with SSR) |

---

*Last updated: 2026-06-09*
*Next review: After learning workspace routes are sketched; include Platinum feedback loop design*
