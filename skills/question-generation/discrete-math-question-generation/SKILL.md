---
name: discrete-math-question-generation
description: Use when generating Discrete Math questions, quizzes, drills, or review sets for Priyanka's Platinum plan; questions must stay explicitly anchored to the Platinum Discrete Math course sources and current weekly topic sequence.
tags: [question-generation, discrete-math, platinum]
created_from_pattern: user-approved-direct-2026-07-04
last_verified: 2026-07-05
---

# Discrete Math Question Generation

## Source Constraint

Generate questions only from the Discrete Math material assigned in the Platinum plan. Cite or name the relevant source block in internal metadata or comments when possible.

Primary sources:

- CMU 21-228 Discrete Mathematics - Po-Shen Loh: https://www.math.cmu.edu/~ploh/2025-228.shtml
- MIT 6.1200J Mathematics for Computer Science - Spring 2024: https://ocw.mit.edu/courses/6-1200j-mathematics-for-computer-science-spring-2024/
- MIT 18.200 Principles of Discrete Applied Mathematics - Spring 2024: https://ocw.mit.edu/courses/18-200-principles-of-discrete-applied-mathematics-spring-2024/

Do not introduce topics outside this sequence unless the user explicitly asks for enrichment.

## Platinum Topic Sequence

Use this sequence when selecting scope:

1. Proof foundations, predicates, sets, basic counting, pigeonhole principle, induction.
2. Casework, strong induction, inclusion-exclusion, independence, conditioning.
3. Counting, binomial coefficients, relations, state machines, permutations/combinations.
4. Generating functions, sums, recurrences, Catalan-style counting.
5. Asymptotics, tail bounds, modular arithmetic, divisibility, number theory basics.
6. Cryptography, algebraic structures, basic group theory, proof fluency.
7. Graphs, graph coloring, connectivity, trees, graph traversal ideas.
8. Matching, bipartite graphs, network flows, max-flow min-cut.
9. Directed graphs, DAGs, linear programming, duality, optimization language.
10. Probability, random variables, expectation, variance, large deviations.
11. Information theory, compression, entropy, Huffman coding, zero-sum games.
12. Error-correcting codes, Hamming codes, Reed-Solomon codes, modular algebra review.
13. Final cumulative synthesis across proofs, counting, recurrences, graphs, probability, optimization, and coding.

## Generation Procedure

1. Identify the requested week(s), completed topics, and quiz purpose.
2. Select only topics already covered unless the task says to preview future work.
3. For each question, record:
   - topic
   - source course block
   - target skill
   - difficulty
   - expected first step
   - common mistake tag
4. Mix question forms:
   - recognition and definition checks
   - exact-counting or proof setup
   - short proof/counterexample
   - CMI/ISI/GATE-style mixed reasoning only when requested
5. Avoid answer leakage in locked quizzes. Put solutions in a separate artifact or behind the submission workflow.

## Quality Rules

- Prefer small, sharp prompts over long story problems.
- Include edge cases and near-miss traps: “exactly” vs “at least”, ordered vs unordered, disjoint vs overlapping cases, converse errors.
- Require justification when the point is proof, induction, or relation properties.
- For counting, force a named counting object before formula use.
- For induction, require base case, hypothesis, transition, and final claim.

## Exam-Level Calibration Rubric

When `exam_target` is CMI or CMI-MSDS, first load the shared rubric at `../cmi-msds-review-rubric.md` and the variety rubric at `../platinum-review-variety-rubric.md`. Apply the CMI dimensions plus the variety dimensions. The CMI rubric is authoritative for exam fit; the variety rubric is authoritative for concept rotation, skill diversity, trap diversity, and week-to-week novelty.

Use this rubric to decide whether each generated question matches the requested exam level. Score each dimension 0-2.

| Dimension | 0 | 1 | 2 |
| --- | --- | --- | --- |
| Source anchoring | Not tied to Platinum material. | Topic matches, but source block is vague. | Explicitly tied to a Platinum week/source block. |
| Skill targeting | Tests a generic fact only. | Tests one intended skill. | Tests the intended skill plus a realistic near-miss or transfer step. |
| Reasoning depth | Direct recall or formula substitution. | Requires one setup or proof step. | Requires choosing a method, handling cases, or justifying why the method applies. |
| Exam fit | Does not resemble GATE/ISI/CMI style. | Approximate style but weak difficulty control. | Matches requested exam style and time pressure. |
| Trap quality | No plausible distractor or common mistake. | Has a basic trap. | Targets a known error type: overcount, converse error, missing case, invalid induction step, or notation confusion. |
| Solvability | Ambiguous or underspecified. | Solvable but wording can be tightened. | Has a unique expected answer path and clear assumptions. |
| Feedback value | Hard to diagnose from the answer. | Diagnoses a broad topic. | Reveals a specific misconception and maps to a remedy. |

Pass rule:

- For ordinary drills: total score at least 10/14 and no 0 in source anchoring or solvability.
- For CMI/ISI/GATE-style reviews: total score at least 12/14 and no 0 in source anchoring, exam fit, or solvability.
- Regenerate any question that fails the pass rule before using it in a quiz.
- Regenerate any question that repeats a previous review's concept family, expected first step, or trap family unless the metadata explains that it targets a recent feedback gap.

## DSPy/GEPA Readiness

When generating questions for later DSPy or GEPA optimization, emit a structured record per question:

```json
{
  "question_id": "",
  "subject": "discrete-math",
  "source_block": "",
  "platinum_week": null,
  "exam_target": "GATE|ISI|CMI|mixed|none",
  "cmi_rubric_version": "",
  "cmi_dimensions": null,
  "cmi_pass": null,
  "question_type": "mcq|short-answer|proof|multi-part",
  "target_skill": "",
  "difficulty": "easy|medium|medium-hard|hard",
  "expected_first_step": "",
  "common_mistake": "",
  "variety_family": "",
  "reasoning_mode": "",
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

- Add detailed exam-skill maps for GATE DA and ISI.
- Refine non-CMI exam-specific difficulty calibration and question-form rules after the GATE/ISI skill analysis is complete.
- Run DSPy and GEPA against generated question records to tune prompts and rubric weights.
- Add validators for topic coverage, source anchoring, and solution-lock compliance.
