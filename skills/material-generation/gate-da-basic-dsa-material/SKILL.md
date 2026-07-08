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

## Chapter Style

- Lead with a small concrete program, array, string, tree, graph, or trace.
- Explain ideas using invariant/state language before formal notation.
- Keep code language-neutral unless the app section has a reason to use Java/C++/Python.
- Use compact pseudocode and clear indexing conventions.
- Use examples with small inputs first, then one exam-style compressed example.
- Avoid generic motivational prose; every paragraph should support a skill, trace, or exam move.

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
