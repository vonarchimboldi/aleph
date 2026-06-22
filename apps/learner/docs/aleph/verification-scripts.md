# Verification Scripts

> **Purpose:** Document the 3 verification scripts from the main repo (`vonarchimboldi/aleph`). These are quality gates that must pass before any content is committed or deployed.

---

## 1. `verify-material-pages.mjs`

**What it does:** Checks every `.html` file in `psets/` for structural correctness.

**Run:**
```bash
node scripts/verify-material-pages.mjs
```

**Checks:**

| Check | Fail If |
|-------|---------|
| KaTeX CSS | Missing `katex.min.css` link |
| KaTeX JS | Missing `katex.min.js` script |
| KaTeX auto-render | Missing `auto-render.min.js` script |
| Shared stylesheet | Missing `href="/psets/material-page.css"` |
| Shared renderer | Missing `src="/psets/material-page.js"` |
| Main wrapper | Missing `<main class="wrap">` |
| Hero section | Missing `<section class="hero">` |
| Math fallback | Missing `.math-fallback` message |
| Inline styles | Has `<style>` block (must use external CSS) |
| Problem cards | Zero `<article class="problem">` found |
| Solution parity | Problem count ≠ solution count |
| Answer summary | Missing "Answer Summary" section |
| 5-3-2 progression | Missing "Problems 1-5 · Concept", "Problems 6-8 · Integration", "Problems 9-10 · Challenge" labels |
| Raw dollar math | Raw `$...$` found (must use `\( ... \)` or `\[ ... \]`) |
| Banned phrases | Contains "clearly", "trivially", "by inspection", "it follows" |
| Duplicate titles | Problem title repeats across pages |
| Duplicate statements | Problem statement repeats across pages |
| Missing assets | Local `href`/`src` points to non-existent file |

**Exit codes:**
- `0` = all pages pass
- `1` = one or more errors found

---

## 2. `verify-review-quizzes.mjs`

**What it does:** Verifies that graph-backed review quizzes in `app.js` are structurally complete and consistent.

**Run:**
```bash
node scripts/verify-review-quizzes.mjs
```

**Checks:**

| Check | Fail If |
|-------|---------|
| Scoring function | Missing `metadata-aware scoring` logic |
| Target concept scoring | Missing `answer.targetConcept` usage |
| Prerequisite scoring | Missing `answer.prereqsUsed` spreading |
| Dashboard wiring | Missing graph-backed section filtering |
| Feedback wiring | Missing `conceptGraphForSection` in feedback |
| Graph mappings | No section-to-graph mappings in `conceptGraphForSection` |
| Section exists | Graph-backed section missing from `gateDaProbabilitySections` |
| Review quiz defined | Section missing `reviewQuiz` property |
| Question generator | `reviewQuiz` does not call a question generator function |
| Graph function exists | Named graph function is missing from `app.js` |
| Question function exists | Named question generator is missing from `app.js` |
| Chapter ID match | Graph's `chapterId` does not match section ID |
| Fallback concepts | Missing `fallbackConcepts` in graph |
| Fallback difficulty | Missing `fallbackDifficultyMix` in graph |
| Fallback instruction | Missing `fallbackInstruction` in graph |
| Stable next action | Missing `stableNextAction` in graph |
| Repair material | Missing `repairMaterial` in graph |
| Metadata declaration | Question generator missing `const metadata = { ... }` |
| Metadata attachment | Questions not mapped with metadata object |
| Metadata completeness | Question missing `targetConcept` + `prereqsUsed` + `difficulty` + `gateWeight` |
| Concept coverage | Metadata concept not found in graph nodes |

**Exit codes:**
- `0` = all quizzes pass
- `1` = one or more errors found

---

## 3. `judge-material-quality.mjs`

**What it does:** Scores material pages out of 100 across 6 dimensions. This is a **quality gate**, not a structural check.

**Run:**
```bash
node scripts/judge-material-quality.mjs
```

**Scoring dimensions:**

| Dimension | Points | What Good Looks Like |
|---|---|---|
| Structure and workflow | 15 | Shared CSS/JS, hero, problem cards, solutions, answer summary, 5-3-2 progression |
| Progression and diagnostic design | 20 | Concept → integration → challenge. No repetitive problems. 8+ distinct tags. |
| Solution completeness | 25 | ≥45 words per solution. Math rendering in solutions. Concluding statement. |
| Mathematical communication | 15 | Uses `\(`, `\[`, no raw `$`. Named operators. Formula blocks. |
| Learner accessibility | 10 | Hero subtitle, core pattern panel, no banned phrases, clear language. |
| Feedback readiness | 15 | Problem tags visible. Concept/mechanic/application/challenge/hidden/isi labels. |

**Gate:**
- Individual page: ≥75
- Average across all pages: ≥80

**Exit codes:**
- `0` = all pages meet gate
- `1` = one or more pages below gate, or average below gate

---

## CI Integration

Recommended `package.json` scripts:

```json
{
  "scripts": {
    "verify:pages": "node scripts/verify-material-pages.mjs",
    "verify:quizzes": "node scripts/verify-review-quizzes.mjs",
    "verify:quality": "node scripts/judge-material-quality.mjs",
    "verify:all": "npm run verify:pages && npm run verify:quizzes && npm run verify:quality"
  }
}
```

Run before every commit:
```bash
npm run verify:all
```

---

## Port to TypeScript?

The scripts use Node.js built-ins (`fs`, `path`) and regex parsing. They do not need to be ported to TypeScript — they are build/verify tools, not runtime code.

**Keep them as `.mjs` Node scripts.** Add them to the repo root and run via `npm run verify:*`.

---

*Last updated: 2026-06-10*
*Source: `vonarchimboldi/aleph` main branch, full file read*
