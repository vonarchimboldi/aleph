---
name: end-of-chapter-review-quiz
description: Use when generating graph-backed end-of-chapter review quizzes, objective reviews, or diagnostic quiz plans that sample one-topic, two-topic, and three-topic questions from a concept graph.
tags: [question-generation, review-quiz, diagnostics, aleph]
created_from_pattern: user-approved-direct-2026-07-08
last_verified: 2026-07-08
---

# End-of-Chapter Review Quiz Generation

Use this skill to generate Aleph-style end-of-chapter review quizzes. These quizzes diagnose mastery, not just score answers.

## Required Inputs

- Subject, chapter title, and chapter scope.
- Concept graph or topic list with prerequisite links when available.
- Target exam level and subject-specific rubric.
- Desired length, timing, and format mix.
- Existing chapter material and practice problems.
- Previous one or two review quizzes when available, so the topic plan can avoid stale repetition.

## Methodology

Build the quiz in this order:

1. Load the subject material-generation or question-generation skill first when one exists.
2. Extract the chapter's concept graph: concept ids, labels, prerequisites, gate weight, common mistakes, and repair material.
3. Use `scripts/sample-review-topics.mjs` to plan a mix of:
   - single-topic questions for isolated prerequisite checks;
   - two-topic questions for common concept interactions;
   - three-topic questions for exam-transfer synthesis.
4. Generate questions from the topic plan, not from a flat list.
5. For Platinum weekly or cumulative reviews, apply `../platinum-review-variety-rubric.md` before finalizing the topic plan.
6. Attach metadata to every question.
7. Verify every answer and every distractor.
8. Run the review-quiz verifier before submission.

## Topic Mix

Default 10-question objective review:

- 5 single-topic questions;
- 3 two-topic questions;
- 2 three-topic questions.

Default 12-question objective review:

- 5 single-topic questions;
- 4 two-topic questions;
- 3 three-topic questions.

For harder exams or cumulative reviews, increase mixed two-topic and three-topic counts. For repair quizzes, increase single-topic counts on weak prerequisites.

## Question Requirements

Every review quiz must include:

- prerequisite checks before synthesis;
- at least one trace/simulation item where relevant;
- at least one invariant/correctness item where relevant;
- at least one complexity or structural shortcut item where relevant;
- plausible distractors based on common mistakes;
- at least one mixed item that requires choosing the right concept before calculating.
- enough concept, skill, reasoning-mode, and trap rotation to avoid repeating the prior review unless feedback evidence justifies the repetition.

Every question must have:

```json
{
  "id": "",
  "kind": "single concept|mixed: two concepts|mixed: three concepts",
  "tags": [],
  "targetConcept": "",
  "prereqsUsed": [],
  "difficulty": 1,
  "gateWeight": "low|medium|high",
  "expectedFirstStep": "",
  "commonMistake": "",
  "varietyFamily": "",
  "reasoningMode": "",
  "answerCheck": ""
}
```

## Verification

Before submitting:

1. Confirm the topic plan has the requested single/two/three-topic mix.
2. Confirm every concept with high exam weight appears at least once or has a stated reason for omission.
3. Confirm mixed questions use genuinely interacting concepts, not unrelated tags.
4. Solve each question independently.
5. For MCQ/MSQ, check that the answer choices have exactly the intended correct set.
6. For NAT/integer items, check uniqueness under the stated assumptions.
7. Confirm every miss can map to a concept-graph node and repair action.
8. Regenerate failed questions and rerun verification.

## Sampler Tool

Use the bundled sampler to create a reproducible topic plan:

```bash
node skills/question-generation/end-of-chapter-review-quiz/scripts/sample-review-topics.mjs \
  --input concept-graph.json \
  --single 5 \
  --pair 3 \
  --triple 2 \
  --seed dsa-chapter-2
```

The input may be:

- `{ "nodes": { "concept-id": { "label": "...", "prereqs": [], "gateWeight": "high" } } }`
- `{ "topics": [{ "id": "...", "label": "...", "prereqs": [], "gateWeight": "high" }] }`
- `["topic-a", "topic-b", "topic-c"]`

The output is JSON with topic samples labelled as `single concept`, `mixed: two concepts`, or `mixed: three concepts`.

## Hard Failures

Reject the quiz if:

- it samples topics only uniformly without respecting prerequisites or gate weight;
- it has no mixed two-topic or three-topic items when the chapter has enough concepts;
- mixed items are just multi-tagged single-concept questions;
- it repeats the previous review's topic buckets, reasoning modes, first-step patterns, or trap families without a stated diagnostic reason;
- questions lack feedback metadata;
- answers are unverified or ambiguous;
- misses cannot drive targeted repair work.
