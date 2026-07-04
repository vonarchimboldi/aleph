---
name: dsa-question-generation
description: Use when generating Data Structures and Algorithms questions, quizzes, drills, or review sets for Priyanka's Platinum plan; questions must stay explicitly anchored to the Platinum DSA course sources and current weekly topic sequence.
tags: [question-generation, dsa, platinum]
created_from_pattern: user-approved-direct-2026-07-04
last_verified: 2026-07-04
---

# DSA Question Generation

## Source Constraint

Generate questions only from the DSA material assigned in the Platinum plan. Cite or name the relevant source block in internal metadata or comments when possible.

Primary sources:

- Aho/Ullman Foundations of Computer Science: http://infolab.stanford.edu/~ullman/focs.html
- Cartesian - Interactive Handbook on Data Structures and Algorithms: https://cartesian.app/

Platinum scope uses Aho/Ullman FOCS chapters 1-9, 12, and 14. Skip chapters 10, 11, and 13 unless the user explicitly changes the plan.

## Platinum Topic Sequence

Use this sequence when selecting scope:

1. Algorithmic abstraction, complexity analysis, arrays, search.
2. Iteration, recursion, induction, strings, basic sorting.
3. Lists, linked lists, stacks, queues, implementation invariants.
4. Sets, hash tables, dictionaries, collision handling.
5. Trees, binary trees, traversal, structural induction.
6. Binary search trees, heaps, priority queues, heapsort.
7. Matrices, relational data modeling, table-oriented operations.
8. Graphs, graph representation, connectivity, BFS, DFS.
9. Minimum spanning trees, shortest paths, graph algorithm analysis.
10. Dynamic programming, backtracking, recurrence-driven design.
11. Tries, string indexes, union-find, graph connectivity applications.
12. Logic for correctness, specifications, predicates, program reasoning.
13. Final cumulative DSA synthesis across analysis, data structures, graph algorithms, recursion, DP, and correctness.

## Generation Procedure

1. Identify requested week(s), completed topics, and quiz purpose.
2. Select only topics already covered unless the task says to preview future work.
3. For each question, record:
   - topic
   - source course block
   - target skill
   - difficulty
   - expected first step or invariant
   - common mistake tag
4. Mix question forms:
   - pseudocode tracing
   - loop-count and recurrence reads
   - data-structure operation traces
   - representation invariant checks
   - correctness and edge-case prompts
5. Avoid answer leakage in locked quizzes. Put solutions in a separate artifact or behind the submission workflow.

## Quality Rules

- Prefer concrete arrays, strings, stacks, queues, and pointers over vague prose.
- Require invariants for search, loops, stacks/queues, and pointer updates.
- Include edge cases: empty input, one element, first/last node, wrap-around, equality case, missing target.
- Separate exact operation counts from asymptotic bounds.
- For recursion, require base case, recurrence, and order of growth when relevant.

## Exam-Level Calibration Rubric

Use this rubric to decide whether each generated question matches the requested exam level. Score each dimension 0-2.

| Dimension | 0 | 1 | 2 |
| --- | --- | --- | --- |
| Source anchoring | Not tied to Platinum material. | Topic matches, but source block is vague. | Explicitly tied to a Platinum week/source block. |
| Skill targeting | Tests a generic fact only. | Tests one intended skill. | Tests the intended skill plus a realistic trace, invariant, or transfer step. |
| Reasoning depth | Direct recall or definition only. | Requires one trace/count/setup step. | Requires choosing an invariant, edge case, recurrence, or representation argument. |
| Exam fit | Does not resemble GATE/ISI/CMI style. | Approximate style but weak difficulty control. | Matches requested exam style and time pressure. |
| Trap quality | No plausible distractor or common mistake. | Has a basic trap. | Targets a known error type: off-by-one, wrong invariant, pointer-order bug, recurrence misread, or data-structure confusion. |
| Solvability | Ambiguous or underspecified. | Solvable but wording can be tightened. | Has a unique expected answer path and clear assumptions. |
| Feedback value | Hard to diagnose from the answer. | Diagnoses a broad topic. | Reveals a specific misconception and maps to a remedy. |

Pass rule:

- For ordinary drills: total score at least 10/14 and no 0 in source anchoring or solvability.
- For CMI/ISI/GATE-style reviews: total score at least 12/14 and no 0 in source anchoring, exam fit, or solvability.
- Regenerate any question that fails the pass rule before using it in a quiz.

## DSPy/GEPA Readiness

When generating questions for later DSPy or GEPA optimization, emit a structured record per question:

```json
{
  "question_id": "",
  "subject": "dsa",
  "source_block": "",
  "platinum_week": null,
  "exam_target": "GATE|ISI|CMI|mixed|none",
  "question_type": "mcq|short-answer|trace|proof|multi-part",
  "target_skill": "",
  "difficulty": "easy|medium|medium-hard|hard",
  "expected_first_step_or_invariant": "",
  "common_mistake": "",
  "rubric_scores": {
    "source_anchoring": 0,
    "skill_targeting": 0,
    "reasoning_depth": 0,
    "exam_fit": 0,
    "trap_quality": 0,
    "solvability": 0,
    "feedback_value": 0
  },
  "pass": false
}
```

Optimization objective: maximize pass rate, topic coverage, and post-submission diagnostic value while preserving source anchoring and solution-lock rules.

## TODO

- Add detailed exam-skill maps for GATE DA, ISI, and CMI.
- Refine exam-specific difficulty calibration and question-form rules after the GATE/ISI/CMI skill analysis is complete.
- Run DSPy and GEPA against generated question records to tune prompts and rubric weights.
- Add validators for pseudocode clarity, operation-count accuracy, and source anchoring.
