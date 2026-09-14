# Priyanka's DSA problem ladder — September 14–18, 2026

Approved for publication by the instructor. Five sessions of exactly 120 minutes; easy → medium → hard → medium → easy. Scheduled for the Monday–Friday block after the September 7–11 sprint. Difficulty is relative to that sprint, not an official platform rating. These are original practice prompts, not GATE past-paper questions.

## Purpose and session rules

Move from implementing named patterns to deciding which structure makes a solution possible. Prerequisites are last week's sorting, merge steps, two pointers, array bounds, and integer-answer binary search. Wednesday extends those tools; it does not assume a new data structure.

- Minutes 0–10: closed-notes retrieval. Explain one invariant and trace an edge case from the previous session (Monday: last week's boundary search).
- Minutes 10–110: work through the day's queue in order. Four problems on easy days, three on medium days, two on the hard day. These are available problems, not completion quotas. Check the clock after roughly 25, 33, or 50 minutes per problem, respectively; unused time transfers to the next problem.
- Minutes 110–120: stop coding, log results, and explain the first failed assumption and one correction. Unfinished problems remain unfinished at the cutoff.
- Measurement convention: use either C11 or Python 3 consistently for the timed week. Translating into the other language is optional and is not a second solved problem. If both languages are required, keep the same time limit and expect a smaller count.
- Before coding: state a direct approach, what makes it expensive, and the property that might remove work. After coding: provide a correctness argument, runtime and auxiliary space, and normal, boundary, and adversarial tests.
- After 15 minutes without a new useful step, write the blocker and choose to continue, request a small hint, or park the problem. Record any hint. Do not open a full solution during the measured attempt.

A problem counts as solved only when the implementation meets the stated constraint, passes the agreed checks, and Priyanka can explain why it works. Record independent and hint-assisted solves separately. An idea without working code is partial progress. A failed faster approach with a correct brute-force baseline is valuable evidence, but does not meet a faster required bound.

## Monday — Easy: preserve order and define the output

Central question: what does the processed part of the array promise?

1. **Stable zero move.** Move all zeroes to the end of an integer array in place, preserving the relative order of nonzero entries. Require O(n) time and O(1) auxiliary space. Example: `[0,3,0,-1,3] → [3,-1,3,0,0]`.
2. **Merge two sorted arrays.** Return one sorted array containing every occurrence from both inputs. Inputs may be empty and contain duplicates; do not call a sorting function. Require O(n+m) time; output storage is allowed.
3. **Common values, once each.** Given two sorted arrays, return their common values in increasing order without duplicates. Require O(n+m) time and O(1) auxiliary space excluding output. Example: `[1,1,2,4]` and `[1,1,3,4,4] → [1,4]`.
4. **Sorted squares.** Given sorted integers, return their squares in sorted order in O(n) time, with output storage allowed. Example: `[-5,-2,0,3] → [0,4,9,25]`. Values have absolute value at most 10,000.

Instructor checks: read/write and merge invariants; empty/all-zero inputs; unequal lengths; duplicate runs; negative values. Ask why squaring preserves order on only part of the input.

## Tuesday — Medium: decide what can be discarded

Central question: what proves that skipping candidates is safe?

1. **Merge reservations.** Given unsorted closed intervals `[start,end]` with `start <= end`, return their union as sorted, non-overlapping intervals. Touching endpoints merge. Handle empty input, nesting, and equal starts. Require O(n log n) time.
2. **Count pairs below a limit.** Given an unsorted integer array and T, count index pairs `i < j` whose sum is strictly less than T. Equal values at different indices are different pairs. Require O(n log n) time; sorting a copy is allowed. Example: `[1,1,2,3]`, T=4 gives 4. Use a wide count type in C.
3. **Search after rotation.** An array of distinct increasing integers was rotated an unknown number of positions. Return the index of a given target, or -1. Require O(log n) time and O(1) space. Include empty, singleton, unrotated, and absent-target cases. Follow-up only: which inference fails if duplicates are allowed?

Instructor checks: maintained merged union; why an entire block of pairs can be counted at once; identifying a sorted half without discarding the target. Expected first mistakes: endpoint ties, counting values instead of index pairs, and an incorrect retained search interval.

## Wednesday — Hard: derive a solution from familiar parts

Central question: can a routine compute more than its obvious output, or search an answer that is not stored in an array?

1. **Count out-of-order pairs.** For up to 200,000 integers, count pairs `i < j` with `a[i] > a[j]`. Equal values do not count. Require O(n log n) time and at most O(n) auxiliary space. Example: `[3,1,2,1] → 4`. Start with a small brute-force checker; explain how the faster algorithm counts every pair exactly once. Use a 64-bit count in C.
2. **Smallest daily capacity.** Positive integer parcel weights must be shipped in their given order over at most D nonempty days, where `1 <= D <= n`. Each day's parcels form a contiguous block. Find the smallest integer capacity allowing all parcels to ship. Require O(n log(S+1)) time, where S is the sum of weights, and O(1) auxiliary space. Example: `[3,2,2,4,1,4]`, D=3 gives 6. Include D=1, D=n, and one dominant weight; use wide sums in C.

Instructor checks: counting cross-half inversions inside a merge; strict versus non-strict comparisons; why greedy packing tests feasibility; why feasibility is monotone; search bounds and termination. Hints should reveal one question at a time, not the full algorithm. One well-justified independent solve is a useful result on this day.

## Thursday — Medium: transfer and repair

Central question: can the same reasoning survive a changed output or story?

1. **Daily capacity checker.** Given ordered positive parcel weights and a proposed capacity C, return the minimum number of contiguous shipping days needed, or -1 if any parcel exceeds C. Require O(n) time and O(1) space. Justify why a locally full day cannot increase the minimum number of days. This deliberately isolates Wednesday's difficult subproblem.
2. **Smallest processing speed.** Positive integer pile sizes must be processed in at most H hours, with H at least the number of piles. At speed k, a pile takes `ceil(size/k)` hours; unfinished hours cannot be shared between piles. Find the smallest positive integer k. Require O(n log(M+1)) time, M being the largest pile. Example: `[3,6,7,11]`, H=8 gives 4. Explain how this feasibility test differs from shipping.
3. **Closest pair sum.** Given at least two unsorted integers and target T, return a pair of values at distinct indices minimizing the absolute difference between their sum and T. Any optimal pair is accepted. Require O(n log n) time; sorting a copy is allowed. Explain why your pointer movement cannot miss a better pair. Include duplicates and targets outside the possible sum range.

Instructor checks: recover the invariant without copying yesterday's code; integer ceiling arithmetic; a proof for the closest-sum pointer move. If Wednesday needed a hint, identify whether today's solve was independent after that instruction; do not describe it as first-exposure mastery.

## Friday — Easy: accuracy after difficulty

Central question: can you now give a precise explanation quickly?

1. **Keep at most two copies.** Compact a sorted array in place so each distinct value appears at most twice. Return the retained length; the prefix must remain sorted. Require O(n) time and O(1) space. Example: `[1,1,1,2,2,3] → length 5, prefix [1,1,2,2,3]`.
2. **Insertion boundary.** Return the first index with value at least x in a sorted array, or n if none exists. Require O(log n) time without library search. Trace empty input, an all-equal array, and a target beyond both ends.
3. **Count values in a range.** Given sorted integers and L <= R, return the number of entries in the inclusive range `[L,R]`, in O(log n) time. Duplicates count separately. Explain the two boundaries; do not compute `R+1`, which can overflow in C.
4. **One missing label.** A strictly increasing array of length n contains all but one of the integers from 0 through n. Return the missing label in O(log(n+1)) time and O(1) space. Examples: `[] → 0`, `[0,1,3] → 2`, `[0,1,2] → 3`. State the monotone predicate before coding.

Instructor checks: output-prefix invariant; boundary conventions; duplicate counts; why value versus index identifies the missing-label boundary. These are deliberate retrieval and small transfer tasks, intended to consolidate the week's reasoning.

## Results sheet

For each attempted problem record: ID, start/end minute, independent/assisted/partial/parked, hints used, failed test, and one-sentence invariant. Include testing time in the problem's time.

| Session | Available | Attempted | Independent solves | Assisted solves | Partial | Main blocker |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| Monday, easy | 4 | | | | | |
| Tuesday, medium | 3 | | | | | |
| Wednesday, hard | 2 | | | | | |
| Thursday, medium | 3 | | | | | |
| Friday, easy | 4 | | | | | |
| Total | 16 | | | | | |

Do not infer an expected score from the queue size: we have not reviewed new submission evidence for this week. Report the actual count alongside difficulty, assistance, explanation quality, and time. If the entire queue is completed early, use remaining time for adversarial tests and proof repair. Those extensions do not inflate the solved count. Carry the most consequential unresolved idea into the next week's opening repair problem.
