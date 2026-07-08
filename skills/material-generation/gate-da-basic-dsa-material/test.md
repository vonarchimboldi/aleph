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

## Expected Result

The generated chapter is source-informed, original, GATE DA aligned, and ready to wire into Aleph's Basic DSA subject with review feedback metadata.
