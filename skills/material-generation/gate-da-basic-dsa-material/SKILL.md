---
name: gate-da-basic-dsa-material
description: Use when generating GATE DA Basic Data Structures and Algorithms chapter material, examples, explanations, end-of-chapter problems, or review quizzes from external DSA/algorithms sources.
tags: [material-generation, dsa, gate-da-basic]
created_from_pattern: user-approved-direct-2026-07-07
last_verified: 2026-07-07
---

# GATE DA Basic DSA Material Generation

Use this skill to build readable Basic-plan DSA chapters and end-of-chapter practice. The output must teach the current Aleph chapter, not summarize source pages.

## Required Inputs

- Target chapter number and title.
- GATE DA Basic DSA scope for that chapter.
- Existing Aleph chapter style from `app.js` if editing the app.
- At least two source families from `references/source-map.md`.

## Source Rule

Before generating material, read `references/source-map.md`. Use the listed sources to extract:

- motivating examples;
- concrete traces;
- visual or state-machine ideas;
- common student mistakes;
- problem formats suitable for GATE DA.

Do not copy source exercises verbatim. Reconstruct new examples and problems that train the same idea.

## Mandatory Material Generation Pipeline

Run this workflow whenever generating DSA material, examples, practice problems, review quizzes, or end-of-chapter exercises:

1. Skill lookup: check `skills/skill-index.md`, load this skill, then read `references/source-map.md`.
2. Source/tool call: consult the relevant source families for the chapter. Use at least one implementation source and one analysis/proof source. Add LeetCode-style pattern mining only for canonical applications and traps; do not copy problem statements or editorials.
3. Source extraction: record the examples, traces, invariants, misconceptions, canonical applications, and problem patterns that will be adapted.
4. Material draft: write the chapter around concrete state changes, not generic summaries.
5. Deep-learning rubric check: score the draft with the rubric below. Revise before writing final problems if any hard gate fails.
6. Practice generation: generate labelled practice, end-of-chapter problems, and app review metadata.
7. Solution verification: solve every generated problem independently, test small cases or manual traces, and verify answer uniqueness.
8. Submit gate: submit only after the rubric and solution-verification checks pass.

## Generation Workflow

1. Identify the chapter's GATE DA endpoint: what the learner must be able to answer in MCQ/MSQ/NAT style.
2. Read at least two source families from the source map and record the usable ideas.
3. Convert those ideas into an Aleph chapter:
   - concrete opening example;
   - concept sections in increasing difficulty;
   - worked examples with state traces, tables, or invariants;
   - labelled practice prompts;
   - end-of-chapter problem set;
   - objective review quiz metadata if adding to the app.
4. Check the chapter against the GATE DA coverage checklist.
5. Revise until every end-of-chapter problem maps to at least one explicit GATE DA skill.

## Deep-Learning Rubric

Score each dimension 0-3. A generated chapter or quiz passes only if every dimension is at least 2, solution correctness is 3, and the total score is at least 25/30.

| Dimension | 0 | 1 | 2 | 3 |
| --- | --- | --- | --- | --- |
| Conceptual model and invariants | No invariant or state model. | Names the concept but does not use it. | States the working invariant/state model and uses it in examples. | Learner must create, repair, or compare invariants in practice problems. |
| Runtime complexity | Missing or superficial. | Gives Big-O without derivation. | Derives loop/recursion cost from the trace or recurrence. | Includes exact counts or competing approaches where exam traps are plausible. |
| Space complexity | Missing. | Mentions auxiliary space only once. | Explains stack/array/temporary storage for the main method. | Tests in-place vs auxiliary-space tradeoffs, recursion stack depth, or data-structure storage. |
| Simulation practice | No trace. | One passive worked trace. | Learner traces at least one loop/recursion/search step. | Multiple traces include boundary cases, updates, and final-state checks under time pressure. |
| Canonical applications | No applications. | One application named without transfer. | Shows at least two canonical uses relevant to GATE DA. | Problems require recognizing which canonical pattern applies in a compressed exam setting. |
| Tricky examples | Only standard happy paths. | One mild edge case. | Includes off-by-one, equality, duplicates, empty/one-element, or not-found traps as relevant. | Includes LeetCode-style adversarial patterns rewritten as original prompts with exam-level traps. |
| Correctness reasoning | No proof or justification. | Informal intuition only. | Includes a one- or two-sentence correctness argument. | Learner must identify why a step is valid, where an invariant breaks, or how induction applies. |
| GATE DA transfer | Not exam-shaped. | Too project-like or implementation-heavy. | Uses MCQ/MSQ/NAT/short-answer styles and short pseudocode. | Compresses reasoning to GATE timing with plausible distractors and answer checks. |
| Feedback metadata | Missing. | Partial tags only. | Every problem has concept, prerequisite, common mistake, and answer-check metadata. | Metadata supports targeted remediation and distinguishes misconception types. |
| Solution correctness | Solutions absent or unchecked. | Solutions present but not independently verified. | Solutions checked by manual reasoning. | Every solution is independently solved, traced on small cases, and checked for objective-answer uniqueness. |

Hard failure conditions:

- The material lacks a usable invariant or state model.
- Runtime or space complexity is missing for algorithmic content.
- There is no learner-facing simulation/trace practice.
- Canonical applications are not identified.
- Tricky examples are copied from a source instead of rewritten.
- Any generated problem lacks a verified solution.
- MCQ/MSQ/NAT answers are ambiguous, have multiple unintended answers, or cannot be checked.

## Chapter Style

- Lead with a small concrete program, array, string, tree, graph, or trace.
- Explain ideas using invariant/state language before formal notation.
- Keep code language-neutral unless the app section has a reason to use Java/C++/Python.
- Use compact pseudocode and clear indexing conventions.
- Use examples with small inputs first, then one exam-style compressed example.
- Avoid generic motivational prose; every paragraph should support a skill, trace, or exam move.
- Include runtime and space analysis close to the example that creates the cost.
- Include simulation practice where the learner updates variables, stack frames, pointers, bounds, or data-structure state by hand.
- Include canonical applications and original tricky examples, especially patterns that resemble common LeetCode traps but are rewritten for GATE DA scope.

## End-Of-Chapter Problem Requirements

Every DSA chapter must end with:

- 5 labelled practice problems: mechanics, trace, invariant, edge case, and exam transfer.
- 8-12 objective review questions if the chapter is app-backed.
- At least one GATE-style MCQ, one MSQ/all-that-apply style item, and one NAT/integer answer style item when the concept permits.
- Coverage of common traps: off-by-one, equality case, empty/one-element input, duplicate values, wrong recurrence, wrong invariant, wrong data-structure operation.
- Metadata per question:

```json
{
  "source_ideas": [],
  "gate_da_skill": "",
  "question_type": "mcq|msq|nat|short-answer|trace",
  "target_concept": "",
  "prereqs_used": [],
  "difficulty": "easy|medium|medium-hard|hard",
  "expected_first_step": "",
  "common_mistake": "",
  "answer_check": ""
}
```

## Solution Verification

Before accepting generated problems:

1. Write or derive the canonical solution privately before finalizing the prompt.
2. For algorithmic questions, simulate at least two cases: one standard case and one edge/trap case.
3. Check runtime and auxiliary-space claims against the simulation, recurrence, or data-structure operations.
4. For MCQ/MSQ, verify that exactly the intended choices are correct.
5. For NAT/integer answers, verify that the answer is unique under the stated assumptions.
6. For short-answer questions, define the minimal acceptable invariant, recurrence, trace state, or explanation.
7. Regenerate or revise any problem whose solution cannot be checked cleanly.

## GATE DA Coverage Checklist

For DSA material, make sure end-of-chapter problems collectively test:

- time-complexity recognition from short pseudocode;
- loop and recursion trace discipline;
- recurrence writing and solving when relevant;
- array/string indexing and boundary conditions;
- search invariants, especially binary search when relevant;
- data-structure operation semantics;
- implementation invariants and edge cases;
- correctness reasoning in one or two sentences.

## Chapter-Specific Expectations

- Chapter 2, Induction and Recursion: recursive call tree, base case, recurrence from code, induction proof shape, tail recursion, divide-and-conquer recurrence, Master Method only in forms likely for GATE DA.
- Chapter 3, Arrays, Strings, and Binary Search: array traversal, prefix/suffix state, string scans, two-pointer patterns, sorted-array reasoning, binary search invariant and termination, off-by-one checks.

## Verification

Before finishing a generated chapter:

1. List the source families used and the ideas extracted.
2. List the GATE DA skills covered by end-of-chapter problems.
3. Confirm there is no copied source problem wording.
4. Confirm every objective item has concept/prerequisite metadata for feedback.
5. Run available repo checks for touched app/material files.
