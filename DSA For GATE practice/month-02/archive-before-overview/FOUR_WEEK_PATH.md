# Month 2 Core Data Structures

Priyanka’s four-week implementation and problem-solving track: 5 weekday sessions per week × 90 minutes = 20 sessions, 30 hours. No required weekend sessions or extra homework. Use relative Week 1–4 dates until the instructor assigns the calendar. This month replaces the earlier generic two-hour Month 2 assumption; Month 1 materials remain unchanged.

## What counts as learning a structure

For every structure, Priyanka must explain its representation and permitted operations, state an invariant, implement the core operations, analyze runtime and auxiliary space, and solve an application where the structure removes repeated work. A correct output alone is insufficient. Distinguish the structure’s invariant from the application’s invariant.

Use Python 3 as the primary language because GATE DA names Python. Earlier C/C++ work is useful background; translating a solution is optional and stays inside the same time budget. Do not require two language implementations per day.

## Syllabus scope

The [official GATE 2027 DA syllabus](https://gate2027.iitm.ac.in/static/doc/GATE2027_Syllabus/DA_GATE2027_Syllabus.pdf) names stacks, queues, linked lists, trees and hash tables. This month directly covers the four named non-tree structures plus heaps as the requested interview/priority-queue extension. Heaps introduce complete binary trees and parent/child indexing, but do not complete general tree coverage. Month 3 must still cover tree representation, traversals, BST operations and their analysis; graphs and shortest paths remain in Month 4. See [the coverage map](syllabus-coverage.md).

## Every 90 minute session

| Minutes | Work | Required evidence |
|---|---|---|
| 0–10 | Closed-notes retrieval | Previous invariant, edge case and complexity distinction |
| 10–25 | Motivation, naive approach and hand trace | Why the structure is necessary; state representation and invariant |
| 25–45 | Implementation lab | Core primitive(s) in Python, with boundary checks |
| 45–70 | One main interview-style application | Working constrained code, tested within the attempt |
| 70–85 | GATE-style reasoning and analysis | One trace, MCQ/MSQ/NAT or past-paper question, plus runtime/space or amortized argument |
| 85–90 | Exit ticket and error log | First broken assumption, one correction, next retrieval target |

This is a practice budget, not a quota. On implementation-heavy days the main application may be an operation log testing the data structure itself. Provide a small interface scaffold when needed; the learner writes the essential logic. A stretch variation substitutes for spare time and never adds required work beyond 90 minutes. If the main problem is unfinished at the cutoff, record partial progress and use the next session’s retrieval for repair.

## Four week progression

| Week | Structures and discoveries | Main applications |
|---|---|---|
| 1 | Stacks, ring queues, two-stack queues; aggregate and potential analysis | Nesting, next-greater elements, FIFO scheduling |
| 2 | Singly/doubly linked lists, sentinels, fast/slow pointers | In-place reversal, merging, cycles, linked deque |
| 3 | Chaining, open addressing, load factor, deletion, lookup | Two Sum, prefix-sum counting, LRU cache |
| 4 | Binary heaps, linear heapify, heapsort, bounded frontiers | Priority scheduling, streaming top-k, k-way merge, cumulative mock |

## Twenty sessions

| Day | Focus | Implementation lab | Main application |
|---|---|---|---|
| 1 | Array-backed stack and resizing | Implement push, pop, peek and empty on a buffer; double capacity when full. Pop does not shrink. | Replay a short undo-history stack log; compare the output to a simple list model. |
| 2 | Stacks for nesting | Use Day 1 stack; implement a bracket validator without counting alone. | Validate mixed nested brackets; optional transfer: evaluate a postfix expression. |
| 3 | Monotonic stack | Implement unresolved-index stack with explicit strict-greater comparisons. | For every array position, return the index of its next strictly greater value, or -1. |
| 4 | Circular queue and deque operations | Implement a fixed-capacity ring queue with head and size; derive tail=(head+size)%capacity. | Process bounded FIFO requests through repeated enqueue/dequeue cycles; optional: add both-end deque methods. |
| 5 | Queue from two stacks and weekly checkpoint | Implement lazy transfer only when the output stack is empty. | Build a FIFO queue using two stacks and replay a long burst followed by alternating operations. |
| 6 | Singly linked lists | Implement Node, traversal, prepend, append with tail, and deletion by value in small increments. | Support a list operation log and report its final contents; count pointer work rather than indexing it like an array. |
| 7 | Reversal without losing nodes | Implement iterative reversal with prev, curr and saved next. | Reverse a singly linked list in place; optional transfer: reverse a specified prefix. |
| 8 | Sentinels and merging lists | Build a dummy-head merge and reconnect existing nodes. | Merge two sorted linked lists without allocating a node for every output entry. |
| 9 | Fast/slow pointers | Implement cycle detection; trace positions before writing the loop condition. | Determine whether a linked list contains a cycle; optional: locate its entry after deriving the meeting argument. |
| 10 | Doubly linked lists and linked queue | Implement detach(node), append_before_tail(node) with head/tail sentinels; reuse them for a linked deque. | Replay deque operations using linked nodes; prepare the exact primitives later needed by LRU. |
| 11 | Hashing with separate chaining | Implement an integer-key map with buckets: put/get/delete; force collisions using key modulo bucket count. | Remove repeated values while preserving the first occurrence, using membership rather than sorting. |
| 12 | Hash maps for lookup and counting | Implement a complement lookup; optional frequency-map variation. | Find two distinct indices whose values sum to a target without sorting. |
| 13 | Open addressing, deletion and growth | Implement linear probing with EMPTY/OCCUPIED/DELETED states; bound a probe by table capacity. | Repair lookup after deleting a colliding key; optional transfer: rehash a small table into doubled capacity. |
| 14 | Prefix sums plus hashing | Implement counts of prior prefix sums, initialized with zero seen once. | Count contiguous subarrays with sum K, allowing negative values. |
| 15 | Killer application: LRU cache | Combine Day 10 sentinel list primitives with a key-to-node map; code get/put without OrderedDict. | Implement bounded least-recently-used caching; capacity is positive. |
| 16 | Binary min-heap and priority queue | Implement sift_up, sift_down, push, peek and pop in a zero-indexed array; do not call heapq yet. | Dispatch tasks in priority order; make tie behavior explicit using a sequence number. |
| 17 | Bottom-up heapify and heapsort | Implement bottom-up heapify; adapt comparison for an in-place max-heapsort. | Sort an array by moving the maximum to a growing sorted suffix and repairing the reduced heap. |
| 18 | Killer application: top-k in a stream | Use a size-k min-heap; built-in heapq is allowed after the custom implementation lab. | Maintain the kth largest observation as values arrive, counting duplicate observations. |
| 19 | Killer application: k-way merge | Keep one unconsumed head per nonempty sorted source in a heap; include a source tie-breaker. | Merge k sorted arrays or iterators; optional: return a lazy iterator instead of a materialized result. |
| 20 | Cumulative interview and GATE checkpoint | Select a structure before coding; state a brute-force baseline and why it wastes work. | Near-transfer mock: merge k sorted linked lists by reusing nodes; optional fallback: implement FIFO using two stacks from memory. |

## Analysis thread

Day 1: geometric doubling gives linear total copying across a sequence of pushes. A single resize is still linear. Do not describe amortized complexity as a probability average.

Day 3: each candidate enters and leaves a monotonic stack at most once. The total work is linear even though one iteration may pop many elements.

Day 5: each item enters the input stack, transfers at most once and leaves the output stack once. Use aggregate accounting first; then a potential proportional to input-stack size. This pays for transfer without assuming a lucky input distribution.

Days 11–14: hashing’s expected bounds require a hashing model and controlled load. Growing tables adds a separate amortization argument; neither assumption removes pathological worst-case collisions. Distinguish logical entries from tombstones.

Day 16: heap order limits a repair to a root-to-leaf path. Separate the O(log n) heap repair from possible dynamic-array allocation costs.

Day 17: bottom-up heapify is O(n), not O(n log n): most nodes have small height. Repeated insertions are a different construction algorithm.

Days 18–20: define the frontier size k and include output/initialization costs instead of writing O(log n) for every heap application.

## Weekly checkpoints

Days 5, 10 and 15 use the normal 90-minute session, not an additional test. In the final 15-minute analysis block, explain one invariant, diagnose one broken implementation and distinguish worst-case from expected/amortized cost. Day 20 is a cumulative near-transfer mock using the same budget. Its linked-list merge is a harder platform problem, but follows the array/iterator merge directly; assess transfer rather than first-exposure mastery.

At the end of each week, keep one unresolved concept as the next retrieval target. Remove an optional variation to make room for remediation. If repairs repeatedly consume the implementation block, revise the remaining workload rather than report superficial completion.

## Implementation portfolio

By month end retain: array-backed stack, fixed-capacity ring queue, two-stack queue, singly linked list, sentinel doubly linked deque, chained integer-key hash map, linear-probing map with tombstones, and binary heap with bottom-up heapify. Also retain application solutions and their smallest failing tests. Built-ins may act as test oracles; they must not replace the implementation being studied. After those labs, standard containers may be used in applications.

For practical Python applications, [collections.deque](https://docs.python.org/3/library/collections.html#collections.deque) supports endpoint operations without shifting the entire list; [heapq](https://docs.python.org/3/library/heapq.html) exposes a min-heap and linear-time heapify. Check the runtime interpreter before depending on version-specific convenience APIs. Use a portable min-heap with sign inversion for a max-heap if needed.

## Completion standard

Count a solution only when it meets the stated contract and constraints, passes normal/boundary/adversarial cases, and Priyanka can explain its invariant and time/space analysis. Record independent, hinted, reused and partial attempts separately. A translation or additional test case is not another solved problem. No mastery claim is made from the plan alone.

Detailed daily invariants, complexity assumptions and edge cases are in [the practice bank](PRACTICE_BANK.md). Record attempts in [the tracker](practice-tracker.csv). This is a month plan, not a set of finished daily PDFs or a published Aleph workspace. Prepare each learner module through the established collaborative workflow when its session is selected.
