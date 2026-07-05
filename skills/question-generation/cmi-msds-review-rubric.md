# CMI MS DS Review Test Rubric

Use this rubric whenever a Platinum review quiz or question set targets CMI M.Sc. Data Science entrance-exam style. It is based on CMI's official MSc Data Science syllabus and recent official papers from 2021-2025.

Official source anchors:

- Syllabus: https://www.cmi.ac.in/admissions/syllabus/datascience-syllabus.pdf
- Past papers index: https://www.cmi.ac.in/admissions/syllabus.php
- Recent papers sampled for calibration: 2021, 2022, 2023, 2024, 2025 MSc Data Science papers.

## Exam Pattern Signals

- Part A is multi-select MCQ. There may be multiple correct choices; full credit requires selecting all correct options and no incorrect options.
- Part B asks short-answer questions with brief explanation.
- Part A is used as a screening gate; Part B is graded only after a minimum Part A score, but both parts affect final selection.
- Numerical answers may be fractions, decimals, or symbolic expressions.
- The exam tests aptitude in mathematics, statistics, and computer science, with school mathematics, discrete mathematics, probability theory, data interpretation, and simple pseudocode reading as recurring foundations.

## Dimension 1: Subject Coverage

Score 0-2.

| Score | Standard |
| --- | --- |
| 0 | Off-scope for the assigned Platinum material or drifts into unassigned advanced topics. |
| 1 | On-topic but too narrow, usually testing one isolated definition or one rote exercise pattern. |
| 2 | Stays within assigned Platinum material while reflecting CMI's mix: finite sets/functions/relations, counting, logic, proof, elementary probability/data interpretation, and pseudocode/algorithm tracing. |

For a Discrete Math + DSA review, the acceptable CMI-style scope is:

- Discrete Math: functions, injective/surjective/bijective reasoning, sets, relations, truth tables, logic equivalence, counting, permutations/combinations, pigeonhole, inclusion-exclusion, induction, modular/divisibility reasoning.
- DSA/programming: array traces, loop behavior, conditionals, binary search/search traces, recursion traces, simple string/list/stack/queue behavior, invariants, edge cases, and operation counts.
- Do not include Linear Algebra, calculus, probability, or statistics unless those topics were explicitly assigned in the covered Platinum scope for that quiz.

## Dimension 2: Skills Required

Score 0-2.

| Score | Standard |
| --- | --- |
| 0 | Tests recall only: formula name, definition wording, or direct substitution. |
| 1 | Requires one applied skill: trace code, count cases, apply a relation property, or compute a finite probability/count. |
| 2 | Requires at least two coordinated skills under time pressure, such as reading pseudocode plus identifying an invariant, choosing ordered vs unordered counting, checking all relation properties with counterexamples, or turning a word condition into cases. |

High-value CMI skill targets:

- translate a short story or code block into a mathematical object;
- identify exactly what is being counted or traced;
- distinguish existential, universal, and counterexample claims;
- execute a finite trace without losing index/state details;
- justify a short-answer result with a concise reason, not a long proof.

## Dimension 3: Techniques Required

Score 0-2.

| Score | Standard |
| --- | --- |
| 0 | The technique is visible from keywords and can be executed mechanically. |
| 1 | The student must choose among two nearby techniques, e.g. product rule vs case split, direct trace vs invariant, or symmetry vs enumeration. |
| 2 | The student must select and combine techniques, and the wrong nearby technique gives a plausible distractor or wrong short-answer path. |

Technique checklist for CMI-style DM/DSA:

- case split with no overlap or omission;
- inclusion-exclusion or complement counting;
- pigeonhole threshold reasoning;
- induction with correct base/hypothesis/transition;
- relation/property verification using definitions and counterexamples;
- loop/recursion trace with exact index bounds;
- invariant for search, stack/queue, pointer/list, or string scan;
- worst-case, exact count, or asymptotic read when appropriate.

## Dimension 4: Level Of Analysis Required

Score 0-2.

| Score | Standard |
| --- | --- |
| 0 | Single-step answer; no justification reveals whether understanding is real. |
| 1 | Requires a short setup or two-step computation, but the solution path is still direct. |
| 2 | Requires analyzing a hidden condition, edge case, implication direction, all-correct multi-select option set, or counterexample; short-answer items require enough explanation to diagnose the first error. |

CMI-level analysis is compact, not advanced. A good item should feel solvable in a few minutes but punish:

- missing one valid MCQ option;
- selecting a tempting false universal statement;
- confusing ordered and unordered objects;
- ignoring equality, empty, first/last, or duplicate cases;
- reading pseudocode as intended behavior instead of actual behavior.

## Dimension 5: Speed And Time Pressure

Score 0-2.

| Score | Standard |
| --- | --- |
| 0 | Too slow, computationally bulky, or requires knowledge not supplied/covered. |
| 1 | Solvable but not speed-calibrated; likely takes too long because arithmetic or prose is heavy. |
| 2 | Calibrated for CMI pace: MCQ in about 2-4 minutes, short answer in about 4-7 minutes, with compact numbers and one main trap. |

For a 30-question, 120-minute Platinum review:

- 15 MCQ should average about 3 minutes each;
- 15 short-answer questions should average about 5 minutes each;
- reserve roughly 15 minutes for checking;
- avoid long arithmetic, large tables, or multi-page proofs.

## Dimension 6: Kind Of Reasoning Needed

Score 0-2.

| Score | Standard |
| --- | --- |
| 0 | Pure computation or pure memory. |
| 1 | Local reasoning: trace, substitute, or prove one small claim. |
| 2 | Aptitude-style reasoning: exact interpretation, elimination, counterexample, invariant, hidden condition, or transfer from a familiar object to a new surface form. |

CMI reasoning modes to include across a review:

- all-correct/no-incorrect option selection;
- concise proof or counterexample;
- finite-state or table reasoning;
- code-as-written tracing;
- invariant-based correctness;
- exact threshold or extremal reasoning;
- data/story interpretation translated into formulas.

## Pass Rule

Each question receives 0-2 on all six dimensions, total 12 points.

- CMI pass: at least 10/12 and no 0 in subject coverage, speed, or reasoning kind.
- Strong CMI pass: at least 11/12 and no 0 in any dimension.
- Regenerate a question if it fails CMI pass.
- For a full review quiz, at least 70% of questions should be strong CMI pass.

## Whole-Quiz Rubric

Score 0-2 for each quiz-level criterion.

| Criterion | 0 | 1 | 2 |
| --- | --- | --- | --- |
| Scope fidelity | Contains off-scope or future material. | Mostly covered scope, with weak anchoring. | Every question is anchored to assigned Platinum material. |
| Topic balance | One or two topics dominate unintentionally. | Required topics appear but difficulty is uneven. | Target topics are balanced by count, format, and difficulty. |
| CMI form fidelity | Uses ordinary single-answer school quiz format only. | Some CMI-like items, but inconsistent. | Uses multi-select MCQ behavior, short explanations, traps, and compact aptitude style. |
| Diagnostic value | Misses do not identify the learner's first error. | Broad topic diagnosis only. | Each question maps to a specific skill and mistake class. |
| Time realism | Too long or too easy for the time. | Mostly feasible. | Fits the stated time limit with realistic checking time. |

Whole-quiz pass: at least 8/10 and no 0.

## Required Metadata For Generated Questions

```json
{
  "source_block": "",
  "exam_target": "CMI-MSDS",
  "cmi_rubric_version": "cmi-msds-review-rubric-v1",
  "cmi_dimensions": {
    "subject_coverage": 0,
    "skills_required": 0,
    "techniques_required": 0,
    "analysis_level": 0,
    "speed": 0,
    "reasoning_kind": 0
  },
  "cmi_pass": false,
  "cmi_fit_rationale": "",
  "estimated_minutes": 0,
  "primary_trap": "",
  "expected_first_step": "",
  "mistake_tags": []
}
```

## Regeneration Rules

Regenerate or revise a question if:

- it uses a topic not yet covered in the Platinum source sequence;
- it can be answered by formula recall alone;
- it lacks a plausible CMI-style trap;
- it needs long arithmetic instead of reasoning;
- it has ambiguous wording, multiple unintended answers, or hidden assumptions;
- an MCQ is not compatible with all-correct/no-incorrect grading;
- a short-answer item does not ask for enough explanation to classify the mistake.
