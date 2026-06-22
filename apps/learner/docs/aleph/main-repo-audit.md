# Main Repo Audit — What We Missed

> Thorough read of `git@github.com:vonarchimboldi/aleph.git` (main branch). This document captures everything from the actual product that was not reflected in our `aleph_v2` documentation.
>
> **Latest commit reviewed:** `fd16110 Preserve platinum task progress` (2025-06-18). Previous audit was `seeded-user-canonical-workspace-v76`; the repo has since grown from ~776 KB to ~1.07 MB with new API routes, cron jobs, Platinum plan content, and Linear Algebra chapters.

---

## 1. Product Identity

| Our Docs Say | Actual Product |
|--------------|----------------|
| "aleph" everywhere | UI title is **"Learning Studio"** (`<title>Learning Studio</title>`, manifest name). Branding says "Aleph Learning Studio". |
| Only GATE DA | Signup page shows **4 exams**: GATE DA (active), GATE CS (coming soon), ISI MStat (coming soon), IIT JAM Statistics (coming soon) |
| Multi-exam generic | Actual product is **GATE DA first**, with exam-selector UI for future expansion |

**Implication:** The product is "Aleph Learning Studio" — a workspace app. GATE DA is the first exam. The architecture supports more exams but they are not built yet.

---

## 2. Navigation & App Shell (9 Views)

The real app has a **sidebar** with 8 nav items + landing:

```
Brand: "LS" + "Learning Studio" + "Schedules, tests, feedback, resources"

Navigation:
  Dashboard
  Subjects
  Tasks
  Schedule
  Tests
  Feedback
  Resources
  Share (settings)
```

Plus a **topbar** with:
- Build stamp (e.g., `seeded-user-canonical-workspace-v89`)
- "Load current plan" button
- "Reset current data" button
- "Sign out" button
- "Add item" button

**Dashboard view** shows:
- 6 metric cards: plan subjects, plan tasks, plan schedule, plan tests, plan feedback, plan resources
- Current Exam Plan panel
- Plan Resources panel
- Current Plan panel

**We missed:** The full 9-view navigation structure. Our docs only mention Dashboard, Subjects, Schedule, Tests, Feedback. Missing: Tasks, Resources, Share/Settings, Plans (exam selector).

---

## 3. Color Palette (NOT Zinc-Only)

Our `docs/ui.md` says "Zinc-only palette, no accent color." The **actual product** uses:

```css
/* From material-page.css and styles.css */
--bg: #f7f8fc
--paper: #ffffff
--ink: #1f2430
--muted: #5f687a
--line: #dbe1ee
--soft: #edf3ff
--accent: #2457c5      /* Blue */
--accent-2: #16735f    /* Teal/Green */
--warn: #9f681c        /* Amber */
--hard: #8f3248        /* Red */
--code: #f3f5fa
--shadow: 0 8px 24px rgba(31, 36, 48, 0.06)

/* Manifest theme */
background_color: #f6f7f4
theme_color: #1f5f70     /* Dark teal */
```

**The real app has accent colors.** Blue for primary actions, teal for secondary/success, amber for warnings, red for errors. The dark teal `#1f5f70` is the brand color.

**Implication:** We need to update our design system. Zinc-only was a decision we made, but the real product uses a specific palette.

---

## 4. Email System (5 Vercel APIs)

We completely missed this. The main repo has 5 Vercel serverless functions using **Resend**:

| File | Purpose | Trigger |
|------|---------|---------|
| `api/send-credentials.js` | Send login credentials to new learner | Account creation |
| `api/send-feedback.js` | Send feedback notification to learner | Feedback generated |
| `api/send-overdue.js` | Overdue task reminder email | Scheduled (cron?) |
| `api/send-pace-reminder.js` | Platinum pace check email | Weekly / when behind |
| `api/cron/platinum-weekly-check.js` | Weekly report + adaptive plan email | Sundays 14:00 UTC |

**Required env vars:** `RESEND_API_KEY`, `FROM_EMAIL`

**Platinum-specific env vars:** `OPENAI_API_KEY`, `OPENAI_FEEDBACK_MODEL`, `KV_REST_API_URL`, `KV_REST_API_TOKEN`, `CRON_SECRET`, `PLATINUM_MONITOR_EMAIL`

**Fallback:** If Resend not configured, opens prefilled mail draft in user's email client.

**Implication:** Add email service to architecture. Add `email_notifications` table to schema.

---

## 5. PWA & Offline Features

| Feature | Status | Notes |
|---------|--------|-------|
| Service Worker | Exists but **self-unregisters** | Currently disables caching to prevent stale builds |
| Manifest | `manifest.webmanifest` | PWA installable, theme_color #1f5f70 |
| Icons | SVG (192px + 512px) | Maskable icons |
| Offline | Not functional | Service worker explicitly skips fetch caching |
| Fresh Start | `fresh-start.html` | Clears localStorage, sessionStorage, SW, caches |

**Implication:** PWA infrastructure exists but is disabled. Future work could enable offline mode.

---

## 6. Local Storage Architecture

The entire prototype runs client-side with **localStorage**:

```js
const STORAGE_KEY = "learning-studio-data-v2";
const SESSION_KEY = "aleph-session";
const COURSE_PLAN_VERSION = "seeded-user-canonical-workspace-v89";
```

**State shape:**
```js
{
  user: { id, email, name, accountTypeId, role, password, mustChangePassword },
  subjects: [],
  schedule: [],
  tests: [],
  quizAttempts: [],
  patternSubmissions: [],
  feedback: [],
  resources: [],
  tasks: [],
  accountTypes: [],
  enrollments: [],
  lessonPlans: [],
  gateDaSections: [],
  coursePlanVersion: ""
}
```

**Features:**
- JSON **import/export** (`exportData`, `importData`)
- **Reset button** regenerates seeded workspace
- **Build version tracking** — if `coursePlanVersion` mismatches, regenerates from seed
- **Legacy key cleanup** (`learning-studio-data-v1` auto-removed)

**Implication:** Our Supabase migration must support importing this localStorage JSON structure.

---

## 7. Content Block Types

Each section's reading material uses **structured blocks** (from `app.js`):

```js
{
  type: "definition" | "example" | "checkpoint" | "principle" | "warning" | "strategy",
  title: string,
  body: string  // supports KaTeX
}
```

**Section structure in app.js:**
```js
{
  sectionPreview: string,      // What this section is about
  previewActivity: string,     // Try-this-before-reading exercise
  chapterIntro: string[],      // 2-3 paragraphs
  bookSections: [{
    number: "1.1",
    title: string,
    paragraphs: string[],
    blocks: [{ type, title, body }]
  }],
  readingQuestions: [{ question, answerHint }],
  chapterSummary: string[],
  buildStatus: string          // e.g., "Parts 1-8 complete. Objective quiz added. Labelled practice set pending."
}
```

**We missed:** The `buildStatus` field (tracks content completeness), `previewActivity`, structured `blocks` array with semantic types, `readingQuestions`.

---

## 8. Pattern Workspaces vs Material Workspaces

The Platinum plan has **two distinct workspace types**:

**Pattern Workspaces** (`PatternWorkspace`):
- Recurring problem-solving patterns (PSB: Probability, Statistics, Bayes)
- Checklist-based
- Student submissions tracked

**Material Workspaces** (`MaterialWorkspace`):
- Weekly/daily material pages
- Problem sets with answer summaries
- Used for daily submission + feedback flow

**Implication:** Our schema has `tasks` but doesn't distinguish pattern vs material workspaces. Add `workspace_type` enum.

---

## 9. Verification Scripts Details

### `verify-material-pages.mjs`
Checks every `.html` file in `psets/`:
- Required KaTeX CSS/JS snippets present
- Root-relative shared stylesheet (`/psets/material-page.css`)
- Root-relative shared renderer (`/psets/material-page.js`)
- `<main class="wrap">`, `<section class="hero">`, `.math-fallback`
- No inline `<style>` blocks
- Problem count = solution count
- Answer Summary present
- 5-3-2 progression labels correct
- No raw `$...$` math (must use `\( ... \)` or `\[ ... \]`)
- Banned phrases: "clearly", "trivially", "by inspection", "it follows"
- No duplicate problem titles or statements across pages
- All local assets exist

### `verify-review-quizzes.mjs`
Checks `app.js` for graph-backed quiz integrity:
- `conceptGraphForSection` function exists
- Every graph-backed section has `reviewQuiz`
- Every reviewQuiz calls a question generator
- Every graph function has: `chapterId`, `fallbackConcepts`, `fallbackDifficultyMix`, `fallbackInstruction`, `stableNextAction`, `repairMaterial`
- Every question generator has `metadata` with `targetConcept`, `prereqsUsed`, `difficulty`, `gateWeight`
- Every metadata concept exists in the graph nodes
- `metadata-aware scoring`, `target concept scoring`, `prerequisite scoring` exist in app.js

### `judge-material-quality.mjs`
Scores material pages out of 100 across 6 dimensions:
1. Structure and workflow (15 pts)
2. Progression and diagnostic design (20 pts)
3. Solution completeness (25 pts)
4. Mathematical communication (15 pts)
5. Learner accessibility (10 pts)
6. Feedback readiness (15 pts)

Gate: ≥75 per page, ≥80 average.

**Implication:** These are our **quality gates**. Need to port to TypeScript or keep as Node scripts.

---

## 10. Missing from Our Requirements

| Feature | Found In | Priority |
|---------|----------|----------|
| JSON import/export for workspace data | `app.js` | P2 |
| Reset/regenerate workspace button | `app.js` | P2 |
| Build version stamping | `app.js`, `index.html` | P2 |
| Email notifications (5 types incl. Platinum cron) | `api/*.js` | P2 |
| PWA installability | `manifest.webmanifest` | P3 |
| Fresh-start page | `fresh-start.html` | P2 |
| Reading questions per section | `app.js` | P1 |
| Preview activity (try-before-reading) | `app.js` | P1 |
| Content block types (definition/example/checkpoint/etc.) | `app.js` | P1 |
| Build status tracking per section | `app.js` | P2 |
| Pattern workspaces (PSB) | `app.js` | P2 |
| Material workspaces (weekly) | `app.js` | P2 |
| Task board with To do/Completed/Not completed columns | `app.js` | P1 |
| "Done" checkbox before "Completed" status | `app.js` | P2 |
| Quick-add button (contextual based on active view) | `app.js` | P3 |
| Login/signup/password-change/forgot-password forms | `index.html` | P0 |
| Credential hints on login page | `index.html` | P2 |
| Demo login links (`?demo=designer`, `?demo=basic`) | `index.html` | P2 |
| LLM-generated structured feedback | `api/generate-feedback.js` | P1 |
| Platinum progress snapshots + KV storage | `api/platinum-progress.js` | P1 |
| Platinum weekly adaptive planning cron | `api/cron/platinum-weekly-check.js` | P2 |
| Per-topic feedback workflows with prerequisite graphs | `app.js` | P1 |

---

## 11. Prototype Account System

The prototype has **local demo authentication** with hardcoded accounts:

| Username | Password | Role | Purpose |
|----------|----------|------|---------|
| `priyanka` | `l!pschitz` | Platinum | Priyanka's personalized plan |
| `platinum` | `platinum` | Platinum | Platinum demo |
| `designer` | `designer` | Designer | Preview locked content |
| `basic` | `basic` | Basic | Basic plan demo |
| `reviewer` | (no password) | Reviewer | Review-only access |

**Direct login links:** `/?demo=designer`, `/?demo=basic`, `/?demo=reviewer`

**Implication:** Our auth system should support these roles and demo accounts for testing.

---

## 12. Gate-DA Papers

The repo contains **actual GATE DA question papers**:
- 2024, 2025, 2026 question papers (PDF + extracted TXT)
- 2024, 2025, 2026 answer keys (PDF)

**The .txt files are machine-readable** — could be parsed into a question bank.

**Linear Algebra analysis** (`linear-algebra-analysis.md`) provides:
- Topic frequency counts across 2024-2026
- Recommended 13-chapter shape for LA
- Content generation rules

---

## 13. KaTeX Integration

The real product loads KaTeX **from CDN**:
```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css" />
<script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js"></script>
<script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/contrib/auto-render.min.js"></script>
```

Delimiters: `$$` (display), `\[` / `\]` (display), `\(` / `\)` (inline), `$` (inline fallback)

Auto-render runs on `DOMContentLoaded`.

**Implication:** For our Next.js app, we should use `katex` npm package with server-side rendering, not CDN. But the delimiter convention should match.

---

## 14. New in Latest Commit: Platinum Plan Structure

The Platinum plan is now a **personalized 4-subject plan** (not just a tier on top of Basic):

| Subject | Source Material | Rhythm |
|---------|----------------|--------|
| Discrete Mathematics | CMU 21-228, MIT 6.1200J, MIT 18.200 | Weekly milestones + Sunday combined review + biweekly cumulative review |
| Data Structures and Algorithms | Aho/Ullman Foundations of CS, Cartesian | Weekly milestones + Sunday combined review |
| Probability and Statistics | ISI PSB pattern notes | **Daily 10-problem sets** + Sunday PSB pattern test |
| Competition Math | Engel, AoPS, Putnam and Beyond | 1 hour/day, technique journal, weekly written review |

**Plan metadata:**
- Start date: `2026-06-07`
- End date: `2026-09-05`
- 13 weeks
- Version: `seeded-user-canonical-workspace-v89`

**Implication:** Our `plans`/`subjects`/`lesson_plans` schema must support multi-subject personalized lesson plans with per-subject rhythms (daily vs weekly).

---

## 15. New: LLM Feedback Generation (`/api/generate-feedback.js`)

A new serverless endpoint generates structured feedback via OpenAI:

- **Model:** `OPENAI_FEEDBACK_MODEL` env var, default `gpt-4.1-mini`
- **API:** OpenAI `/v1/responses` with strict JSON schema output
- **Input:** `materialTitle`, `materialContext`, `workflow` (rubric), `solutionText`, `learnerName`
- **Output schema includes:**
  - `verdict`: `green` | `yellow` | `red`
  - `score` / `maxScore`: 0-10
  - `studentSummary`, `whatTheyGotRight`, `stillNotUnderstood`, `errorsDespiteKnowing`
  - `firstIssue`: location + explanation
  - `conceptGap`: skill tag + description
  - `correctApproach`, `minimalCorrection`
  - `nextDrill`: skill tag, difficulty (`mechanics`/`application`/`hard`), instruction
  - `masteryUpdates`: skill, delta (`-1`/`0`/`1`), reason
  - `errorAnalysis`: error type, observed error, likely prerequisite, confidence, evidence, repair priority
  - `prerequisiteHypotheses`: prerequisite, hypothesis, confidence, evidence, source skill, `testOnSunday`, repair priority
  - `diagnosticRecommendations`: prerequisite, diagnostic problem type, confirmation criterion, bridge problem type
  - `adaptivePlanSignal`: advance normally flag, repair/bridge/target/cumulative ratios, rationale
  - `studentReport`: headline, right, notYet, execution issues, mastery plan, encouragement

**Implication:** We need a `feedback_workflows` table and a richer `feedback_records` table that can store the full structured report.

---

## 16. New: Platinum Progress Snapshots (`/api/platinum-progress.js`)

The browser syncs a compact progress snapshot to the server whenever local progress changes (debounced 1.5s). Snapshot includes:

- `accountTypeId`: must equal `"gate-da-platinum"`
- `user`: `{ id, email, name, displayName }`
- `currentWeek`
- `pace`: `{ statusLabel, currentWeek, completionRate, expectedCount, completedExpectedCount }`
- `tasks.due[]`: `{ title, type, dueDate, dueState, status }`
- `materials.due[]`: `{ materialId, materialTitle, date, submitted, feedbackReady, feedbackVerdict, feedbackConceptGap, feedbackPrerequisiteHypotheses, feedbackErrorAnalysis, feedbackAdaptivePlanSignal, ... }`
- `patternSubmissions[]`

**Storage:**
- Production: Upstash KV via `KV_REST_API_URL` + `KV_REST_API_TOKEN`
- Development: in-memory fallback (`globalThis.__alephPlatinumProgressStore`)
- Max body size: 250 KB

**Implication:** Add `platinum_progress_snapshots` table (or use KV) and `pattern_submissions` table. Schema should support both.

---

## 17. New: Platinum Weekly Cron (`/api/cron/platinum-weekly-check.js`)

A Vercel cron job runs **every Sunday at 14:00 UTC** (`0 14 * * 0`). It:

1. Loads the latest Platinum progress snapshot
2. Builds a weekly report:
   - Overdue / due-today task counts
   - Missing submissions / missing feedback counts
   - Severe feedback items (red/yellow/revise/weak/incomplete verdicts)
   - Task completion rate
   - Status: `on_pace` or `action_needed`
3. Aggregates prerequisite hypotheses from all feedback-ready materials
4. Ranks hypotheses by confidence, repair priority, and whether Sunday review confirmed them
5. Generates a **Sunday diagnostic plan** (direct check + bridge check per hypothesis)
6. Generates a **next-week problem-set mix**:
   - `repair`: direct prerequisite drills
   - `bridge`: prerequisite → target topic connector problems
   - `target`: nominal syllabus topics
   - `cumulative`: exam-style mixed review
7. Sends a weekly email via Resend if `PLATINUM_MONITOR_EMAIL` is set

**Adaptive allocation rules:**
- No gaps: 5% repair / 15% bridge / 65% target / 15% cumulative
- High-priority/confirmed gaps: 30% repair / 30% bridge / 30% target / 10% cumulative
- Suspected gaps: 20% repair / 30% bridge / 40% target / 10% cumulative

**Implication:** Add `weekly_platinum_reports` and `prerequisite_hypotheses` tables. The cron job itself is infrastructure, but the data model needs to persist reports.

---

## 18. New: Feedback Workflows with Prerequisite Graphs

Each Platinum material page has a **feedback workflow** object in `app.js`. Workflows are not just rubrics — they include:

```js
{
  id: "feedback-workflow-indicators-v1",
  title: "Structured Feedback: Method of Indicators",
  verdicts: [{ id: "green", label: "Green", description: "..." }, ...],
  skills: [{ id: "indicator-definition", label: "Defines clean indicators" }, ...],
  rubric: [{ criterion, points, cue }, ...],
  commonIssues: ["Used one indicator for the whole count...", ...],
  defaultNextDrills: [{ skill, difficulty, instruction }, ...],
  prerequisiteGraph: {
    topic: "Method of Indicators",
    skills: {
      "indicator-definition": { prereqs: [...], diagnostic: "..." },
      ...
    },
    common: { /* algebra-control, calculus-control, ... */ }
  }
}
```

**Implemented workflows:**
- Method of Indicators
- Conditional Expectation and Tower Property
- Order Statistics
- MLE and Estimation
- UMP/NP Tests
- Weekly PSB Review Quiz
- Competition Math Vieta and Polynomials

**Implication:** Store workflows in DB (`feedback_workflows` table) so content authors can create/iterate them without touching app code.

---

## 19. New: Linear Algebra Chapters in GATE DA Basic

The Basic plan now includes **12 Linear Algebra chapters** in addition to Probability:

1. Vector Spaces and Coordinates
2. Linear Transformations and Matrices
3. Rank, Nullity, Range, Kernel, and Systems
4. Orthogonality, Projections, and Idempotent Matrices
5. Determinants, Trace, and Matrix Identities
6. Eigenvalues, Eigenvectors, and Powers
7. Symmetric Matrices and Quadratic Forms
8. Special Matrices and Structural Shortcuts
9. SVD and Singular Values
10. Least Squares and Ridge Regression
11. Covariance Matrices and PCA
12. Data Linear Algebra Synthesis

Each chapter has:
- Reading / labelled practice / objective review sections
- Graph-backed review quizzes with prerequisite repair feedback
- Feedback focus item in the plan

**Implication:** Our `chapters` seed data and plan `subject_access` JSONB should include Linear Algebra chapters 1-12 for Basic and Platinum.

---

## 20. New: Week-01 Platinum Problem Sets

The `psets/week-01/` directory now contains:

| File | Topic | Workflow |
|------|-------|----------|
| `june-01-indicators.html` | Method of Indicators | `feedback-workflow-indicators-v1` |
| `june-02-conditional-expectation-tower.html` | Conditional Expectation & Tower | `feedback-workflow-conditional-expectation-v1` |
| `june-03-order-statistics.html` | Order Statistics | `feedback-workflow-order-statistics-v1` |
| `june-04-mle-estimation.html` | MLE and Estimation | `feedback-workflow-mle-estimation-v1` |
| `june-05-ump-np-tests.html` | UMP/NP Tests | `feedback-workflow-ump-np-v1` |
| `june-07-psb-review-quiz.html` | Weekly PSB Review Quiz | `feedback-workflow-weekly-psb-review-v1` |
| `june-01-competition-math-vietas-polynomials.html` | Vieta & Polynomials | `feedback-workflow-competition-vieta-v1` |

These files are already mirrored in `aleph_v2/content/courses/probability/week-01/`.

---

## Action Items for Revision

1. **Update `docs/ui.md`**: Add actual color palette from the product (teal #1f5f70, blue #2457c5, etc.)
2. **Update `docs/architecture.md`**: Add email system, PWA features, localStorage migration path, 9-view navigation, new API routes (`/api/generate-feedback`, `/api/platinum-progress`, `/api/cron/platinum-weekly-check`)
3. **Update `docs/requirements.md`**: Add missing requirements (JSON export, build stamping, reading questions, preview activities, content blocks, pattern/material workspaces, task board, LLM feedback, Platinum snapshots, weekly cron, feedback workflows)
4. **Update `docs/schema.md`**: Add `feedback_workflows`, `pattern_submissions`, `platinum_progress_snapshots`, `prerequisite_hypotheses`, `weekly_platinum_reports` tables; extend `feedback_records` for structured LLM output
5. **Update `docs/data-flow.md`**: Add JSON import/export flow, email notification flow, LLM feedback flow, Platinum snapshot sync flow, weekly cron flow
6. **Create `docs/aleph/verification-scripts.md`**: Document the 3 verification scripts (already done)
7. **Create `docs/aleph/feedback-workflows.md`**: Document the per-topic workflow methodology
8. **Update `docs/todo.md`**: Reflect audit findings

---

*Audit completed: 2026-06-10 (initial); updated 2026-06-09 for latest commit*
*Source: `vonarchimboldi/aleph` main branch, full file read*
