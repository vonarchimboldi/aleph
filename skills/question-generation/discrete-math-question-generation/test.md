# Test

## Trigger Request

“Generate a CMI-level Discrete Math review quiz for the Platinum plan covering Week 1 and already completed June topics.”

## Expected Loading Behavior

This skill should load for Discrete Math question generation, quiz creation, drill generation, or review-set design for Priyanka's Platinum plan.

## Verification Procedure

Check that the generated questions:

1. Use only topics from the Platinum Discrete Math sequence.
2. Name the source course block or week for each question.
3. Avoid future topics unless explicitly requested.
4. Include difficulty, target skill, expected first step, and common mistake tag.
5. Include exam-level rubric scores and regenerate any item that fails the pass rule.
6. Keep solutions separate if the quiz is locked until submission.

## Expected Result

The question set is source-anchored to CMU 21-228, MIT 6.1200J, and/or MIT 18.200 and stays within the requested covered scope.
