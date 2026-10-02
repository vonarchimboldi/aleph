# Month 2 Practice Bank

Week 1 implements the five structures; Weeks 2–4 study their applications. One main task per session, with optional variations inside the same 90 minutes. Original GATE drills are instructor-written questions, not past-paper items.

## Verified platform counterparts

- Day 6: [LeetCode 20 Valid Parentheses](https://leetcode.com/problems/valid-parentheses/). Our local empty-string case broadens the platform input contract.
- Day 8: [LeetCode 232 Queue Using Stacks](https://leetcode.com/problems/implement-queue-using-stacks/). Define invalid-operation behavior locally; the platform assumes valid calls.
- Day 15: [LeetCode 146 LRU Cache](https://leetcode.com/problems/lru-cache/). Positive capacity and average hash-backed costs.
- Day 20: [LeetCode 23 Merge k Sorted Lists](https://leetcode.com/problems/merge-k-sorted-lists/). A near-transfer after Day 18’s frontier merge, not an unexplained first encounter.

## Verified GATE references

Use the original PDFs and official answer keys in [gate-da-papers](../../gate-da-papers); check diagrams in the PDFs rather than text extraction alone.

| Paper question | Concept | New placement |
|---|---|---|
| 2024 Q16 | ADT-operation matching | Day 1 and Week 1 retrieval |
| 2024 Q32 | Deque operations | Day 2 |
| 2025 Q27 | Binary search and representation | Day 3 |
| 2026 Q39 | Function calls and runtime stack | Day 8 analysis |
| 2025 Q18 | Linear probing | Day 13 |
| 2024 Q21 | Uniform hashing and load | Day 13 |

## Day 1 Overview: stacks

**Phase:** structure overview.

**Implementation:** Implement push, pop, peek and empty on a buffer; double capacity when full. Pop does not shrink.

**Main task:** Trace and implement a LIFO operation log; preview nesting as an application.

**Invariant:** The live prefix is exactly the stack, and its final entry is the top.

**Analysis target:** Push: O(1) amortized, O(n) on a resize; pop/peek O(1). Capacity is O(n) for insertion-only growth; after many pops it tracks historical maximum size.

**Trace cases:** Empty pop, singleton, duplicates, several growth boundaries.

**GATE block:** GATE DA 2024 Q16: match ADTs to operations; compare single-operation and sequence costs. Full resizing accounting returns later.

**Progressive hints:** Ask what state is needed; then what each move must preserve; only then reveal a representation or boundary update. Record the strongest assistance used.

**Exit ticket:** Explain the smallest failing case, the invariant that repairs it, and why this structure is preferable to another one in the toolbox.

## Day 2 Overview: queues and deques

**Phase:** structure overview.

**Implementation:** Implement a fixed-capacity ring queue with head and size; derive tail=(head+size)%capacity.

**Main task:** Replay FIFO requests in a ring buffer; trace both-end deque operations without requiring a second full implementation.

**Invariant:** Logical item i lives at (head+i)%capacity; 0<=size<=capacity.

**Analysis target:** O(1) worst-case endpoint operations, O(capacity) allocated storage; no list.pop(0).

**Trace cases:** Full vs empty, wrap-around, capacity one, invalid operation contract.

**GATE block:** GATE DA 2024 Q32: deque trace; compare FIFO with LIFO.

**Progressive hints:** Ask what state is needed; then what each move must preserve; only then reveal a representation or boundary update. Record the strongest assistance used.

**Exit ticket:** Explain the smallest failing case, the invariant that repairs it, and why this structure is preferable to another one in the toolbox.

## Day 3 Overview: linked lists

**Phase:** structure overview.

**Implementation:** Implement Node, traversal, prepend, append with tail and one deletion case; finish empty/head/tail cases during the operation-log block. Preview doubly linked representation.

**Main task:** Replay insert/delete operations on a singly linked list; diagram the extra prev links in a doubly linked list.

**Invariant:** Every live node is reachable exactly once; tail.next is None; empty head and tail agree.

**Analysis target:** Search/delete by value O(n); prepend and append with tail O(1); deleting a known node still needs its predecessor in a singly linked list.

**Trace cases:** Empty list, deleting head/tail, one node, missing key.

**GATE block:** GATE DA 2025 Q27: explain why a sorted linked list lacks constant-time midpoint access.

**Progressive hints:** Ask what state is needed; then what each move must preserve; only then reveal a representation or boundary update. Record the strongest assistance used.

**Exit ticket:** Explain the smallest failing case, the invariant that repairs it, and why this structure is preferable to another one in the toolbox.

## Day 4 Overview: hash tables

**Phase:** structure overview.

**Implementation:** Implement an integer-key map with buckets: put/get/delete; force collisions using key modulo bucket count.

**Main task:** Replay put/get/update/delete on a chained integer-key map, including collisions; preview membership and counting applications.

**Invariant:** Each key belongs to its hash bucket and appears at most once; updates replace its value.

**Analysis target:** Expected O(1) map operations with suitable hashing and bounded load; O(n) worst case; application expected O(n) time and O(n) space.

**Trace cases:** Colliding keys, duplicate update, absent deletion, negative integer keys under Python modulo.

**GATE block:** Original collision and load-factor trace; distinguish expected lookup bounds from worst-case collisions.

**Progressive hints:** Ask what state is needed; then what each move must preserve; only then reveal a representation or boundary update. Record the strongest assistance used.

**Exit ticket:** Explain the smallest failing case, the invariant that repairs it, and why this structure is preferable to another one in the toolbox.

## Day 5 Overview: heaps and priority queues

**Phase:** structure overview.

**Implementation:** Implement sift_up, sift_down, push, peek and pop in a zero-indexed array; do not call heapq yet.

**Main task:** Replay min-priority requests with push/pop; contrast FIFO order, sorted order and heap order.

**Invariant:** Every parent is <= its children; after a local repair only the repair path may temporarily violate heap order.

**Analysis target:** O(log n) comparisons/moves per push/pop; peek O(1). Dynamic-array resizing makes push O(log n) amortized overall, with occasional O(n) allocation work.

**Trace cases:** Empty pop, one child, equal priorities, ascending/reversed inserts.

**GATE block:** Original heap-array MSQ; end the week by choosing between all five structures for five small tasks.

**Progressive hints:** Ask what state is needed; then what each move must preserve; only then reveal a representation or boundary update. Record the strongest assistance used.

**Exit ticket:** Explain the smallest failing case, the invariant that repairs it, and why this structure is preferable to another one in the toolbox.

## Day 6 Stacks for nesting

**Phase:** application and analysis.

**Implementation:** Reuse Day 1 stack; implement a bracket validator without counting alone.

**Main task:** Validate mixed nested brackets; optional transfer: evaluate a postfix expression.

**Invariant:** The stack contains unmatched openings in encounter order.

**Analysis target:** O(n) time and O(n) worst-case auxiliary space.

**Trace cases:** Early closing, wrong nesting, unmatched opening; empty input is accepted in our local variant.

**GATE block:** Original MCQ: why equal counts do not imply correct nesting; trace maximum active stack depth.

**Progressive hints:** Ask what state is needed; then what each move must preserve; only then reveal a representation or boundary update. Record the strongest assistance used.

**Exit ticket:** Explain the smallest failing case, the invariant that repairs it, and why this structure is preferable to another one in the toolbox.

## Day 7 Monotonic stack

**Phase:** application and analysis.

**Implementation:** Implement unresolved-index stack with explicit strict-greater comparisons.

**Main task:** For every array position, return the index of its next strictly greater value, or -1.

**Invariant:** Stack indices increase; their values are non-increasing; popped indices receive their first greater successor.

**Analysis target:** O(n) aggregate time: each index is pushed once and popped at most once; O(n) space.

**Trace cases:** Increasing, decreasing, all equal, repeated peaks.

**GATE block:** Original NAT: count pushes/pops on a decreasing then increasing sequence; distinguish nested loops from quadratic work.

**Progressive hints:** Ask what state is needed; then what each move must preserve; only then reveal a representation or boundary update. Record the strongest assistance used.

**Exit ticket:** Explain the smallest failing case, the invariant that repairs it, and why this structure is preferable to another one in the toolbox.

## Day 8 Queue applications: lazy transfer and amortization

**Phase:** application and analysis.

**Implementation:** Implement lazy transfer only when the output stack is empty.

**Main task:** Build a FIFO queue using two stacks and replay a long burst followed by alternating operations.

**Invariant:** Reading output top-to-bottom followed by input bottom-to-top gives FIFO order.

**Analysis target:** An individual dequeue can be O(n); total O(m) stack primitives over m operations, O(1) amortized per operation; O(n) stored items.

**Trace cases:** Transfer after peek, repeated peek, enqueue after partial drain, empty behavior.

**GATE block:** Original potential/aggregate analysis MCQ; GATE DA 2026 Q39: compare total call count with maximum active depth.

**Progressive hints:** Ask what state is needed; then what each move must preserve; only then reveal a representation or boundary update. Record the strongest assistance used.

**Exit ticket:** Explain the smallest failing case, the invariant that repairs it, and why this structure is preferable to another one in the toolbox.

## Day 9 Reversal without losing nodes

**Phase:** application and analysis.

**Implementation:** Implement iterative reversal with prev, curr and saved next.

**Main task:** Reverse a singly linked list in place; optional transfer: reverse a specified prefix.

**Invariant:** prev is the reversed processed prefix; curr starts the untouched suffix; their nodes partition the original list.

**Analysis target:** O(n) time, O(1) auxiliary space; no recursive call stack.

**Trace cases:** Empty, singleton, two nodes; verify no node loss, duplication or cycle.

**GATE block:** Original pointer-state MSQ: identify which update order loses the suffix.

**Progressive hints:** Ask what state is needed; then what each move must preserve; only then reveal a representation or boundary update. Record the strongest assistance used.

**Exit ticket:** Explain the smallest failing case, the invariant that repairs it, and why this structure is preferable to another one in the toolbox.

## Day 10 Sentinels and merging lists

**Phase:** application and analysis.

**Implementation:** Build a dummy-head merge and reconnect existing nodes.

**Main task:** Merge two sorted linked lists without allocating a node for every output entry.

**Invariant:** The output prefix is sorted and complete for all consumed nodes; both remaining suffixes stay sorted.

**Analysis target:** O(n+m) time, O(1) auxiliary space when reusing nodes, excluding a constant dummy node.

**Trace cases:** One empty input, equal values, uneven lengths, tail attachment; inputs are disjoint acyclic lists.

**GATE block:** Original MCQ: stability with ties and the cost of finding an insertion position.

**Progressive hints:** Ask what state is needed; then what each move must preserve; only then reveal a representation or boundary update. Record the strongest assistance used.

**Exit ticket:** Explain the smallest failing case, the invariant that repairs it, and why this structure is preferable to another one in the toolbox.

## Day 11 Fast/slow pointers

**Phase:** application and analysis.

**Implementation:** Implement cycle detection; trace positions before writing the loop condition.

**Main task:** Determine whether a linked list contains a cycle; optional: locate its entry after deriving the meeting argument.

**Invariant:** Fast and slow traverse the same successor relation at different speeds; in a cycle their relative position advances modulo cycle length.

**Analysis target:** O(n) time, O(1) space, where n counts distinct reachable nodes.

**Trace cases:** No cycle, self-loop, two-node cycle, long stem, cycle at head.

**GATE block:** Original NAT: number of advances before a meeting; distinguish middle-finding from cycle-detection contracts.

**Progressive hints:** Ask what state is needed; then what each move must preserve; only then reveal a representation or boundary update. Record the strongest assistance used.

**Exit ticket:** Explain the smallest failing case, the invariant that repairs it, and why this structure is preferable to another one in the toolbox.

## Day 12 Hash maps for lookup and counting

**Phase:** application and analysis.

**Implementation:** Implement a complement lookup; optional frequency-map variation.

**Main task:** Find two distinct indices whose values sum to a target without sorting.

**Invariant:** Before processing index i, the map contains usable indices strictly before i.

**Analysis target:** Expected O(n) time and O(n) space under hashing assumptions; pathological lookup can make total O(n^2).

**Trace cases:** Duplicate values, same value needed twice, no pair, negative values.

**GATE block:** Original MSQ: lookup before insert vs insert before lookup; compare sorting-plus-two-pointers.

**Progressive hints:** Ask what state is needed; then what each move must preserve; only then reveal a representation or boundary update. Record the strongest assistance used.

**Exit ticket:** Explain the smallest failing case, the invariant that repairs it, and why this structure is preferable to another one in the toolbox.

## Day 13 Open addressing, deletion and growth

**Phase:** application and analysis.

**Implementation:** Implement linear probing with EMPTY/OCCUPIED/DELETED states; bound a probe by table capacity.

**Main task:** Repair lookup after deleting a colliding key; optional transfer: rehash a small table into doubled capacity.

**Invariant:** Only EMPTY terminates an unsuccessful search; DELETED preserves the probe chain.

**Analysis target:** O(1) expected operations only with appropriate hashing and controlled load/tombstones; O(n) worst case. A rebuild costs O(n) expected under the same assumptions.

**Trace cases:** Delete middle of cluster, wrap-around, full table, updating a key beyond a tombstone.

**GATE block:** GATE DA 2025 Q18: linear probing; GATE DA 2024 Q21: state the uniform-hashing assumption.

**Progressive hints:** Ask what state is needed; then what each move must preserve; only then reveal a representation or boundary update. Record the strongest assistance used.

**Exit ticket:** Explain the smallest failing case, the invariant that repairs it, and why this structure is preferable to another one in the toolbox.

## Day 14 Prefix sums plus hashing

**Phase:** application and analysis.

**Implementation:** Implement counts of prior prefix sums, initialized with zero seen once.

**Main task:** Count contiguous subarrays with sum K, allowing negative values.

**Invariant:** Before the current prefix is inserted, counts describe all earlier prefix sums; their difference identifies a valid subarray.

**Analysis target:** Expected O(n) time and O(n) space under hashing assumptions.

**Trace cases:** K=0, all zeroes, negatives, repeated prefix sums; ask why a positive-only sliding window fails.

**GATE block:** Original NAT: hand-trace prefix counts and count occurrences rather than distinct prefix values.

**Progressive hints:** Ask what state is needed; then what each move must preserve; only then reveal a representation or boundary update. Record the strongest assistance used.

**Exit ticket:** Explain the smallest failing case, the invariant that repairs it, and why this structure is preferable to another one in the toolbox.

## Day 15 Killer application: linked list + hashing for LRU

**Phase:** application and analysis.

**Implementation:** Using a provided sentinel-node scaffold, implement detach and append-to-recent; then combine them with a key-to-node map for get/put. Do not use OrderedDict.

**Main task:** Implement bounded least-recently-used caching with positive capacity. The linked-list primitive lab and cache integration share this session’s coding budget; a working scaffold is allowed.

**Invariant:** Map keys equal list keys; each key has one node; list order is recency; size never exceeds capacity after an operation.

**Analysis target:** Expected O(1) get/put with hash-map assumptions and O(capacity) storage; worst-case hash lookup is not O(1).

**Trace cases:** Capacity one, update existing key, get changes recency, eviction, missing get.

**GATE block:** Original cache-state trace; prove reciprocal links and map/list agreement, then explain expected O(1) get/put.

**Progressive hints:** Ask what state is needed; then what each move must preserve; only then reveal a representation or boundary update. Record the strongest assistance used.

**Exit ticket:** Explain the smallest failing case, the invariant that repairs it, and why this structure is preferable to another one in the toolbox.

## Day 16 Bottom-up heapify and heapsort

**Phase:** application and analysis.

**Implementation:** Extend Day 5 sifts with bottom-up heapify; adapt comparison for an in-place max-heapsort.

**Main task:** Sort an array by moving the maximum to a growing sorted suffix and repairing the reduced heap.

**Invariant:** Active prefix is a max-heap; suffix is sorted and contains the removed maxima.

**Analysis target:** Heapify O(n) via node-height counting; heapsort O(n log n), O(1) auxiliary space with iterative sifts; normally unstable.

**Trace cases:** Duplicates, already sorted, reverse sorted, empty, one element.

**GATE block:** Original NAT: compare n repeated insertions with bottom-up heapify and justify the height-sum bound.

**Progressive hints:** Ask what state is needed; then what each move must preserve; only then reveal a representation or boundary update. Record the strongest assistance used.

**Exit ticket:** Explain the smallest failing case, the invariant that repairs it, and why this structure is preferable to another one in the toolbox.

## Day 17 Killer application: top-k in a stream

**Phase:** application and analysis.

**Implementation:** Maintain a size-k min-heap using Day 5 operations; heapq is permitted after the foundational implementation.

**Main task:** Maintain the kth largest observation as values arrive, counting duplicate observations.

**Invariant:** Once k values exist, the heap contains k largest values seen; its root is the kth largest.

**Analysis target:** O(log k) accepted update, O(1) rejected comparison/peek; O(n log(k+1)) total upper bound and O(k) storage.

**Trace cases:** k=1, fewer than k values, duplicates, negatives, a long rejected tail.

**GATE block:** Original MCQ: why a min-heap, not a max-heap, is the correct retained frontier.

**Progressive hints:** Ask what state is needed; then what each move must preserve; only then reveal a representation or boundary update. Record the strongest assistance used.

**Exit ticket:** Explain the smallest failing case, the invariant that repairs it, and why this structure is preferable to another one in the toolbox.

## Day 18 Killer application: k-way merge

**Phase:** application and analysis.

**Implementation:** Keep one unconsumed head per nonempty sorted source in a heap; include a source tie-breaker.

**Main task:** Merge k sorted arrays or iterators; optional: return a lazy iterator instead of a materialized result.

**Invariant:** The heap contains the smallest unconsumed candidate from every unfinished source.

**Analysis target:** O(k+N log(k+1)) time including source setup; O(k) auxiliary heap space, plus O(N) output if materialized.

**Trace cases:** Empty sources, all sources empty, equal values from different sources, uneven source lengths.

**GATE block:** Original NAT: bound heap size and distinguish auxiliary space from returned output.

**Progressive hints:** Ask what state is needed; then what each move must preserve; only then reveal a representation or boundary update. Record the strongest assistance used.

**Exit ticket:** Explain the smallest failing case, the invariant that repairs it, and why this structure is preferable to another one in the toolbox.

## Day 19 Killer application: sliding-window maximum

**Phase:** application and analysis.

**Implementation:** Build a deque of candidate indices; expire old indices and remove dominated values before appending.

**Main task:** Return the maximum for every consecutive window of k values without rescanning the window.

**Invariant:** Candidate indices increase and their values decrease; all retained indices lie in the current window; the front is its maximum.

**Analysis target:** O(n) aggregate time: each index is appended once and removed at most once; O(k) auxiliary deque space, plus O(n-k+1) output.

**Trace cases:** k=1, k=n, equal values, increasing/decreasing sequences, maximum expiring; require 1<=k<=n.

**GATE block:** Original NAT: count removals and distinguish amortized per-update work from worst-case work in a single update.

**Progressive hints:** Ask what state is needed; then what each move must preserve; only then reveal a representation or boundary update. Record the strongest assistance used.

**Exit ticket:** Explain the smallest failing case, the invariant that repairs it, and why this structure is preferable to another one in the toolbox.

## Day 20 Cumulative interview and GATE checkpoint

**Phase:** application and analysis.

**Implementation:** Select a structure before coding; state a brute-force baseline and why it wastes work.

**Main task:** Near-transfer mock: merge k sorted linked lists by reusing nodes; optional fallback: implement FIFO using two stacks from memory.

**Invariant:** One frontier per unfinished list; consumed nodes form the sorted output; tie-breakers avoid comparing Node objects.

**Analysis target:** O(k+N log(k+1)) time, O(k) auxiliary heap space when relinking nodes; account for initialization and empty lists.

**Trace cases:** Equal node values, empty list collection, disjoint lists, one source; no cycles.

**GATE block:** Timed original mixed MCQ/MSQ/NAT set plus an explanation of one average/worst/amortized distinction.

**Progressive hints:** Ask what state is needed; then what each move must preserve; only then reveal a representation or boundary update. Record the strongest assistance used.

**Exit ticket:** Explain the smallest failing case, the invariant that repairs it, and why this structure is preferable to another one in the toolbox.

