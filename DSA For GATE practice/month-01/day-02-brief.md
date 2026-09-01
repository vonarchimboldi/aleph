# Daily Module Brief

## Identity

- Month: 1 — Searching, Sorting, and Array Reasoning
- Week: 1
- Day: 2
- Date: 2026-09-01
- Topic: Binary search and boundaries
- Language: C++17
- Duration: 120 minutes

## Learning target

- Central question: When a sorted array divides into a false region followed by a true region, how do we find the boundary without off-by-one errors?
- Prerequisites: sorted arrays, indices, comparisons, loops, `O(log n)`, Day 1 binary-search exposure
- New pattern or idea: exact search as interval elimination; lower and upper bounds as first-true searches
- Intended depth: undergraduate implementation fluency with closed and half-open intervals, duplicates, missing targets, and proof-quality invariants
- Success criterion: independently implement exact search, lower bound, upper bound, and first/last occurrence and justify every update

## Guided discovery

- Motivating problem: maintain and query a sorted student-ID index containing duplicates
- Naive approach: linear scan for every query
- Limitation to expose: repeated queries ignore sorted order and cost `O(n)` each
- New state representation: an active search interval and a monotone predicate over positions
- Core invariant: lower bound keeps all indices before `low` strictly below target and all indices at or after `high` greater than or equal to target
- Correctness argument: each comparison discards a region that cannot contain the first valid index; termination at `low == high` identifies the boundary
- Target complexity: `O(log n)` time and `O(1)` auxiliary space
- Important implementation details: overflow-safe midpoint, progress on every branch, `high = n` for half-open search, validity check before indexing, never mix interval conventions
- Likely misconceptions: returning any duplicate, treating `n` as an invalid insertion result, using `low = mid`, scanning outward after finding one duplicate, mixing `[low,high]` with `[low,high)`
- Essential trace cases: empty array, one item found/missing, target before all, after all, duplicate run, absent value between two values

## Coding Lab A: direct application

- LeetCode number/title: 704 — Binary Search
- Official URL: https://leetcode.com/problems/binary-search/
- Why selected: direct exact-search implementation with a visible sorted structure
- Pattern evidence: comparison with the middle eliminates an entire half
- Invariant: if the target exists and is not yet found, it remains inside the closed active interval
- Expected complexity: `O(log n)` time, `O(1)` space
- Progressive hints: define the interval; use an overflow-safe midpoint; make both updates exclude `mid`
- Post-attempt questions: which condition represents an empty interval; why do both branches make progress; what changes for half-open search

## Coding Lab B: implementation variation

- LeetCode number/title: 35 — Search Insert Position
- Official URL: https://leetcode.com/problems/search-insert-position/description/
- Dimension changed: return a boundary even when equality is absent
- Why selected: reveals lower bound as a more general form of binary search
- Invariant: indices before `low` are below target; indices at or after `high` are valid insertion candidates
- Expected complexity: `O(log n)` time, `O(1)` space
- Progressive hints: allow `high = n`; ask whether `a[mid]` is too small; return the meeting point
- Post-attempt questions: why can the answer equal `n`; why is a second scan unnecessary; how would duplicates change the contract

## Coding Lab C: transfer

- LeetCode number/title: 34 — Find First and Last Position of Element in Sorted Array
- Official URL: https://leetcode.com/problems/find-first-and-last-position-of-element-in-sorted-array/description/
- Representation changed: one target corresponds to a contiguous run rather than one desired index
- Why selected: composes two boundary searches and requires duplicate-aware reasoning
- Tempting wrong approach: find one copy and scan left/right, degrading to `O(n)`
- Invariant: lower bound finds first `>= target`; upper bound finds first `> target`
- Expected complexity: `O(log n)` time, `O(1)` auxiliary space
- Progressive hints: write two helpers; verify lower-bound position before indexing; return `[lower, upper-1]`
- Post-attempt questions: why are two searches still logarithmic; how do bounds give the count; what result represents absence

## Review and adaptation

- Exit-ticket questions: state both invariants; explain `<` versus `<=`; explain why `n` is valid; identify an infinite-loop update
- Evidence to record: interval convention, first wrong update, duplicate handling, empty-range behavior, complexity explanation
- Repair trigger: inability to trace termination or mixing inclusive/exclusive endpoints
- Candidate near-transfer drill: count occurrences using `upperBound - lowerBound`
- Connection to tomorrow: ordered boundaries support two-pointer elimination and duplicate skipping
