# Calculus review

Ten published refresher lessons for Phase 1 of a three-phase, thirty-study-day review. Phase 2 now has 200 source-linked questions in ten daily packets; Phase 3 remains planned and not authored. No calendar dates or deadlines are generated.

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

## Round 2

Open `round2/index.html`. The catalogue contains 200 distinct question references across 53 PDFs: 65 JAM MS, 38 ISI MSQE, 23 ISI MStat, 32 JEE Advanced, 21 CMI MSDS, 12 historical DSE and 9 GATE DA. Selection is a coverage survey, not an exhaustive exam-frequency analysis. Source labels preserve ISI sample-question status and DSE third-party provenance. Some questions extend beyond GATE DA to multivariable calculus or proof-based analysis.

`round2/catalogue.json` is the normalized public question index; it contains original short descriptions and exact source/page references, not copied papers or generated exam statements. `sources.json` records PDF provenance and hashes. PDFs remain at their source URLs; the existing GATE archive is reused. Worked solutions and canonical question transcriptions are held in private KV storage and returned only after the matching answers are saved on the server. The app uses that checked reference bank for question-level error analysis; it must not invent statements or numeric grades from catalogue references.

Each packet has 20 questions, a 60-minute practice window and a separate review (about 30 minutes). Do not assume every long proof fits in the hour. The browser preserves the first-attempt snapshot separately from corrections; the server also retains submitted original text/files and separate attempts. untouched questions are unattempted, not wrong. Drafts use an explicitly entered learner name and stay on that browser. Export and upload both the record and written work through the corresponding subject material. No local draft establishes server completion or unlocks solutions. See `round2/README.md` for the submission gate, private authoring and mentor error log.

Rebuild Round 2 reading pages with `python3 calculus-review/round2/build.py`. `materials.json` holds the ten app upload slots; the matching `CALCULUS_ROUND2_CATALOG` block is outside the Phase 1 generator. Keep it in sync when editing packet references. Verify with `node scripts/verify-calculus-round2.mjs`. No calendar assignments are created by the content builder.
