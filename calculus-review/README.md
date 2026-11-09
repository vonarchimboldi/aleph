# Calculus review

Ten published refresher lessons for Phase 1 of a three-phase, thirty-study-day review. Phases 2–3 are planned and explicitly marked not authored. No calendar dates or deadlines are generated.

## Build

Run from the repository root:

```
python3 calculus-review/expand.py
node calculus-review/build-math.cjs /path/to/node_modules/katex
python3 calculus-review/sync_catalog.py
node scripts/verify-calculus-review.mjs
```

`expand.py` runs the base author, applies the requested scope and five-problem format, and generates temporary `.source.html` files plus `course.json`. The compiler validates every formula with KaTeX and emits native MathML, then deletes temporary HTML. Install KaTeX 0.16.11 in a build directory if needed. No runtime CDN or rendering scripts are needed. Do not run `author.py` alone as the final build: it is the base draft, before the scope expansion.

`course.json` is the normalized content inventory, including worked solutions and method tags. The app catalog must be kept in sync with it when editing prompts or keys. Every Phase 1 day uses the existing Aleph upload/AI-feedback flow, with grading keys and hypothesis/error classification. This adds no new notification or email flow.

## Source use

- Stewart's official topic index guides limits/integration breadth, not copied exercises.
- The exact supplied twelve-video MAT137 playlist is linked on Day 5, with original companion examples aligned to the verified titles. Metadata and order were checked; the companions are not video transcripts.
- Spivak fourth edition, Chapter 11 appendix, pp. 219–229, supplies the reading destination. Day 6 uses original exposition and problems, and explicitly translates its strict/weak convexity convention to the modern non-strict convention.
- The course index links official exam scope references. Exam-specific problem selection belongs to Phase 2; these original refresher problems are not labeled as past questions.

## Learner work

The reader's scratchpad is keyed to the current Aleph local user and day, stored only in that browser, and exportable as text. It is not a submission. Learners upload through the subject's existing workflow. Opening a practice solution marks that question as solution-consulted. Print output includes solutions. No submission implies mastery or independent work.
