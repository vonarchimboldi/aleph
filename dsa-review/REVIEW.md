# Week 1 verification

- Seven complete review/exposition lessons, fourteen original worked examples, seven reference implementations, thirty-five diagnostic questions, seven fresh checks and seven concept maps.
- Primary source/exam map: ADM third edition and official GATE DA 2027 Section 4. CMI-MSDS tags restricted to appropriate simple pseudocode/state reasoning. Explicit versus supporting/optional scope is visible on the index. No copied book exercises or claimed past-paper questions.
- Internal question metadata includes source block, skill, invariant/first step, trap, mode, estimated time and author rubric judgments. These judgments are not empirical calibration. Prior two DM/DSA review inventories inspected; new review emphasizes code state, boundaries, collision deletion, stability, recurrences and algorithm assumptions.
- `python3 dsa-review/verify_examples.py`: passed exhaustive small-input lower_bound/insertion/partition checks, BST/BFS/heap traces, independent nonnegative shortest-path cross-checks and negative-edge counterexample.
- `node scripts/verify-skiena-review.mjs`: passed page/diagnostic/map structure, unique prompts, matching grading keys, seven day uploads, relative dates and prior-progress preservation.
- `node scripts/verify-calculus-review.mjs`: passed regression check of the existing calculus subject.
- Isolated Chrome/Playwright: all seven pages at desktop/phone widths, no page overflow/errors, hidden feedback before explicit record, exact-set scoring, frozen original versus later corrections, reload/export and seven Aleph subject upload slots. API requests intercepted; no live learner attempts or messages created.
- Syntax checks and `git diff --check`: passed. Existing generic pset verifier has unrelated pre-existing Week7/8 repetition findings, recorded in the calculus review; no old psets changed.

Times are provisional. Weeks 2–3 are outlines, not authored daily lessons. Reader records remain browser-local until exported and uploaded through the existing Aleph subject workflow.
