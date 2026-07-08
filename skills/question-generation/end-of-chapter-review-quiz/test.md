# Test

## Trigger Request

"Generate an end-of-chapter objective review quiz for DSA Chapter 2 using one-topic, two-topic, and three-topic sampling from the concept graph."

## Expected Loading Behavior

This skill should load for end-of-chapter review quizzes, graph-backed objective reviews, diagnostic quiz plans, or requests to sample one-, two-, and three-topic review items.

If the quiz is subject-specific, the agent should also load the relevant subject skill before generating questions.

## Verification Procedure

Check that the generated quiz:

1. Builds a topic plan before generating questions.
2. Uses the sampler tool or an equivalent deterministic one/two/three-topic sampling procedure.
3. Includes the requested mix of single-topic, two-topic, and three-topic questions.
4. Gives every question concept tags, prerequisite metadata, expected first step, common mistake, and answer check.
5. Contains at least one prerequisite check, one trace/simulation or invariant item when relevant, and one mixed exam-transfer item.
6. Verifies every solution and objective answer choice.
7. Maps every possible miss to concept-graph repair material.

## Expected Result

The quiz is graph-backed, diagnostically useful, and ready to wire into Aleph's review feedback workflow.
