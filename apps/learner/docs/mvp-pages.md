# aleph — MVP Page Plan

> **Scope:** First usable learning workspace. Single course (GATE DA Probability), no Platinum, no gamification, no admin CMS, no payments. Goal: a learner can sign up, see a course, start it, read content, solve problems, take quizzes, and unlock the next section.
>
> **UI references:** Educative course player (left sidebar curriculum + main content), screenshot `Screenshot 2026-06-18 at 3.29.34 PM.png` (step wizard, greeting header, module builder).

---

## MVP Pages

| # | Route | Page Name | Purpose | Status |
|---|-------|-----------|---------|--------|
| 1 | `/` | Landing | Marketing + CTA + sample problem teaser | Exists (needs simplification) |
| 2 | `/login` | Login | Email/password sign in | Exists |
| 3 | `/signup` | Signup | Create account, pick exam/course | Exists (needs course selection) |
| 4 | `/courses` | My Courses | Catalog of enrolled/available courses | **New** |
| 5 | `/courses/[courseSlug]` | Course Preview | Educative-style preview: title, meta, curriculum accordion, CTA | **New** |
| 6 | `/learn/[courseSlug]` | Course Player | Persistent layout: left sidebar (modules/sections) + main content area | **New** |
| 7 | `/learn/[courseSlug]/[chapterSlug]/[sectionSlug]` | Section Workspace | Reading + problem set + section quiz | **New** |
| 8 | `/settings` | Settings | Profile, password, data export | Exists (needs content) |

**Total MVP pages to build:** 4 new pages + 3 existing to refine = 7 active pages.

---

## User Flow (MVP)

```
Landing (/)
  ↓ CTA
Signup (/signup)
  ↓ account created
My Courses (/courses)
  ↓ clicks GATE DA Probability
Course Preview (/courses/probability)
  ↓ clicks "Start course"
Course Player (/learn/probability)
  ↓ clicks first section
Section Workspace (/learn/probability/ch1/section-preview)
  ↓ reads, solves problems, takes quiz
Quiz Feedback
  ↓ pass → next section unlocked
  ↓ fail → review quiz → pass → next section unlocked
```

---

## Page Details

### 1. Landing (`/`)

**Keep:**
- Hero with exam badges
- Course stat cards (Probability, Linear Algebra)
- Sample problem teaser (interactive)
- CTA to signup

**Remove for MVP:**
- Heavy marketing copy
- Team/about details
- Multiple exam-specific sections

---

### 2. Signup (`/signup`)

**Add to existing form:**
- Target exam selector (default GATE DA)
- Course to start (default Probability)
- After signup → redirect to `/courses`

---

### 3. My Courses (`/courses`)

**Layout:**
- Header: "Hello, [Name] — continue learning"
- Grid of course cards
- Each card: cover image/title, progress bar, chapter count, last active, "Continue" or "Start" button

**For MVP:** only one course card: GATE DA Probability.

---

### 4. Course Preview (`/courses/[courseSlug]`)

**Inspired by Educative + screenshot step wizard.**

**Sections:**
1. **Hero:** course title, tagline, duration, difficulty, "Start course" CTA
2. **What you'll learn:** 4-6 bullet outcomes
3. **Curriculum:** accordion modules/chapters with section counts and durations
4. **Prerequisites:** assumed knowledge
5. **Instructor note:** short intro

**Tabs (like screenshot 1-2-3):**
- Course Details (default)
- Curriculum
- FAQ (placeholder)

---

### 5. Course Player (`/learn/[courseSlug]`)

**Layout:**
- **Top bar:** course title, progress %, user avatar
- **Left sidebar (collapsible on mobile):**
  - Module / chapter list
  - Each chapter expands to show sections
  - Section states: locked 🔒 / current ▶ / completed ✓
  - Clicking a section loads it in main area
- **Main area:** section workspace

**Educative-like behavior:**
- URL updates when section changes
- Sidebar scrolls to active section
- Progress saved automatically

---

### 6. Section Workspace (`/learn/[courseSlug]/[chapterSlug]/[sectionSlug]`)

**Three zones:**

1. **Reading panel (top/left)**
   - Section title
   - Progress bar
   - Semantic blocks: Definition, Example, Checkpoint, Principle, Warning, Strategy
   - KaTeX math
   - Reading questions (2-3 with hints)

2. **Problem set panel (bottom/right)**
   - 5-3-2 progression tabs or sequential list
   - Problem statement + answer input
   - "Check answer" → instant feedback
   - "Show solution" (tracked)
   - Answer summary at bottom

3. **Section quiz (end)**
   - 3-5 questions
   - Submit → pass/fail
   - Pass → unlock next section
   - Fail → review quiz

---

### 7. Settings (`/settings`)

**Tabs:**
- Profile (name, avatar, email)
- Account (password change)
- Data (export/import)
- Progress reset

---

## Shared Components Needed

| Component | Where Used |
|-----------|------------|
| `CourseSidebar` | Course player |
| `SectionNav` | Prev/next section buttons |
| `ReadingPanel` | Section workspace |
| `ProblemSet` | Section workspace |
| `ProblemCard` | Problem set |
| `QuizPlayer` | Section quiz + review quiz |
| `FeedbackModal` | After quiz |
| `ProgressBar` | Course card, course player, section |
| `ConceptChip` | Problems, feedback |
| `KaTeXRenderer` | Any math |

---

## Data Needed (Static First)

For MVP, seed content statically or in a JSON file before connecting Supabase:

- `content/courses/probability/meta.json` — course metadata
- `content/courses/probability/chapters/` — chapter directories
- `content/courses/probability/chapters/01-foundations/index.mdx` — reading content
- `content/courses/probability/chapters/01-foundations/problems.json` — problem set
- `content/courses/probability/chapters/01-foundations/quiz.json` — section quiz

This lets us build the UI without a database, then swap in Supabase later.

---

## Implementation Order

1. **Course player shell** — sidebar + layout (`/learn/[courseSlug]`)
2. **Course preview page** (`/courses/[courseSlug]`)
3. **My Courses page** (`/courses`)
4. **Section workspace** — reading + problems + quiz
5. **Quiz + feedback flow**
6. **Progress persistence** (localStorage first, then Supabase)
7. **Refine landing/signup/settings**

---

## Out of Scope for MVP

- Platinum / personalized plans
- Multi-exam support (only GATE DA in UI)
- Gamification (points, streaks, leaderboard)
- Instructor/admin CMS
- Payments / plans
- Email notifications
- PWA offline
- JSON import/export (keep UI stub)
- Admin course builder

---

*Last updated: 2026-06-09*
*Next step: Build course player shell + static Probability chapter 1 content.*
