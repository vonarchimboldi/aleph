# Five-day sorting and patterns sprint: production brief

## Shared decisions

- Approved in conversation: six sorts (bubble, selection, insertion, merge, quick, heap); two pointers, fast/slow pointers, fixed and variable sliding windows, binary search.
- Five production passes, one complete daily module per pass. Publish all five together.
- Dates: September 7-11, 2026, the next Monday-Friday block. New sprint labels preserve the existing Month 1 Day 1/2 archive.
- Languages: C11 and Python 3, overriding the usual C++17 default.
- Duration: exactly 120 minutes per day, including practice and review. Reference implementations are post-attempt scaffolding; adapt an existing harness instead of spending session time on input/output plumbing.
- The instructor-approved exercises replace the usual three new LeetCode selections, especially on the dedicated runtime-analysis day. All problem statements here are original. No extra problem quota is added to the two-hour budget.
- Prerequisites: arrays, loops, functions, elementary recursion, C pointers/structs, basic Python lists/classes. Day 4 supplies the node representation.
- Workflow: read the task, trace a small example, state the invariant, attempt the implementation, then consult the separately paginated solution appendix. Translate the core function to the other language; use reference code to correct unfinished work within its assigned block.

## Pass 1 / September 7: elementary sorts and two pointers

- Central question: what does each processed region promise?
- Motivation: sort duplicate-bearing scores and find a target pair without all-pairs enumeration.
- State: sorted prefix/suffix, scan boundary, output write boundary.
- Labs: A three sort implementations; B distinct-index pair sum; C in-place unique compaction.
- Invariants: final sorted suffix; smallest sorted prefix; sorted insertion prefix; surviving pair interval; unique output prefix.
- Traces: [5,2,4,2,1], empty/singleton, [2,2], absent target.
- Complexity: compare comparisons and writes; pointer scans O(n), O(1) workspace.
- Misconceptions: sorted prefix alone proves selection; self-pairing; overwriting unread elements; unsigned underflow.
- Hints: identify final positions; discard using order; write only behind the reader.
- Exit: prove one pointer move and explain stability. Repair: duplicate-heavy compaction trace.

## Pass 2 / September 8: why runtimes differ

- Central question: which input arrangements reduce executed work?
- Motivation: three sorts share a quadratic worst case but differ on ordered data.
- Labs: A exact counts; B inversions and asymmetric bubble passes; C aggregate pointer work and fixed windows.
- Invariant: counters count executed key comparisons/shifts, not inferred theoretical work; window sum equals its interval.
- Complexity: Theta(n+I) insertion, Theta(n^2) selection, optimized bubble best Theta(n); aggregate window O(n).
- Traces: ordered/reversed, [n,1,...,n-1] versus [2,...,n,1], all-negative window.
- Hints: specify the counted operation; sum actual loop bounds; count each pointer's total advances.
- Exit: best case is a minimum over inputs of fixed size, not another name for Omega. Repair: instrument n=4 first.

## Pass 3 / September 9: merge, partition, variable windows

- Central question: how do local region promises compose into global correctness?
- Labs: A merge sort; B Lomuto quicksort; C shortest positive-sum window.
- State/invariants: two sorted runs, partition regions, exact window sum.
- Complexity: merge Theta(n log n), O(n) buffer; quick balanced/average versus quadratic worst case; window O(n).
- Traces: odd sizes, equal keys, sorted quicksort, [2,3,1,2,4,3] target 7, negative counterexample.
- Misconceptions: mixing endpoint conventions; pivot retained in recursion; shrinking only once.
- Exit: derive the two quicksort recurrences and show why positivity matters. Repair: single partition trace.

## Pass 4 / September 10: heap and fast/slow

- Central question: what structural information can an array or two pointers encode?
- Labs: A heap build/sort; B second middle and cycle detection; C cycle entry trace and implementation repair.
- State/invariants: heap children already repaired; sorted suffix; relative pointer displacement modulo cycle length.
- Complexity: bottom-up heap construction O(n), sorting worst Theta(n log n), O(1) iterative workspace; lists O(n), O(1).
- Traces: one-child node, all equal, [4,10,3,5,1], null head, self-cycle, cycle after a prefix.
- Misconceptions: building a heap sorts it; heap build must cost n log n; unsafe fast.next.next.
- Exit: height-weighted heap sum and cycle meeting argument. Repair: two-node trace.

## Pass 5 / September 11: boundaries and integration

- Central question: what proves discarded candidates cannot contain the answer?
- Labs: A lower/upper bound and frequency; B integer square root; C unique 3Sum using earlier heapsort.
- State/invariants: eliminated false/true regions; feasible sqrt prefix; remaining pair interval.
- Complexity: O(log n) bounds, O(log(N+1)) root, O(n^2) 3Sum plus output; all six sorts compared.
- Traces: []/[2,2,2], absent target, N=0/1/8/9/INT_MAX, [-1,0,1,2,-1,-4].
- Misconceptions: indexing n; lo=mid nonprogress; multiplication overflow; duplicate triplets.
- Exit: code-independent correctness explanation and full complexity table. Repair: trace every update on length two.

## Publication and evidence

Publish in Priyanka's Platinum -> DSA Special Prep as a dedicated five-day workspace, plus Resources, Tasks, and Schedule. Attach the existing code-submission/feedback flow with day-specific skill tags. Preserve previous materials and user progress. Verify C and Python algorithms with deterministic edge cases and cross-checks, inspect rendered PDFs, check app syntax and seed wiring, deploy, and verify live files.
