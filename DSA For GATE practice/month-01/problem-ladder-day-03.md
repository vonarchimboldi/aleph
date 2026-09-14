# DSA Problem Ladder — Day 3

## Wednesday — Hard: derive a solution from familiar parts

September 16, 2026 | Priyanka | 120 minutes | C11 or Python 3


Central question: can a routine compute more than its obvious output, or search an answer that is not stored in an array?

1. **Count out-of-order pairs.** For up to 200,000 integers, count pairs `i < j` with `a[i] > a[j]`. Equal values do not count. Require O(n log n) time and at most O(n) auxiliary space. Example: `[3,1,2,1] → 4`. Start with a small brute-force checker; explain how the faster algorithm counts every pair exactly once. Use a 64-bit count in C.
2. **Smallest daily capacity.** Positive integer parcel weights must be shipped in their given order over at most D nonempty days, where `1 <= D <= n`. Each day's parcels form a contiguous block. Find the smallest integer capacity allowing all parcels to ship. Require O(n log(S+1)) time, where S is the sum of weights, and O(1) auxiliary space. Example: `[3,2,2,4,1,4]`, D=3 gives 6. Include D=1, D=n, and one dominant weight; use wide sums in C.

## Session rules

- Minutes 0–10: closed-notes recall of one invariant and an edge case from the previous session (Monday: last week's boundary search).
- Minutes 10–110: solve today's queue in order. Check time after roughly 25 minutes per problem on easy days, 33 on medium days, and 50 on Wednesday. Unused time transfers forward; the queue is not a quota.
- Minutes 110–120: stop coding, record results, and explain one failed assumption and its correction. Mark unfinished work partial at the cutoff.
- Use C11 OR Python 3 consistently throughout the timed week. Translation is optional and does not count as another solve.
- Before coding, state a direct approach, its cost, and what property might remove work. After coding, give a correctness argument, time/space costs, and normal, boundary, and adversarial tests.
- After 15 minutes without a useful new step, write the blocker and choose to continue, request a small hint, or park the problem. Record hints; keep complete solutions closed during the attempt.

Count a solve only when working code meets the stated constraints, passes checks, and you can explain why it works. Separate independent and assisted solves. A correct slow baseline is partial if it misses the required bound. Testing time counts toward the session. If finished early, improve tests and proofs without increasing the solved count.

## Attempt record

For each problem, submit its number, minutes spent, independent/assisted/partial/parked status, hints used, code, test results, invariant, and time/space analysis. Keep the same language throughout the timed week.

At 120 minutes record: attempted __; independently solved __; assisted solves __; partial __.

Exit ticket: Which assumption or boundary was hardest? Give one smallest failing example and explain your correction. Counts are evidence of this session, not a quota.
