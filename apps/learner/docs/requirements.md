# aleph — Requirements Document

> **Inspiration note:** Studied [brilliant.org](https://brilliant.org) and [brilliant.org/courses/coordinate-plane](https://brilliant.org/courses/coordinate-plane/) for visual patterns. Key borrowable ideas: visual path/track for course progression, level-review checkpoints, stats badges (lessons × exercises), topic chips, interactive previews, streak visualization, and clear learning-objective summaries per course.

---

## Requirement Categories

| # | Category | Count |
|---|----------|-------|
| 1 | Landing & Marketing | 6 |
| 2 | Learning Workspace | 12 |
| 3 | Content Delivery | 10 |
| 4 | Assessment & Feedback | 7 |
| 5 | Dashboard & Analytics | 5 |
| 6 | Auth, Accounts & Plans | 6 |
| 7 | Gamification | 8 |
| 8 | Instructor & Admin | 3 |
| 9 | Platform & Infrastructure | 5 |
| 10 | Platinum & LLM Feedback | 10 |
| | **Total** | **72** |

---

## Priority Legend

| Priority | Meaning |
|----------|---------|
| **P0** | Blocks launch. Must exist before any user can learn. |
| **P1** | Core product value. Needed for meaningful learning experience. |
| **P2** | Important differentiator. Expected by competitive standards. |
| **P3** | Nice-to-have. Can ship without, improves retention/engagement. |

---

## 1. Landing & Marketing (6)

| ID | Requirement | Priority | Notes |
|----|-------------|----------|-------|
| LM-01 | **Visual course path preview** — Landing page shows a stylized "subway map" or winding path showing chapter progression (like Brilliant's lesson path). Not interactive, just visual. | P2 | SVG diagram. Shows 3 subjects as parallel tracks with chapter nodes. |
| LM-02 | **Interactive problem teaser** — One sample problem (from Probability Ch. 1) that a visitor can solve without logging in. Shows the actual problem-solving UI. | P2 | Converts visitors. Drops them into signup on submit. |
| LM-03 | **Exam selector on landing** — Dropdown or chip selector for GATE DA / ISI / CMI / IIT JAM / NBHM. Filters visible courses and content. | P1 | Makes multi-exam positioning concrete. |
| LM-04 | **Course stat badges** — Each course card shows "N chapters · M sections · K problems · X worked solutions" (like Brilliant's "30 Lessons · 322 Exercises"). | P1 | Borrowed from Brilliant. Sets clear expectations. |
| LM-05 | **Testimonial / social proof section** — Real quotes from beta users (once available). Not fake bios. | P3 | Can be "Coming soon" placeholder until real quotes exist. |
| LM-06 | **"One-week free trial" CTA** — Landing page offers a free trial for GATE DA Basic. Clear signup flow with plan selection (Basic / Advanced / Premium / Platinum). | P1 | From actual product signup page. |

---

## 2. Learning Workspace (7)

| ID | Requirement | Priority | Notes |
|----|-------------|----------|-------|
| LW-01 | **Subject-level dashboard** — Logged-in user sees 3 subject cards (Probability, Linear Algebra, Calculus) with progress bars, current chapter, next action. | P0 | First screen after login. Must help user act immediately. |
| LW-02 | **Chapter path visualization** — Within a subject, chapters are shown as a visual path with nodes (like Brilliant's lesson path). Completed = filled, current = highlighted, locked = dimmed + lock icon. | P1 | Visual progress is motivating. Shows the journey. |
| LW-03 | **"Continue where you left off" button** — Prominent CTA on dashboard jumping to the exact section/problem the user was last working on. | P0 | Reduces friction. Single-click resume. |
| LW-04 | **Section workspace layout** — Reading material on left (or top), problem set on right (or bottom). Clear separation. No scrolling between theory and problems. | P0 | Core learning surface. Must be dense but readable. |
| LW-05 | **Lock/unlock visual states** — Locked sections show lock icon, dimmed text, and a tooltip explaining what quiz score is needed to unlock. Unlocked sections show "Start" or "Continue" button. | P1 | Borrowed from game/learning UX. Makes gating transparent. |
| LW-06 | **Section completion badges** — Small checkmark or star on completed sections. Optional: streak indicator for consecutive days of work. | P2 | Gamification light. Visual reward for completion. |
| LW-07 | **Keyboard navigation** — Arrow keys to navigate between problems in a set. Enter to submit. Escape to close feedback modal. | P2 | Power-user feature. Expected for problem-heavy workflows. |
| LW-08 | **9-view navigation sidebar** — Dashboard, Subjects, Tasks, Schedule, Tests, Feedback, Resources, Share/Settings. Consistent across all app pages. | P0 | From actual product. Core app shell. |
| LW-09 | **Task board with columns** — Weekly task board with To do / Completed / Not completed columns. Completion rule: must check "Done" before marking "Completed". | P1 | From actual product. Weekly workflow view. |
| LW-10 | **Reading questions** — Each section has 2-3 reading questions with answer hints to check comprehension before problem sets. | P1 | From actual product content structure. |
| LW-11 | **Preview activity** — "Try this before reading" exercise at the start of each section. Activates prior knowledge. | P1 | From actual product. Pedagogical best practice. |
| LW-12 | **Content block types** — Reading material uses semantic blocks: Definition, Example, Checkpoint, Principle, Warning, Strategy. Not just plain paragraphs. | P1 | From actual product. Makes scanning easier. |

---

## 3. Content Delivery (7)

| ID | Requirement | Priority | Notes |
|----|-------------|----------|-------|
| CD-01 | **KaTeX math rendering** — All mathematical expressions rendered with KaTeX. Inline math uses `\( ... \)`, display uses `\[ ... \]`. No raw `$...$` fallback issues. | P0 | Without this, the product is unusable for math. |
| CD-02 | **Material page standard** — Every content page follows the standard: hero (title + objective + meta chips), core pattern panel, labelled sections, 5-3-2 problem progression, answer summary. See `docs/aleph/MATERIAL_PAGE_STANDARD.md`. | P0 | Content consistency across all chapters. |
| CD-03 | **Worked solution reveals** — Each problem has a collapsible `<details>` solution. Initially hidden. Student must attempt before viewing. Track whether student viewed solution before attempting. | P1 | Prevents passive reading. Forces active solving. |
| CD-04 | **Concept tags on problems** — Every problem shows 1-3 concept chips (e.g., "joint-pmf", "marginal-distribution", "independence-check"). Clickable to view related problems. | P1 | Enables the diagnostic feedback loop. |
| CD-05 | **Reading progress indicator** — Thin progress bar at top of reading material showing how much of the section has been read (scroll-based). | P2 | Borrowed from Medium/Brilliant. Gives sense of accomplishment. |
| CD-06 | **Mobile-safe math layout** — Long display equations must not cause horizontal body overflow. Scrollable `.formula` containers or line breaks. | P1 | Many students study on phones. |
| CD-07 | **Diagram support** — SVG diagrams embedded in content (e.g., support regions for joint PDFs, transformation visualizations for Linear Algebra). Not just KaTeX. | P2 | Physical intuition is critical, especially for LA. |
| CD-08 | **Content block types in reading material** — Semantic block types: Definition, Example, Checkpoint, Principle, Warning, Strategy. Each with distinct visual treatment. | P1 | From actual product. Makes content scannable. |
| CD-09 | **Build status tracking** — Each section shows build status (e.g., "Parts 1-8 complete. Objective quiz added. Labelled practice pending."). Visible to designers, hidden to students. | P2 | Content team needs this for tracking. |
| CD-10 | **Pattern workspaces vs material workspaces** — Pattern workspaces (recurring PSB patterns with checklists) and material workspaces (weekly problem sets with answer summaries) are distinct content types. | P2 | From Platinum plan. Different UI for each. |

---

## 4. Assessment & Feedback (7)

| ID | Requirement | Priority | Notes |
|----|-------------|----------|-------|
| AF-01 | **Section quiz component** — At end of each section: 3-5 concept-tagged questions. MCQ, MSQ, and NAT formats. Timer optional. Immediate feedback per question. | P0 | Gate to next section. Core product loop. |
| AF-02 | **Quiz pass threshold** — System-defined threshold per section (not rigid 70%). Based on concept coverage: must demonstrate understanding of all core concepts, not just overall score. | P1 | More nuanced than "pass/fail on percentage." |
| AF-03 | **Review quiz on failure** — If section quiz not passed, generate a targeted review quiz from missed concepts + prerequisites. Student cannot skip. Must pass to proceed. | P0 | The "forced review" mechanism. Non-negotiable. |
| AF-04 | **Graph-backed review quizzes** — Review quizzes use the chapter's concept graph to select questions. Weak concepts get more questions. Mastered concepts get fewer. | P1 | Adaptivity. Different from section quizzes. |
| AF-05 | **15-day adaptive cumulative review** — Every 15 days, a comprehensive review quiz across all subjects. Surfaces weak concepts, skips mastered ones, resurfaces high-weight exam topics. Difficulty adapts to performance. | P1 | Key differentiator. The "cumulative" part. |
| AF-06 | **Feedback modal** — After quiz submission: modal showing per-question breakdown. Green = correct, red = wrong, yellow = partial. Each wrong answer links to concept + prerequisite + repair action. | P0 | The "know what to fix" promise. |
| AF-07 | **Repair action specificity** — Feedback does not say "you got this wrong." It says: "You treated every idempotent matrix as identity. Repair: projection eigenvalues are 0 or 1." See `docs/aleph/linear-algebra-chapter-1-plan.md`. | P1 | This is the pedagogical value. Generic feedback is useless. |

---

## 5. Dashboard & Analytics (5)

| ID | Requirement | Priority | Notes |
|----|-------------|----------|-------|
| DA-01 | **Concept mastery map** — Radar chart or heatmap showing strength across all concept nodes. Click a node to see related problems and quiz history. | P1 | Visual self-awareness. The existing FeedbackLoop SVG is a proto-version. |
| DA-02 | **Weekly progress summary** — Stacked bar or line chart showing problems solved, quizzes taken, concepts mastered per day for the last 7 days. | P2 | Motivation + accountability. |
| DA-03 | **Upcoming review indicator** — Dashboard shows countdown to next 15-day cumulative review. Color changes as deadline approaches (green → yellow → red). | P2 | Prevents surprises. Encourages prep. |
| DA-04 | **Weak concepts list** — Ordered list of weakest concepts with direct links to repair material and practice problems. Updated after every quiz. | P1 | Actionable dashboard. Not just pretty charts. |
| DA-05 | **Study streak counter** — Consecutive days with activity. Not gamified with animations, just a number + calendar grid (like GitHub contributions). | P3 | Borrowed from Brilliant/Duolingo. Light engagement. |

---

## 6. Auth, Accounts & Plans (6)

| ID | Requirement | Priority | Notes |
|----|-------------|----------|-------|
| AU-01 | **Plan-based content gating** — `plans` table defines which chapters/subjects each plan unlocks. Free plan has daily point limits. Basic unlocks full subjects. Platinum adds weekly material + personalized feedback. New plans can be added without code changes. | P1 | Flexible plan system. Not hardcoded tiers. |
| AU-02 | **Designer preview mode** — Special role (designer/designer login) that can preview locked content without triggering unlock logic. Does not affect learner progress. | P1 | From UI_HANDOFF. Critical for content creators. |
| AU-03 | **Plan stored in `profiles`** — `plan_id` references `plans` table. Enforced in middleware + RLS. Plans have `features` JSONB array for feature flags. | P1 | Flexible. Add new plans via admin UI or SQL seed. |
| AU-04 | **Password reset flow** — Forgot password → email with reset link → new password form. | P2 | Standard auth hygiene. |
| AU-05 | **Demo account shortcuts** — Direct login links (`?demo=designer`, `?demo=basic`, `?demo=reviewer`) for quick access during development and demos. | P2 | From actual product login page. |
| AU-06 | **JSON import/export** — Users can export their full workspace data as JSON and import it elsewhere. Migration path from prototype localStorage to Supabase. | P2 | Actual product has this. Critical for data portability. |

---

## 7. Gamification (8)

| ID | Requirement | Priority | Notes |
|----|-------------|----------|-------|
| GM-01 | **Points system** — Every action earns points: +10 first-try correct problem, +5 retry correct, +50 quiz pass, +20 section complete, +100 chapter complete, +5 daily login. | P2 | Core engagement loop. |
| GM-02 | **Streak bonuses** — +25 for 3-day streak, +100 for 7-day, +500 for 30-day. Streak breaks reset to 0. | P2 | Incentivizes daily habit. |
| GM-03 | **Leaderboard** — Daily, monthly, and all-time rankings by points. No weekly (too complex). Top 3 and top 10 get bonus points. | P2 | Social motivation without toxicity. |
| GM-04 | **Daily activity tracking** — Per-day log: problems solved, quizzes taken, minutes studied, sections completed, points earned. Used for streaks and daily goals. | P2 | Data foundation for gamification. |
| GM-05 | **Rewards catalog** — Configurable rewards: badges (digital), goodies (physical merch), feature unlocks, discount codes, certificates. Each has `points_required`. | P2 | Aspirational goals. |
| GM-06 | **Point spending** — Users spend points to claim rewards. Ledger tracks every transaction (earn and spend). | P2 | Points have value. |
| GM-07 | **Daily point limits for Free plan** — Free users cap at 100 pts/day. Basic/Platinum unlimited. Visible in UI as "X / 100 points today". | P2 | Upgrade incentive. |
| GM-08 | **Reward fulfillment tracking** — Physical goodies go through statuses: claimed → fulfilled → shipped. Digital rewards (badges, unlocks) instant. | P3 | Only needed if shipping physical items. |

---

## 8. Instructor & Admin (3)

| ID | Requirement | Priority | Notes |
|----|-------------|----------|-------|
| IA-01 | **Content creation UI** — Form to create a new section: title, reading material (MDX editor), problem set builder, concept tag selector, quiz builder. | P2 | Needed for scaling content. |
| IA-02 | **Quiz builder** — Drag-and-drop or form-based quiz creation. Each question has: prompt, options, correct answer, concept tags, prerequisite tags, difficulty, repair feedback text. | P2 | Enables non-devs to build quizzes. |
| IA-03 | **Student progress table** — For instructors: table of students with columns for last active, current chapter, quiz pass rate, weakest concepts. Filterable. | P2 | Platinum plan feature. |

---

## 8. Platform & Infrastructure (5)

| ID | Requirement | Priority | Notes |
|----|-------------|----------|-------|
| PI-01 | **Edge-safe architecture** — All Edge Runtime routes use relative imports. Middleware at `src/middleware.ts`. No Node.js-only APIs in shared code. Defensive fallbacks when Supabase env vars missing. | P0 | Already implemented. Must not regress. |
| PI-02 | **Static generation for content pages** — Course material pages (MDX) are statically generated at build time. Quiz/problem data fetched client-side or via API routes. | P1 | Performance + SEO for content. |
| PI-03 | **Email notification system** — 4 email types via Resend API: credential send, feedback ready, overdue reminder, pace check. Fallback to mailto: if Resend not configured. | P2 | From actual product API routes. |
| PI-04 | **PWA infrastructure** — Web manifest, icons (192 + 512 SVG), service worker scaffold. Offline mode can be enabled later. | P3 | Actual product has manifest + SW (currently disabled). |
| PI-05 | **Build version stamping** — App shows build version (e.g., "v76"). Cache-busting for JS/CSS. Fresh-start page clears all state. | P2 | From actual product. Prevents stale builds. |

---

## 10. Platinum & LLM Feedback (10)

| ID | Requirement | Priority | Notes |
|----|-------------|----------|-------|
| PF-01 | **Structured LLM feedback** — For every Platinum submission, call `/api/generate-feedback` with material context, rubric workflow, and solution text. Return strict JSON schema: verdict, score, error analysis, prerequisite hypotheses, diagnostic recommendations, adaptive plan signal, student report. | P1 | Core Platinum value. Replaces generic "correct/incorrect" feedback. |
| PF-02 | **Feedback workflow editor** — Content authors can create per-topic feedback workflows: verdicts, skills, rubric, common issues, default next drills, prerequisite graph. Stored in `feedback_workflows` table, versioned. | P2 | Enables non-dev authors to iterate feedback rubrics. |
| PF-03 | **Prerequisite graphs per workflow** — Each workflow defines a skill graph with prerequisites and short diagnostic prompts. LLM uses graph labels instead of inventing prerequisites. | P1 | Prevents hallucinated prerequisite labels. |
| PF-04 | **Platinum submission upload** — Students upload/write solutions for daily/weekly problem sets. Each submission links to a `feedback_workflow` and a material page. | P1 | The input to the LLM feedback loop. |
| PF-05 | **Progress snapshot sync** — Browser syncs compact Platinum progress snapshot (due tasks, due materials, feedback state) to server on every change, debounced. Stored in `platinum_progress_snapshots` table or KV. | P2 | Enables the weekly cron to operate server-side. |
| PF-06 | **Weekly adaptive planning cron** — Sunday 14:00 UTC cron reads snapshot, builds weekly report, ranks prerequisite hypotheses, generates Sunday diagnostic plan, and produces next-week pset mix. | P2 | The "adaptive" part of Platinum. |
| PF-07 | **Prerequisite hypothesis tracking** — Aggregate hypotheses from all feedback. Rank by confidence, repair priority, and Sunday confirmation. Persist in `prerequisite_hypotheses`. | P2 | Data foundation for adaptive planning. |
| PF-08 | **Sunday diagnostic quizzes** — Generate short quizzes with one direct-check and one bridge-check per confirmed/high-priority hypothesis. Confirm or clear hypotheses. | P2 | Closes the adaptive loop. |
| PF-09 | **Next-week pset mix** — Generate problem sets with repair/bridge/target/cumulative allocation based on hypothesis state. Default 65% target; confirmed gaps shift to 30% repair + 30% bridge + 30% target. | P2 | Concrete adaptive output. |
| PF-10 | **Multi-subject personalized lesson plans** — Platinum plans can span multiple subjects (Discrete Math, DSA, Probability/Stats, Competition Math) with per-subject rhythms: daily psets, weekly milestones, Sunday reviews, technique journals. | P1 | The product now has a 4-subject Platinum plan. |

---

## Summary by Priority

| Priority | Count | Key Items |
|----------|-------|-----------|
| **P0** | 11 | Subject dashboard, 9-view nav, section workspace, section quiz, review quiz on failure, feedback modal, KaTeX, material standard, continue-CTA, edge-safe architecture, static generation |
| **P1** | 29 | Chapter path, lock/unlock, exam selector, stat badges, task board, reading questions, preview activity, content blocks, plan gating, designer mode, concept tags, repair specificity, concept mastery map, weak concepts list, adaptive review, graph-backed quizzes, mobile math, quiz pass threshold, plans system, password reset, content creation, build status, pattern/material workspaces, demo shortcuts, structured LLM feedback, prerequisite graphs, Platinum submission upload, multi-subject lesson plans |
| **P2** | 29 | Visual path preview, interactive teaser, keyboard nav, completion badges, reading progress, diagrams, weekly progress, upcoming review, streak counter, quiz builder, student table, JSON export, email system, build version, PWA, fresh-start page, points system, streak bonuses, leaderboard, daily activity, rewards catalog, point spending, daily point limits, feedback workflow editor, progress snapshot sync, weekly adaptive cron, hypothesis tracking, Sunday diagnostics, next-week pset mix |
| **P3** | 3 | Testimonials, PWA offline, reward fulfillment |

---

## Next Steps (Suggested Order)

1. **Sprint 1: P0 Core Learning Loop** — Section workspace (reading + problems + quiz) + feedback modal + KaTeX
2. **Sprint 2: P0 Navigation & Resume** — Subject dashboard + "Continue where you left off" + chapter path visualization
3. **Sprint 3: P1 Assessment Depth** — Review quiz on failure + graph-backed quizzes + 15-day cumulative review
4. **Sprint 4: P1 Content & Gating** — Plan-based content gating + designer preview + concept tags
5. **Sprint 5: P1 Dashboard** — Concept mastery map + weak concepts list + weekly progress
6. **Sprint 6: P2 Gamification** — Points system + streaks + leaderboard + daily activity + rewards
7. **Sprint 7: P2 Polish** — Visual path preview + interactive teaser + reading progress + completion badges
8. **Sprint 8: P1/P2 Platinum Feedback Loop** — Structured LLM feedback + feedback workflows + submission upload + progress snapshot sync
9. **Sprint 9: P2 Platinum Adaptivity** — Weekly adaptive cron + prerequisite hypothesis tracking + Sunday diagnostics + next-week pset mix

---

*Last updated: 2026-06-09*
*Source: Real product at aleph-alpha.io, UI_HANDOFF.md, brilliant.org visual study, latest main-repo audit*
*Source: Real product at aleph-alpha.io, UI_HANDOFF.md, brilliant.org visual study*
