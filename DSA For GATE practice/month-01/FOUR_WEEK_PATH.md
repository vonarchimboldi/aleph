# Month 1: Four-Week Guided Exploration Path

## Design principle

The month is organized around discoveries made while coding. A session begins with a problem that is easy to state but awkward to solve with the learner's current tools. The learner first writes a direct solution, observes its repeated work or broken invariant, and then earns the new technique as a response to that limitation.

Each weekday is a two-hour session with one guided problem and two independent transfer problems. Saturday and Sunday each contain one two-hour interview mock. Exact problem selections should be finalized shortly before the session so they can incorporate the learner's recent mistakes.

## Week 1: From unordered data to monotone search

### Monday — What does ordering buy us?

Running problem: Target Pair.

Discover brute force, indexed sorting, binary search for complements, opposite-direction two pointers, hashing, duplicate handling, loop invariants, and complexity tradeoffs. Preview fast/slow pointers and sliding windows so the learner sees that similar-looking pointer code can preserve different invariants.

### Tuesday — Binary search is an invariant, not a template

Start from exact search, then change the output requirement to insertion position, first occurrence, last occurrence, and first value satisfying a predicate. Develop half-open and closed interval conventions through traces. Practice empty ranges, duplicates, not-found results, and overflow-safe midpoint calculation.

Discovery: changing the question from “is it present?” to “where does the true region begin?” produces lower-bound reasoning.

### Wednesday — Two pointers as elimination proofs

Move from exact pair sum to closest pair, all unique pairs, sorted squares, and three-sum structure. Require a written statement of what each pointer movement eliminates. Contrast opposite-direction pointers with same-direction merge scans.

Discovery: pointer movement is correct only when order creates a monotone consequence.

### Thursday — Fast/slow pointers as in-place structure

Use duplicate removal, stable filtering, moving zeroes, and partition-like compaction. Make the learner define the processed prefix before writing code. Briefly preview linked-list middle and cycle detection without making linked lists the main topic yet.

Discovery: the slow pointer marks the output boundary while the fast pointer explores input.

### Friday — Sliding windows preserve original order

Begin with fixed-length maximum sum, then derive variable windows for a positive-number target and character-frequency constraints. Use a counterexample with negative numbers to show when sum-based window monotonicity breaks.

Discovery: sorting can destroy exactly the contiguity information a window problem needs.

### Weekend mocks

- Saturday: exact search/bounds, pair reasoning, and one fixed-window problem.
- Sunday: new representations of the same skills, followed by a correction session organized by invariant failures.

## Week 2: Build comparison sorting from first principles

### Monday — Insertion and selection: local invariants

Implement insertion sort and selection sort. Compare the sorted-prefix invariant, writes versus comparisons, adaptivity, and behavior on sorted, reversed, and nearly sorted inputs.

Discovery: two quadratic algorithms can have meaningfully different operational behavior.

### Tuesday — Merge sort: divide, solve, combine

Derive merge sort from merging two sorted lists. Trace recursion, prove the merge invariant, count auxiliary space, and discuss stability. Include inversion counting as the first application of modifying the merge step.

Discovery: a combine operation can compute additional global information almost for free.

### Wednesday — Quicksort and partitioning

Implement Lomuto and/or Hoare-style partitioning only after defining the regions maintained around the pivot. Explore pivot choice, equal keys, worst-case inputs, randomized pivots, recursion depth, and tail-recursion considerations.

Discovery: partitioning is more fundamental than quicksort and will later support selection.

### Thursday — Heapsort and the meaning of in-place

Build a binary heap in an array, derive child/parent indices, implement sift-down, and use repeated extraction to sort. Compare worst-case guarantees, cache behavior, stability, and memory with merge sort and quicksort.

Discovery: an array can encode a tree whose invariant supports repeated extremum removal.

### Friday — Comparison lower bounds and choosing a sort

Use decision-tree reasoning to motivate the `Omega(n log n)` comparison bound. Compare insertion, merge, quick, and heap sort by stability, adaptivity, auxiliary space, worst-case behavior, and data representation. Include comparator correctness and multi-key sorting.

Discovery: “fastest sorting algorithm” is not a complete question.

### Weekend mocks

- Saturday: implement one sorting primitive plus an application such as inversion counting or interval ordering.
- Sunday: debugging mock with a subtly incorrect comparator, partition loop, or merge boundary.

## Week 3: Sorting as a problem-solving transformation

### Monday — Intervals and event ordering

Practice merging intervals, inserting an interval, meeting-room overlap, and event sweeps. Convert interval endpoints into ordered events and discuss tie-breaking when starts and ends coincide.

Discovery: sorting converts a two-dimensional overlap problem into a one-dimensional scan.

### Tuesday — Selection and partial order

Move from full sorting to kth-element questions. Derive quickselect from partitioning, compare it with heaps and full sorting, and discuss average versus worst-case guarantees. Include top-k and median-style tasks.

Discovery: if only one rank is needed, constructing the entire sorted order may be unnecessary.

### Wednesday — Counting, radix, and bounded universes

Implement counting sort and reason about key range, stability, prefix positions, and memory. Build radix sorting from a stable digit pass. Contrast comparison and non-comparison models.

Discovery: the comparison lower bound applies only when comparisons are the sole source of key information.

### Thursday — Prefix sums and difference arrays

Use repeated range-sum queries to motivate prefix preprocessing. Reverse the idea with difference arrays for repeated range updates. Include coordinate compression as a sorting-based bridge when values are large but only relative order matters.

Discovery: preprocessing changes the cost distribution between setup and queries.

### Friday — Canonical order, grouping, and repeated queries

Use anagram grouping, duplicate runs, frequency blocks, multi-query pair problems, and coordinate compression. Discuss stable multi-key records and why databases maintain indexes rather than sorting from scratch for every query.

Discovery: sorting often creates a canonical representation that makes equality and grouping easy to test.

### Weekend mocks

- Saturday: interval/sweep problem, kth-selection problem, and one prior-week search problem.
- Sunday: mixed representation mock requiring the learner to decide whether full sort, partial order, prefix preprocessing, or hashing is justified.

## Week 4: Search over answers and cumulative synthesis

### Monday — Binary search on a monotone answer

Begin with a slow feasibility-check problem. Identify a candidate answer space, prove the feasibility predicate is monotone, and binary-search the boundary. Practice capacity, minimum-speed, and allocation-style problems.

Discovery: binary search can search an abstract answer space, not only an array.

### Tuesday — Search in transformed sorted structures

Practice rotated arrays, matrices with sorted structure, peaks, and implicit order. Require the learner to identify which half or dimension remains informative after each comparison.

Discovery: useful order may survive even when the representation is partially transformed.

### Wednesday — Advanced windows and frequency state

Practice at-most/exactly-k relationships, longest valid windows, minimum covering windows, and monotonic deques for window extrema. Contrast ordinary windows with prefix-sum plus hash-map techniques when negative values break monotonicity.

Discovery: the window state must contain exactly enough information to decide expansion and contraction.

### Thursday — Systems view of sorting

Explore external merge sort, streaming limitations, stable records, database indexes, and why standard libraries use hybrids. This is an undergraduate-level design session supported by small coding tasks such as merging sorted chunks and validating comparators.

Discovery: memory hierarchy and workload shape matter as much as asymptotic comparison counts.

### Friday — Cumulative decision lab

Give a collection of unlabeled problems. Before coding, the learner must choose among linear scan, hashing, sorting, binary search, two pointers, fast/slow pointers, sliding window, prefix sums, heap/selection, interval sweep, or binary search on answers. Require an invariant, complexity target, and counterexample to one tempting wrong approach.

Discovery: pattern recognition means recognizing structural evidence, not matching keywords.

### Final weekend mocks

- Saturday: full two-hour Month 1 interview simulation with three mixed problems.
- Sunday: transfer mock using unfamiliar stories, followed by a month-end mastery review and a repair list for Month 2.

## Difficulty progression

1. Direct implementation with visible structure.
2. Boundary and duplicate variations.
3. Same pattern in a different representation.
4. Mixed problems where the pattern is not named.
5. Timed selection among competing approaches.

Difficulty should rise through changes in constraints and representation, not through sudden reliance on unrelated tricks.

## Day 2 planning target

Select three coding problems that jointly reveal:

1. exact binary search with a clean invariant;
2. lower-bound or insertion-position reasoning;
3. duplicate-aware first/last boundary search.

The guided problem should be implemented before any template is shown. The two independent problems should reuse the same invariant while changing the output contract.
