# Original Aleph Project — Overview

> **Source:** `/Users/akshat/Documents/Code/Personal/aleph/`  
> **Status:** Archived. Logic and content extracted into `aleph_v2`. UI discarded.

---

## What Was Aleph?

Aleph was a **static HTML/JavaScript GATE DA (Data Analytics) exam preparation app**. It ran entirely in the browser with no backend — all data was hardcoded in a massive `app.js` file (~12,000 lines) and loaded from local JSON files.

**Key characteristics:**
- **Single-page application** with hash-based routing (`#/course/...`, `#/workspace/...`)
- **No build system** — vanilla JS, HTML, CSS
- **No auth** — anyone could open the HTML file and use it
- **All content hardcoded** — problem sets, chapter structures, pedagogical rules embedded in JS
- **Workspace-centric** — the core interaction was a "workspace" where students solved problems, took quizzes, and unlocked sections

---

## Original File Structure

```
aleph/
├── index.html              # Single HTML entry point
├── app.js                  # ~12,000 lines. Everything lives here.
├── styles.css              # Custom CSS (not Tailwind)
├── psets/                  # Problem set data (JSON)
│   ├── probability.json
│   ├── linear_algebra.json
│   └── ...
├── MATERIAL_PAGE_STANDARD.md
├── QUALITY_RUBRIC.md
├── probability_chapters_5_10_notes.md
├── scripts/
│   └── verify_pset_quality.py
└── README.md
```

---

## Core Concepts (Carried Forward)

These concepts were **extracted wholesale** into `aleph_v2` and are documented in detail in the sibling files:

| Concept | Description | Extracted To |
|---|---|---|
| **Problem Set (P-Set)** | 10 problems per section, 5-3-2 difficulty split | `src/lib/pedagogical-rules.ts` |
| **Quiz** | Section-end assessment, must pass to unlock next section | `src/lib/workspace-logic.ts` |
| **Section** | One of 8 standard sections per chapter | `src/lib/pedagogical-rules.ts` |
| **Chapter** | Top-level content unit (e.g., "Probability Ch. 5") | `src/content/probability-roadmap.ts` |
| **Workspace** | Student's active problem-solving interface | `src/lib/workspace-logic.ts` |
| **Concept Graph** | Knowledge dependency tracking | `src/lib/data-models.ts` |
| **Quality Rubric** | 6-dimension scoring for P-Sets and Quizzes | `src/lib/pedagogical-rules.ts` |
| **Material Page Standard** | Content formatting rules for explanations | `src/lib/pedagogical-rules.ts` |

---

## What Was Discarded

| Element | Reason |
|---|---|
| **Custom CSS/styles.css** | We use Tailwind CSS v4 in aleph_v2 |
| **Hash-based routing** | Next.js App Router handles routing natively |
| **Vanilla JS app.js** | Replaced with React 19 + TypeScript |
| **Static HTML** | Replaced with Server Components + MDX |
| **Local JSON data files** | Will be migrated to Supabase Postgres tables |
| **Custom UI components** | Replaced with Fumadocs + our own minimal components |

---

## Why Not Just Continue Aleph?

1. **No backend** meant no user accounts, no progress persistence, no analytics
2. **No auth** meant no personalized learning paths
3. **Vanilla JS at 12k lines** was unmaintainable
4. **Static content** meant no way to update courses without redeploying the whole app
5. **No CMS** meant content changes required developer intervention

**aleph_v2 keeps the pedagogy, discards the implementation.**

---

*See also:*
- [Data Models](data-models.md)
- [Pedagogical Rules](pedagogical-rules.md)
- [Workspace Logic](workspace-logic.md)
- [Content Extraction](content-extraction.md)
