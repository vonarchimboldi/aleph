# Three-week Skiena DSA review

Week 1 has seven complete exposition/diagnostic lessons. Week 2 is planned mixed applications and Week 3 is planned diagnostic-driven remedy. No calendar start or deadlines assigned. The primary map uses GATE DA 2027 Section 4 and ADM third edition Chapters 1–8 selectively. CMI MSc DS contributes simple pseudocode reasoning; the complete GATE structure list is not asserted to be an explicit CMI syllabus list.

The user explicitly selected Skiena, superseding the earlier local DSA skill's Aho/Ullman source restriction for this review. Other DSA skill rules are retained: concrete inputs, explicit invariants/cost conventions, edge cases, diagnostic metadata and post-attempt solutions. Prior August 16/23 reviews were inspected; matching/flow/definition recall is reduced in favor of Python aliasing, search boundaries, pointer updates, collision deletion, stability and recurrences. Graph review remains because it is in the explicit current exam intersection. This is a subject-local review, so other subjects are intentionally omitted.

## Build

```
python3 dsa-review/build.py
python3 dsa-review/sync_catalog.py
node scripts/verify-skiena-review.mjs
```

The normalized content, worked answers, source anchors, question metadata and reference implementations are in `course.json`. Sources and an overlap table are visible on the course index. All exposition/examples/questions are original, not book excerpts or claimed past questions. Source metadata is the assigned review anchor, not a claim that every topic was independently mastered earlier.

## Diagnostic workflow

Five questions/day: two multi-select (2 points each, exact set) and three short responses (1 point result, 1 point requested explanation), ten total. Estimated 25 minutes plus checking; not classroom-timed. Original local attempt is frozen when explicitly recorded; later drafts/corrections are separate. Solutions and consolidation are hidden before that local record. This is an educational workflow, not an authenticated proctored test.

Reader work is browser-local by current user/day and exportable. A local attempt does not create a server submission. Seven day slots use Aleph's existing file upload and AI-feedback workflow, with numbered questions, answer keys and error tags. No new notification or email flow is created. No real learner attempt is inserted for testing.

Author rubric scores in question metadata are internal self-review judgments, not empirical calibration. CMI tags apply only to relevant simple-trace questions. Whole-course assessments are GATE-first refreshers, not full CMI examination simulations.
