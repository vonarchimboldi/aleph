# Month 2 Practice Bank

Use one main application per 90-minute session. These short summaries are original local tasks unless an official platform counterpart is linked. GATE drills labeled “original” are instructor-written, not past-paper questions. Optional transfers are replacements for unused time, not additional quotas.

## Verified platform counterparts

- Day 2: [LeetCode 20 Valid Parentheses](https://leetcode.com/problems/valid-parentheses/). Our local empty-string variant is broader than the platform’s nonempty input constraint.
- Day 5: [LeetCode 232 Queue Using Stacks](https://leetcode.com/problems/implement-queue-using-stacks/). Its platform contract assumes valid pop/peek calls; our local implementation must explicitly define invalid-operation behavior.
- Day 15: [LeetCode 146 LRU Cache](https://leetcode.com/problems/lru-cache/). Use positive capacity, and distinguish average hash-backed cost from worst-case cost.
- Day 20: [LeetCode 23 Merge k Sorted Lists](https://leetcode.com/problems/merge-k-sorted-lists/). This is a cumulative transfer after Day 19, not an unexplained difficulty jump.

## Verified local GATE question references

Use the original PDFs and official answer keys in [gate-da-papers](../../../gate-da-papers). Do not trust extraction alone when a question needs a diagram or table. No answers are included here.

| Paper and question | Reason to use it | Suggested day |
|---|---|---|
| 2024 Q16 | ADT-operation matching | 1 |
| 2024 Q32 | Double-ended queue operation trace | 4 |
| 2026 Q39 | Recursive calls and runtime stack; contrast total activations with maximum depth | 5 |
| 2025 Q27 | Binary search depends on representation, not only sorted values | 6 |
| 2025 Q18 | Linear probing collision trace | 13 |
| 2024 Q21 | Open-address hashing under an explicit uniform-hashing model | 13 |

Reattempts after seeing the solution are retrieval practice, not new independent solves. The checkpoint can instead use an original changed operation sequence.

## Day 1 Array-backed stack and resizing

**Implementation:** Implement push, pop, peek and empty on a buffer; double capacity when full. Pop does not shrink.

**Main task:** Replay a short undo-history stack log; compare the output to a simple list model.

**Invariant:** The live prefix is exactly the stack, and its final entry is the top.

**Analysis target:** Push: O(1) amortized, O(n) on a resize; pop/peek O(1). Capacity is O(n) for insertion-only growth; after many pops it tracks historical maximum size.

**Required trace cases:** Empty pop, singleton, duplicates, several growth boundaries.

**GATE block:** GATE DA 2024 Q16: identify ADTs; add an original resize-cost trace.

**Hint sequence:** First ask what state must be retained. Then ask what an operation must preserve. Only then reveal a representation or a boundary update. Record the strongest hint used; do not open a complete solution during the measured attempt.

**Exit question:** What is the smallest input that breaks your first approach, and which invariant explains the repair?

## Day 2 Stacks for nesting

**Implementation:** Use Day 1 stack; implement a bracket validator without counting alone.

**Main task:** Validate mixed nested brackets; optional transfer: evaluate a postfix expression.

**Invariant:** The stack contains unmatched openings in encounter order.

**Analysis target:** O(n) time and O(n) worst-case auxiliary space.

**Required trace cases:** Early closing, wrong nesting, unmatched opening; empty input is accepted in our local variant.

**GATE block:** Original MCQ: why equal counts do not imply correct nesting; trace maximum active stack depth.

**Hint sequence:** First ask what state must be retained. Then ask what an operation must preserve. Only then reveal a representation or a boundary update. Record the strongest hint used; do not open a complete solution during the measured attempt.

**Exit question:** What is the smallest input that breaks your first approach, and which invariant explains the repair?

## Day 3 Monotonic stack

**Implementation:** Implement unresolved-index stack with explicit strict-greater comparisons.

**Main task:** For every array position, return the index of its next strictly greater value, or -1.

**Invariant:** Stack indices increase; their values are non-increasing; popped indices receive their first greater successor.

**Analysis target:** O(n) aggregate time: each index is pushed once and popped at most once; O(n) space.

**Required trace cases:** Increasing, decreasing, all equal, repeated peaks.

**GATE block:** Original NAT: count pushes/pops on a decreasing then increasing sequence; distinguish nested loops from quadratic work.

**Hint sequence:** First ask what state must be retained. Then ask what an operation must preserve. Only then reveal a representation or a boundary update. Record the strongest hint used; do not open a complete solution during the measured attempt.

**Exit question:** What is the smallest input that breaks your first approach, and which invariant explains the repair?

## Day 4 Circular queue and deque operations

**Implementation:** Implement a fixed-capacity ring queue with head and size; derive tail=(head+size)%capacity.

**Main task:** Process bounded FIFO requests through repeated enqueue/dequeue cycles; optional: add both-end deque methods.

**Invariant:** Logical item i lives at (head+i)%capacity; 0<=size<=capacity.

**Analysis target:** O(1) worst-case endpoint operations, O(capacity) allocated storage; no list.pop(0).

**Required trace cases:** Full vs empty, wrap-around, capacity one, invalid operation contract.

**GATE block:** GATE DA 2024 Q32: deque trace; then an original ring-buffer head/tail trace.

**Hint sequence:** First ask what state must be retained. Then ask what an operation must preserve. Only then reveal a representation or a boundary update. Record the strongest hint used; do not open a complete solution during the measured attempt.

**Exit question:** What is the smallest input that breaks your first approach, and which invariant explains the repair?

## Day 5 Queue from two stacks and weekly checkpoint

**Implementation:** Implement lazy transfer only when the output stack is empty.

**Main task:** Build a FIFO queue using two stacks and replay a long burst followed by alternating operations.

**Invariant:** Reading output top-to-bottom followed by input bottom-to-top gives FIFO order.

**Analysis target:** An individual dequeue can be O(n); total O(m) stack primitives over m operations, O(1) amortized per operation; O(n) stored items.

**Required trace cases:** Transfer after peek, repeated peek, enqueue after partial drain, empty behavior.

**GATE block:** Original amortized MCQ; GATE DA 2026 Q39: total calls vs maximum simultaneous stack depth.

**Hint sequence:** First ask what state must be retained. Then ask what an operation must preserve. Only then reveal a representation or a boundary update. Record the strongest hint used; do not open a complete solution during the measured attempt.

**Exit question:** What is the smallest input that breaks your first approach, and which invariant explains the repair?

## Day 6 Singly linked lists

**Implementation:** Implement Node, traversal, prepend, append with tail, and deletion by value in small increments.

**Main task:** Support a list operation log and report its final contents; count pointer work rather than indexing it like an array.

**Invariant:** Every live node is reachable exactly once; tail.next is None; empty head and tail agree.

**Analysis target:** Search/delete by value O(n); prepend and append with tail O(1); deleting a known node still needs its predecessor in a singly linked list.

**Required trace cases:** Empty list, deleting head/tail, one node, missing key.

**GATE block:** GATE DA 2025 Q27: explain the random-access assumption behind binary search.

**Hint sequence:** First ask what state must be retained. Then ask what an operation must preserve. Only then reveal a representation or a boundary update. Record the strongest hint used; do not open a complete solution during the measured attempt.

**Exit question:** What is the smallest input that breaks your first approach, and which invariant explains the repair?

## Day 7 Reversal without losing nodes

**Implementation:** Implement iterative reversal with prev, curr and saved next.

**Main task:** Reverse a singly linked list in place; optional transfer: reverse a specified prefix.

**Invariant:** prev is the reversed processed prefix; curr starts the untouched suffix; their nodes partition the original list.

**Analysis target:** O(n) time, O(1) auxiliary space; no recursive call stack.

**Required trace cases:** Empty, singleton, two nodes; verify no node loss, duplication or cycle.

**GATE block:** Original pointer-state MSQ: identify which update order loses the suffix.

**Hint sequence:** First ask what state must be retained. Then ask what an operation must preserve. Only then reveal a representation or a boundary update. Record the strongest hint used; do not open a complete solution during the measured attempt.

**Exit question:** What is the smallest input that breaks your first approach, and which invariant explains the repair?

## Day 8 Sentinels and merging lists

**Implementation:** Build a dummy-head merge and reconnect existing nodes.

**Main task:** Merge two sorted linked lists without allocating a node for every output entry.

**Invariant:** The output prefix is sorted and complete for all consumed nodes; both remaining suffixes stay sorted.

**Analysis target:** O(n+m) time, O(1) auxiliary space when reusing nodes, excluding a constant dummy node.

**Required trace cases:** One empty input, equal values, uneven lengths, tail attachment; inputs are disjoint acyclic lists.

**GATE block:** Original MCQ: stability with ties and the cost of finding an insertion position.

**Hint sequence:** First ask what state must be retained. Then ask what an operation must preserve. Only then reveal a representation or a boundary update. Record the strongest hint used; do not open a complete solution during the measured attempt.

**Exit question:** What is the smallest input that breaks your first approach, and which invariant explains the repair?

## Day 9 Fast/slow pointers

**Implementation:** Implement cycle detection; trace positions before writing the loop condition.

**Main task:** Determine whether a linked list contains a cycle; optional: locate its entry after deriving the meeting argument.

**Invariant:** Fast and slow traverse the same successor relation at different speeds; in a cycle their relative position advances modulo cycle length.

**Analysis target:** O(n) time, O(1) space, where n counts distinct reachable nodes.

**Required trace cases:** No cycle, self-loop, two-node cycle, long stem, cycle at head.

**GATE block:** Original NAT: number of advances before a meeting; distinguish middle-finding from cycle-detection contracts.

**Hint sequence:** First ask what state must be retained. Then ask what an operation must preserve. Only then reveal a representation or a boundary update. Record the strongest hint used; do not open a complete solution during the measured attempt.

**Exit question:** What is the smallest input that breaks your first approach, and which invariant explains the repair?

## Day 10 Doubly linked lists and linked queue

**Implementation:** Implement detach(node), append_before_tail(node) with head/tail sentinels; reuse them for a linked deque.

**Main task:** Replay deque operations using linked nodes; prepare the exact primitives later needed by LRU.

**Invariant:** Neighbor links are reciprocal; sentinel boundaries remain valid; each live node belongs to the list once.

**Analysis target:** O(1) insertion/removal at known node or ends; search remains O(n); O(n) node storage.

**Required trace cases:** Only real node, adjacent removals, move-to-back, detach and reinsert; never detach a sentinel.

**GATE block:** Original mixed list/queue trace and weekly comparison of array and linked representations.

**Hint sequence:** First ask what state must be retained. Then ask what an operation must preserve. Only then reveal a representation or a boundary update. Record the strongest hint used; do not open a complete solution during the measured attempt.

**Exit question:** What is the smallest input that breaks your first approach, and which invariant explains the repair?

## Day 11 Hashing with separate chaining

**Implementation:** Implement an integer-key map with buckets: put/get/delete; force collisions using key modulo bucket count.

**Main task:** Remove repeated values while preserving the first occurrence, using membership rather than sorting.

**Invariant:** Each key belongs to its hash bucket and appears at most once; updates replace its value.

**Analysis target:** Expected O(1) map operations with suitable hashing and bounded load; O(n) worst case; application expected O(n) time and O(n) space.

**Required trace cases:** Colliding keys, duplicate update, absent deletion, negative integer keys under Python modulo.

**GATE block:** Original load-factor/collision MCQ; distinguish hashing assumptions from worst-case guarantees.

**Hint sequence:** First ask what state must be retained. Then ask what an operation must preserve. Only then reveal a representation or a boundary update. Record the strongest hint used; do not open a complete solution during the measured attempt.

**Exit question:** What is the smallest input that breaks your first approach, and which invariant explains the repair?

## Day 12 Hash maps for lookup and counting

**Implementation:** Implement a complement lookup; optional frequency-map variation.

**Main task:** Find two distinct indices whose values sum to a target without sorting.

**Invariant:** Before processing index i, the map contains usable indices strictly before i.

**Analysis target:** Expected O(n) time and O(n) space under hashing assumptions; pathological lookup can make total O(n^2).

**Required trace cases:** Duplicate values, same value needed twice, no pair, negative values.

**GATE block:** Original MSQ: lookup before insert vs insert before lookup; compare sorting-plus-two-pointers.

**Hint sequence:** First ask what state must be retained. Then ask what an operation must preserve. Only then reveal a representation or a boundary update. Record the strongest hint used; do not open a complete solution during the measured attempt.

**Exit question:** What is the smallest input that breaks your first approach, and which invariant explains the repair?

## Day 13 Open addressing, deletion and growth

**Implementation:** Implement linear probing with EMPTY/OCCUPIED/DELETED states; bound a probe by table capacity.

**Main task:** Repair lookup after deleting a colliding key; optional transfer: rehash a small table into doubled capacity.

**Invariant:** Only EMPTY terminates an unsuccessful search; DELETED preserves the probe chain.

**Analysis target:** O(1) expected operations only with appropriate hashing and controlled load/tombstones; O(n) worst case. A rebuild costs O(n) expected under the same assumptions.

**Required trace cases:** Delete middle of cluster, wrap-around, full table, updating a key beyond a tombstone.

**GATE block:** GATE DA 2025 Q18: linear probing; GATE DA 2024 Q21: state the uniform-hashing assumption.

**Hint sequence:** First ask what state must be retained. Then ask what an operation must preserve. Only then reveal a representation or a boundary update. Record the strongest hint used; do not open a complete solution during the measured attempt.

**Exit question:** What is the smallest input that breaks your first approach, and which invariant explains the repair?

## Day 14 Prefix sums plus hashing

**Implementation:** Implement counts of prior prefix sums, initialized with zero seen once.

**Main task:** Count contiguous subarrays with sum K, allowing negative values.

**Invariant:** Before the current prefix is inserted, counts describe all earlier prefix sums; their difference identifies a valid subarray.

**Analysis target:** Expected O(n) time and O(n) space under hashing assumptions.

**Required trace cases:** K=0, all zeroes, negatives, repeated prefix sums; ask why a positive-only sliding window fails.

**GATE block:** Original NAT: hand-trace prefix counts and count occurrences rather than distinct prefix values.

**Hint sequence:** First ask what state must be retained. Then ask what an operation must preserve. Only then reveal a representation or a boundary update. Record the strongest hint used; do not open a complete solution during the measured attempt.

**Exit question:** What is the smallest input that breaks your first approach, and which invariant explains the repair?

## Day 15 Killer application: LRU cache

**Implementation:** Combine Day 10 sentinel list primitives with a key-to-node map; code get/put without OrderedDict.

**Main task:** Implement bounded least-recently-used caching; capacity is positive.

**Invariant:** Map keys equal list keys; each key has one node; list order is recency; size never exceeds capacity after an operation.

**Analysis target:** Expected O(1) get/put with hash-map assumptions and O(capacity) storage; worst-case hash lookup is not O(1).

**Required trace cases:** Capacity one, update existing key, get changes recency, eviction, missing get.

**GATE block:** Original cache-state trace and explain why a singly linked list or heap alone does not give the same update cost.

**Hint sequence:** First ask what state must be retained. Then ask what an operation must preserve. Only then reveal a representation or a boundary update. Record the strongest hint used; do not open a complete solution during the measured attempt.

**Exit question:** What is the smallest input that breaks your first approach, and which invariant explains the repair?

## Day 16 Binary min-heap and priority queue

**Implementation:** Implement sift_up, sift_down, push, peek and pop in a zero-indexed array; do not call heapq yet.

**Main task:** Dispatch tasks in priority order; make tie behavior explicit using a sequence number.

**Invariant:** Every parent is <= its children; after a local repair only the repair path may temporarily violate heap order.

**Analysis target:** O(log n) comparisons/moves per push/pop; peek O(1). Dynamic-array resizing makes push O(log n) amortized overall, with occasional O(n) allocation work.

**Required trace cases:** Empty pop, one child, equal priorities, ascending/reversed inserts.

**GATE block:** Original heap-array MSQ: heap order does not imply a sorted array or O(log n) arbitrary search.

**Hint sequence:** First ask what state must be retained. Then ask what an operation must preserve. Only then reveal a representation or a boundary update. Record the strongest hint used; do not open a complete solution during the measured attempt.

**Exit question:** What is the smallest input that breaks your first approach, and which invariant explains the repair?

## Day 17 Bottom-up heapify and heapsort

**Implementation:** Implement bottom-up heapify; adapt comparison for an in-place max-heapsort.

**Main task:** Sort an array by moving the maximum to a growing sorted suffix and repairing the reduced heap.

**Invariant:** Active prefix is a max-heap; suffix is sorted and contains the removed maxima.

**Analysis target:** Heapify O(n) via node-height counting; heapsort O(n log n), O(1) auxiliary space with iterative sifts; normally unstable.

**Required trace cases:** Duplicates, already sorted, reverse sorted, empty, one element.

**GATE block:** Original NAT: compare n repeated insertions with bottom-up heapify and justify the height-sum bound.

**Hint sequence:** First ask what state must be retained. Then ask what an operation must preserve. Only then reveal a representation or a boundary update. Record the strongest hint used; do not open a complete solution during the measured attempt.

**Exit question:** What is the smallest input that breaks your first approach, and which invariant explains the repair?

## Day 18 Killer application: top-k in a stream

**Implementation:** Use a size-k min-heap; built-in heapq is allowed after the custom implementation lab.

**Main task:** Maintain the kth largest observation as values arrive, counting duplicate observations.

**Invariant:** Once k values exist, the heap contains k largest values seen; its root is the kth largest.

**Analysis target:** O(log k) accepted update, O(1) rejected comparison/peek; O(n log(k+1)) total upper bound and O(k) storage.

**Required trace cases:** k=1, fewer than k values, duplicates, negatives, a long rejected tail.

**GATE block:** Original MCQ: why a min-heap, not a max-heap, is the correct retained frontier.

**Hint sequence:** First ask what state must be retained. Then ask what an operation must preserve. Only then reveal a representation or a boundary update. Record the strongest hint used; do not open a complete solution during the measured attempt.

**Exit question:** What is the smallest input that breaks your first approach, and which invariant explains the repair?

## Day 19 Killer application: k-way merge

**Implementation:** Keep one unconsumed head per nonempty sorted source in a heap; include a source tie-breaker.

**Main task:** Merge k sorted arrays or iterators; optional: return a lazy iterator instead of a materialized result.

**Invariant:** The heap contains the smallest unconsumed candidate from every unfinished source.

**Analysis target:** O(k+N log(k+1)) time including source setup; O(k) auxiliary heap space, plus O(N) output if materialized.

**Required trace cases:** Empty sources, all sources empty, equal values from different sources, uneven source lengths.

**GATE block:** Original NAT: bound heap size and distinguish auxiliary space from returned output.

**Hint sequence:** First ask what state must be retained. Then ask what an operation must preserve. Only then reveal a representation or a boundary update. Record the strongest hint used; do not open a complete solution during the measured attempt.

**Exit question:** What is the smallest input that breaks your first approach, and which invariant explains the repair?

## Day 20 Cumulative interview and GATE checkpoint

**Implementation:** Select a structure before coding; state a brute-force baseline and why it wastes work.

**Main task:** Near-transfer mock: merge k sorted linked lists by reusing nodes; optional fallback: implement FIFO using two stacks from memory.

**Invariant:** One frontier per unfinished list; consumed nodes form the sorted output; tie-breakers avoid comparing Node objects.

**Analysis target:** O(k+N log(k+1)) time, O(k) auxiliary heap space when relinking nodes; account for initialization and empty lists.

**Required trace cases:** Equal node values, empty list collection, disjoint lists, one source; no cycles.

**GATE block:** Timed original mixed MCQ/MSQ/NAT set plus an explanation of one average/worst/amortized distinction.

**Hint sequence:** First ask what state must be retained. Then ask what an operation must preserve. Only then reveal a representation or a boundary update. Record the strongest hint used; do not open a complete solution during the measured attempt.

**Exit question:** What is the smallest input that breaks your first approach, and which invariant explains the repair?

