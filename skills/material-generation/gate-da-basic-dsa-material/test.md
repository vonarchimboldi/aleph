# Test

## Trigger Request

"Generate GATE DA Basic DSA Chapter 2 material using MIT algorithms, CS 61B, Stanford CS106X, Open Data Structures, and Jeff Erickson as sources."

## Expected Loading Behavior

This skill should load for DSA Basic chapter generation, source-mining for DSA examples, end-of-chapter problem design, or GATE DA DSA material review.

The agent should read:

1. `SKILL.md`
2. `references/source-map.md`

## Verification Procedure

Check that the generated material:

1. Names at least two source families used.
2. Extracts examples/ideas without copying source problem text.
3. Builds a chapter around concrete traces, state, invariants, and GATE DA exam moves.
4. Includes end-of-chapter problems covering concept recognition, trace discipline, complexity, invariant/correctness, edge cases, and exam transfer.
5. Provides question metadata for feedback: source ideas, GATE DA skill, target concept, prerequisites, expected first step, common mistake, and answer check.
6. Keeps advanced or off-scope source material out of the Basic chapter unless explicitly marked as enrichment.
7. Shows that the mandatory two-pass generation pipeline was followed: skill lookup, source/tool lookup, source extraction, Pass 1 content generation, Pass 1 verifier, Pass 2 practice generation, Pass 2 solution verifier, and submit gate.
8. Verifies Pass 1 content before final practice generation: runtime complexity, space complexity, invariants, canonical applications, original tricky examples, and learner-facing simulation practice must all be present.
9. Scores at least 25/30 on the deep-learning rubric, with every dimension at least 2 and solution correctness at 3 after Pass 2.
10. Verifies every generated problem with an independently derived solution, at least one standard case, and at least one edge or trap case when applicable.
11. Regenerates or revises any failed problem, solution, metadata field, or missing rubric dimension before submission.

Reject the output if:

- a problem is copied from a source or a LeetCode prompt;
- a problem has no checkable solution;
- an objective question has ambiguous answer choices;
- the chapter teaches implementation mechanics without invariant, complexity, and transfer reasoning;
- simulation practice is absent;
- practice problems are generated before the content verifier passes;
- final material is submitted before the solution verifier passes.

## Expected Result

The generated chapter is source-informed, original, GATE DA aligned, and ready to wire into Aleph's Basic DSA subject with review feedback metadata.
