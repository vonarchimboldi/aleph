# DBMS Week1 review

## Scope and source handling

The recorded chosen references were found in Commonplace: Database System Concepts7e and selected Han/Kamber/Pei Data Mining3e. The recorded Round1 prerequisite is retained without assuming completion. The seven authored relative days cover the GATE DA2027 Section5 database/warehouse/transformation scope. Weeks2–3 are outlines, not authored daily material.

The authors' contents/online-chapter list and official2024–2026 papers were consulted. Daily question/page links and `evidence.json` distinguish observed paper families from explicit-syllabus supplemental coverage. All new problems are original. Official keys/accepted ranges are not used as answers to changed variants; existing Q59 ambiguity is identified rather than inherited. No exam weight guarantee is made.

## Checks

- `python3 dbms-review/verify_examples.py`: passed. Synthetic in-memory SQLite checks of SQL aggregation/correlation/null/anti-join/outer-join results and foreign-key actions; independent FD-closure/key enumeration, set-query and quantifier checks; decomposition-preservation counterexample; layout, cube, scaling and compression arithmetic.
- `node scripts/verify-dbms-threeweek.mjs`: passed. Seven lesson/maps,35 unique tagged questions, evidence links, matching day-upload/feedback keys, preserved old pack/progress, and no dates assigned.
- Existing `node scripts/verify-dbms-review.mjs`: passed43-card/40-recipe flashcard/review regression checks. Original test retained.
- Existing Skiena and calculus focused verifiers: passed.
- Isolated Chrome/Playwright: seven pages desktop/phone, no page overflow/errors; feedback/consolidation hidden before explicit local attempt; exact-set scoring; original/correction separation; reload/export; DSA/DBMS namespace isolation; seven subject upload slots. Separate DSA browser regression passed after runner configuration was added. APIs intercepted; no live learner submissions created.
- JavaScript syntax and `git diff --check`: passed. Existing unrelated generic pset repetition findings remain outside this change.

The shared diagnostic runner now takes configuration while preserving its DSA defaults. Reader records are explicitly browser-local until exported and uploaded through the existing Aleph workflow. No notification/email sent. Material was author-reviewed, not classroom-timed or independently calibrated.
