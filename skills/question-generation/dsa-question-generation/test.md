# Test

## Trigger Request

“Generate a CMI-level DSA review quiz for the Platinum plan covering lists, stacks, queues, complexity, arrays, search, recursion, strings, and sorting.”

## Expected Loading Behavior

This skill should load for DSA question generation, quiz creation, drill generation, or review-set design for Priyanka's Platinum plan.

## Verification Procedure

Check that the generated questions:

1. Use only topics from the Platinum DSA sequence.
2. Name the source course block or week for each question.
3. Avoid future topics unless explicitly requested.
4. Include difficulty, target skill, expected first step or invariant, and common mistake tag.
5. For CMI requests, load `../cmi-msds-review-rubric.md`, include six-dimension CMI rubric scores, and regenerate any item that fails the CMI pass rule.
6. Keep solutions separate if the quiz is locked until submission.

## Expected Result

The question set is source-anchored to Aho/Ullman FOCS and/or Cartesian and stays within the requested covered scope.
