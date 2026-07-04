---
name: error-analysis-feedback
description: Use when generating or reviewing learner feedback that must classify student mistakes, explain likely causes, and recommend targeted remedies for each error type.
tags: [feedback, tutoring, error-analysis]
created_from_pattern: user-approved-direct-2026-07-04
last_verified: 2026-07-04
---

# Error Analysis Feedback

## When To Use

Use this skill when a feedback report, quiz review, or submitted-solution analysis needs more than a score. The output should classify mistakes, explain what each mistake means, and give a concrete remedy.

## Core Workflow

1. Identify the first wrong step, not only the final wrong answer.
2. Classify each error using the taxonomy below.
3. Separate cause from symptom: e.g. an algebra slip may hide a concept gap, but do not assume that without evidence.
4. Give one remedy per error type: review target, next drill, and what a corrected attempt should show.
5. End with 2-4 priority actions, ordered by what blocks future work most.

## Mistake Taxonomy

Use these labels consistently:

| Label | Meaning | Evidence | Remedy |
| --- | --- | --- | --- |
| `misread-question` | The learner solved a different task from the one asked. | Wrong quantity, ignored condition, answered “at least” instead of “exactly”, used wrong data. | Restate givens and target before solving; underline constraints; do 3 paraphrase drills. |
| `concept-gap` | The underlying idea is not understood. | Cannot state definition, picks wrong theorem/tool, explanation is circular or memorized. | Re-teach the concept with one simple example; require definition + when-to-use cue; assign basic concept checks. |
| `method-selection` | The concept is known, but the learner chose the wrong strategy. | Uses permutations for combinations, linear search where binary search invariant applies, ordinary induction where strong induction is needed. | Build a decision checklist; contrast two near-miss problem types; assign mixed recognition drills. |
| `setup-modeling` | The learner cannot translate the problem into variables, events, recurrence, invariant, equation, or cases. | No defined variables, incomplete cases, missing recurrence/base case, no invariant. | Require a setup-only rewrite before calculation; use “name objects, constraints, target” template. |
| `case-coverage` | The solution misses, duplicates, or overlaps cases. | Overcount/undercount, missing edge cases, double-counting intersections, skipped empty/singleton boundary. | Draw case tree or Venn/table; ask for disjointness and completeness checks. |
| `calculation-algebra` | The plan is right, but arithmetic/algebra/simplification is wrong. | Correct setup followed by sign error, coefficient error, wrong simplification, finite-sum slip. | Redo from the last correct line; add one verification shortcut such as plugging small values. |
| `logic-justification` | The answer may be true but the argument does not prove it. | Unjustified implication, converse error, handwave, “obvious” claim, missing induction base/step. | Write proof skeleton: assumptions, claim, valid implication, conclusion; require one counterexample check. |
| `notation-language` | Mathematical or code notation is used imprecisely enough to change meaning. | Confuses subset/member, index/value, \(O\) vs exact count, stack top vs queue front. | Make a symbol glossary for the problem; rewrite in words and symbols. |
| `procedure-execution` | The learner knows the algorithm/procedure but traces or applies it incorrectly. | Wrong stack/queue trace, pointer update order error, binary search interval update mistake. | Trace a minimal example step-by-step; require state table after each operation. |
| `edge-case-boundary` | The main solution ignores boundary conditions. | Empty list, first/last node, zero/one input, equality case, base case, wrap-around index missing. | Add an edge-case checklist; test smallest and largest meaningful examples. |
| `time-pressure-carelessness` | Error appears due to speed, not missing knowledge. | Isolated copying, option marking, arithmetic, or skipped condition error despite correct nearby reasoning. | Slow down at checkpoints; add final 30-second audit: target, constraints, units, option. |
| `incomplete-answer` | Work is partially correct but does not answer all requested parts. | Missing final statement, missing explanation, no simplified value, no requested justification. | Use answer checklist; force “Therefore…” final sentence for every problem. |

## Feedback Report Shape

Use this structure:

```text
Overall diagnosis:
Topic scores:
Mistake table:
- Question:
- First wrong step:
- Error type:
- Why this matters:
- Remedy:
- Next drill:
Priority repair plan:
```

For each remedy, include:

- `Review`: the exact concept or procedure to revisit.
- `Drill`: a small next exercise type.
- `Success criterion`: what the next attempt must show.

## Guardrails

- Do not label a learner as careless when the work shows a concept or setup gap.
- Do not give generic advice like “practice more”; name the drill.
- Do not overload feedback with every minor slip. Prioritize recurring and blocking errors.
- If evidence is insufficient, mark the diagnosis as `uncertain` and state what would confirm it.
