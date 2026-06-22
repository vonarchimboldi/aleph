# Content Extraction from Original Aleph

> **Date:** 2026-06-09  
> **Source:** `/Users/akshat/Documents/Code/Personal/aleph/`  
> **Destination:** `main-app/src/`

---

## What Was Extracted

The original aleph project contained three categories of content:

1. **Data Models & Types** — The shape of users, courses, problems, quizzes
2. **Pedagogical Rules** — How content is structured and quality-controlled
3. **Domain Content** — Actual course material (probability roadmap)

All three were extracted and ported to TypeScript for `aleph_v2`.

---

## Extraction Map

| Original File | Destination | What It Contains |
|---|---|---|
| `app.js` (types section) | `src/lib/data-models.ts` | All TypeScript interfaces: User, Enrollment, Subject, Chapter, Section, Task, Quiz, QuizAttempt, ReviewQuiz, ConceptGraph, Problem, WorkspaceState |
| `app.js` (rules section) | `src/lib/pedagogical-rules.ts` | 5-3-2 progression, Quality Rubrics, Material Page Standard, banned phrases, solution rhythm |
| `app.js` (workspace section) | `src/lib/workspace-logic.ts` | Task completion, section unlock algorithm, quiz scoring, progress tracking, state persistence |
| `psets/probability.json` + notes | `src/content/probability-roadmap.ts` | Full GATE DA Probability Chapters 5-10 roadmap with purposes, prerequisites, sections, teaching notes, practice themes |
| `MATERIAL_PAGE_STANDARD.md` | `src/lib/pedagogical-rules.ts` | Content formatting rules for explanations |
| `QUALITY_RUBRIC.md` | `src/lib/pedagogical-rules.ts` | 6-dimension P-Set rubric, 5-dimension Quiz rubric |
| `probability_chapters_5_10_notes.md` | `src/content/probability-roadmap.ts` | Chapter-level teaching notes and practice themes |
| `scripts/verify_pset_quality.py` | *Not extracted* | Will be replaced by a TypeScript/Node-based quality checker integrated into the CMS workflow |

---

## `src/lib/data-models.ts`

**Porting notes:**
- Original used plain JS objects with JSDoc comments
- Ported to strict TypeScript with explicit types
- Added `created_at` / `updated_at` fields for Supabase compatibility
- Renamed some fields for consistency (e.g., `pset` → `tasks`)
- Added `WorkspaceState` as a new aggregate type

**Key types:**
- `AccountType` — 4-tier subscription model
- `UserRole` — student / instructor / admin
- `TaskStatus` — todo / completed / not-completed
- `ProblemLabel` — concept / mechanic / integration / application / challenge / hidden / isi

---

## `src/lib/pedagogical-rules.ts`

**Porting notes:**
- Original was scattered across `app.js` and markdown files
- Consolidated into a single TypeScript module with exported constants
- Added `CHAPTER_SECTION_ORDER` as a typed array
- `BANNED_PHRASES` is now a `Set<string>` for O(1) lookups

**Key exports:**
- `PROBLEM_SET_PROGRESSION` — 5-3-2 split definition
- `QUALITY_RUBRIC_PSET` — 6 dimensions, 100 points
- `QUALITY_RUBRIC_QUIZ` — 5 dimensions, 100 points
- `CHAPTER_SECTION_ORDER` — 8 standard sections
- `EXPLANATION_RULES` — Material Page Standard + banned phrases

---

## `src/lib/workspace-logic.ts`

**Porting notes:**
- Original was procedural JS functions in `app.js`
- Refactored into pure TypeScript functions
- Added explicit return types
- Separated UI feedback rules from business logic
- Added edge case handling (network failure, multi-device)

**Key functions:**
- `canUnlockSection(section, state)` — Boolean, pure function
- `gradeQuiz(attempt)` — Returns pass/fail
- `generateReviewQuiz(failedAttempt)` — Returns ReviewQuiz object
- `calculateEnrollmentProgress(enrollment)` — Returns 0-100
- `calculateChapterProgress(chapter, userId)` — Returns 0-100
- `calculateSectionProgress(section, userId)` — Returns 0-100

---

## `src/content/probability-roadmap.ts`

**Porting notes:**
- Original was a mix of JSON files and markdown notes
- Consolidated into a single TypeScript file with typed `ChapterRoadmap` objects
- Added `prerequisites` as explicit chapter number references
- Teaching notes preserved verbatim
- Practice themes preserved as string arrays

**Structure:**
```typescript
interface ChapterRoadmap {
  number: number;
  title: string;
  purpose: string;
  prerequisites: number[];
  coreSections: {
    title: string;
    type: SectionType;
    keyTopics: string[];
  }[];
  teachingNotes: string;
  practiceThemes: string[];
}
```

**Coverage:** Chapters 5–10 of GATE DA Probability:
1. Combinatorics & Counting
2. Probability Axioms & Basic Rules
3. Conditional Probability & Independence
4. Random Variables — Discrete
5. Random Variables — Continuous
6. Expectation, Variance, and Inequalities

---

## What Was NOT Extracted

| Element | Reason |
|---|---|
| **UI code from `app.js`** | Will be rebuilt with React + Fumadocs |
| **CSS from `styles.css`** | Will be rebuilt with Tailwind CSS |
| **Hash router logic** | Next.js App Router replaces this |
| **localStorage persistence** | Supabase replaces this |
| **HTML templates** | JSX/MDX replaces this |
| **`scripts/verify_pset_quality.py`** | Will be rewritten in TypeScript for the CMS |
| **P-Set JSON problem data** | Will be migrated to Supabase after CMS is built |

---

## Next Steps

1. **Migrate P-Set data** — Import JSON problem sets into Supabase `tasks` table
2. **Build CMS** — Instructor interface for creating/editing problems
3. **Quality checker** — Port Python script to TypeScript, integrate into CMS save flow
4. **Expand roadmaps** — Create similar roadmaps for Linear Algebra, Calculus, etc.
5. **Concept graphs** — Build visual dependency maps from the roadmap data

---

*See also:*
- [README](README.md) — Overview of the original aleph project
- [Data Models](data-models.md) — Detailed type definitions
- [Pedagogical Rules](pedagogical-rules.md) — Instructional design system
- [Workspace Logic](workspace-logic.md) — Student interaction rules
