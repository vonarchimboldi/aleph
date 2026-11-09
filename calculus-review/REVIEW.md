# Phase 1 review

## Scope

Ten relative study-day lessons. Each has exposition, worked examples, five practice questions, a separate opening/exit check, a correction prompt, answer summary and accessible concept map. Limits and integrals include expanded reference banks. Days 4–5 each have twelve worked companions. Phase 2 exam-specific sets and Phase 3 adaptive repairs remain explicitly planned, not authored.

Source handling: the supplied playlist's twelve titles/order/links were checked. Companion problems are original and are not claimed to transcribe unseen video examples. The Spivak reading destination and strict/weak terminology are explicit. Mathematical exposition/problems are original; textbook pages are not reproduced.

## Checks performed

- `node scripts/verify-calculus-review.mjs`: passed. Checks all ten pages, five practices/day, unique response IDs, rendered math, concept maps, numbered grading keys, upload routing, rubric/context, no assigned dates, and preserved prior progress. Representative numerical computations independently checked.
- Browser checks with installed Chrome/Playwright: all ten lessons at desktop and phone widths, no page overflow/errors, native math with external requests blocked, local scratchpad reload, solution-exposure marking, text export, print-to-PDF, and ten subject upload controls. API calls intercepted; no real learner records modified.
- `node scripts/verify-math-remedial.mjs`: passed, with synthetic in-memory records.
- JavaScript syntax and `git diff --check`: passed.
- Existing `node scripts/verify-material-pages.mjs`: fails on pre-existing repeated Week 7/Week 8 titles/statements in the unrelated probability/statistics psets. No existing pset was modified. New calculus pages use the shared material CSS with pre-rendered MathML rather than a runtime KaTeX CDN; the focused verifier covers their structure.

The example mathematics and solutions were author-reviewed; the sessions have not been classroom-timed. AI feedback is the existing on-request workflow, not a newly generated report or a notification. Scratchpad storage is explicitly browser-local; submission uses the subject's existing upload workflow.
