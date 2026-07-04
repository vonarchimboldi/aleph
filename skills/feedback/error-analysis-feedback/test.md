# Test

## Trigger Request

“Analyze this learner’s quiz attempt, classify each mistake, and suggest targeted remedies.”

## Expected Loading Behavior

The skill loads for feedback reports, quiz reviews, submitted-solution analysis, and requests that ask for mistake categories, error analysis, or remedies.

## Verification Procedure

Given a learner attempt with one wrong combinatorics setup, one arithmetic slip, and one missing edge case, the feedback should:

1. Use distinct labels from `SKILL.md`.
2. Explain the first wrong step for each issue.
3. Suggest a concrete remedy and next drill for each issue.
4. Avoid generic advice such as “be careful” without a success criterion.

## Expected Result

The output contains a mistake table with `setup-modeling` or `case-coverage`, `calculation-algebra`, and `edge-case-boundary`, plus targeted review/drill/success criteria for each.
