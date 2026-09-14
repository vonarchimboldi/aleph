# DSA Problem Ladder — Day 5

## Friday — Easy: accuracy after difficulty

September 18, 2026 | Priyanka | 120 minutes | C11 or Python 3


Central question: can you now give a precise explanation quickly?

1. **Keep at most two copies.** Compact a sorted array in place so each distinct value appears at most twice. Return the retained length; the prefix must remain sorted. Require O(n) time and O(1) space. Example: `[1,1,1,2,2,3] → length 5, prefix [1,1,2,2,3]`.
2. **Insertion boundary.** Return the first index with value at least x in a sorted array, or n if none exists. Require O(log n) time without library search. Trace empty input, an all-equal array, and a target beyond both ends.
3. **Count values in a range.** Given sorted integers and L <= R, return the number of entries in the inclusive range `[L,R]`, in O(log n) time. Duplicates count separately. Explain the two boundaries; do not compute `R+1`, which can overflow in C.
4. **One missing label.** A strictly increasing array of length n contains all but one of the integers from 0 through n. Return the missing label in O(log(n+1)) time and O(1) space. Examples: `[] → 0`, `[0,1,3] → 2`, `[0,1,2] → 3`. State the monotone predicate before coding.

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
