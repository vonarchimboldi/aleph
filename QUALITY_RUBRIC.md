# Aleph Material Quality Rubric

This rubric is for judging generated Aleph review quizzes and standalone problem-set pages. It is separate from mechanical verification.

Mechanical verifiers answer: "is the artifact wired and structurally valid?"

The quality judge answers: "is the artifact likely to teach and diagnose well?"

## Standalone Pset Pages

Score each page out of 100.

| Dimension | Points | What Good Looks Like |
| --- | ---: | --- |
| Structure and workflow | 15 | Uses the shared material-page shell, has problem cards, complete solutions, answer summary, and the expected 5-3-2 progression for 10-problem sets. |
| Progression and diagnostic design | 20 | Starts with concept/mechanics builders, moves to applications, then ends with challenge, hidden-pattern, or ISI-style problems. Problems are not repetitive. |
| Solution completeness | 25 | Every solution identifies the method, sets up the quantities, performs the calculation, and states the final answer. Solutions are long enough to be useful without being padded. |
| Mathematical communication | 15 | Math uses KaTeX delimiters, named operators are formatted, raw dollar math is avoided, and important formulas are displayed clearly. |
| Learner accessibility | 10 | The page states the core pattern, uses direct language, defines symbols, and avoids terse proof phrases. |
| Feedback readiness | 15 | Tags and problem labels make it possible to diagnose the learner's weakness after a submitted solution. |

Recommended gate: page score at least 75, average pset score at least 80.

## Graph-Backed Review Quizzes

Score each graph-backed Basic Probability review quiz out of 100.

| Dimension | Points | What Good Looks Like |
| --- | ---: | --- |
| Review workflow mechanics | 20 | Quiz has a concept graph, per-question metadata, target concepts, prerequisites, difficulty, GATE weight, and repair material. |
| Diagnostic progression | 20 | Questions include direct checks and mixed-concept checks. A quiz may be short; the standard is progression, not a fixed question count. |
| Concept coverage | 20 | Target concepts and prerequisite concepts are represented in the graph and match the chapter's important ideas. |
| Feedback actionability | 20 | Graph nodes provide concrete repair material and next-quiz fallback rules. |
| Question quality | 20 | Prompts are clear, options are distinct, answers are objective, and distractors represent plausible mistakes. |

Recommended gate: quiz score at least 75, average quiz score at least 80.

## Platinum Probability/Statistics PSB Prep Material

Use this rubric for Priyanka's Platinum Probability and Statistics weekly PSB cycle. This is stricter than the generic page check because the weekly prep must train recurring exam patterns, not just present valid problems.

| Dimension | Points | What Good Looks Like |
| --- | ---: | --- |
| Weekly rotation and plan wiring | 15 | The active Platinum plan points to the correct Monday-Saturday source week, all six PSB topics have published material URLs, and Sunday has a subject-local review quiz. |
| Six-topic subject coverage | 15 | The week covers indicators, conditional expectation/tower, order statistics, MLE/estimation, UMP/NP tests, and regression/OLS exactly once in the daily cycle. |
| Daily pset structure | 15 | Each daily pset has 10 problems, complete worked solutions, 5 concept builders, 3 integration/application problems, and 2 hidden-pattern or ISI-style challenge problems. |
| PSB skill requirements | 20 | Each topic page explicitly trains its required moves: setup, recognition cue, prerequisite basics, method execution, and one hard or hidden transfer case. |
| Difficulty and exam calibration | 15 | Problems start from mechanics but end in compact ISI/PSB-style reasoning; the learner must identify the pattern before calculating. |
| Feedback readiness | 10 | Problems expose tags, common failure points, correction-note prompts, and workflow metadata sufficient for post-submission diagnosis. |
| Sunday review integrity | 10 | The weekly review contains one question per PSB topic, solutions remain locked until submission, and the weekly PSB feedback workflow is attached. |

Hard failures:

- Any daily PSB topic is missing from the active plan.
- A daily pset has fewer than 10 problems or lacks worked solutions.
- A Sunday review exposes solution details before submission.
- A topic page omits the core setup skill for that pattern.

Run:

```bash
node scripts/verify-platinum-psb-material.mjs
node scripts/judge-material-quality.mjs
```

The PSB verifier is deterministic. It checks the currently wired Platinum source Week 3 material and should be extended when the active PSB source week advances.

## Current Judge

Run:

```bash
node scripts/judge-material-quality.mjs
```

The judge is deterministic and heuristic. It is intentionally conservative about structural evidence and cannot prove mathematical truth. A passing score means the artifact has the expected teaching and diagnostic signals; it does not replace human review of mathematical correctness.
