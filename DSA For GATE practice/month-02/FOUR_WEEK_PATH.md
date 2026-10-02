# Month 2 Core Data Structures

Priyanka’s four-week track: 20 weekday sessions × 90 minutes = 30 hours. **Introduce all five structures in Week 1; spend the next three weeks applying them in depth.** Use Python 3. Sessions run October 5–30, 2026, and there is no required weekend work.

## Week 1 Build the complete toolbox

| Day | Structure | Foundational implementation | What must be clear before moving on |
|---|---|---|---|
| 1 Monday | Stack | Array-backed push, pop, peek; growing buffer | LIFO, live-prefix invariant, resize vs ordinary cost |
| 2 Tuesday | Queue and deque | Fixed-capacity ring queue; trace deque ends | FIFO, head/size, wrap-around, full vs empty |
| 3 Wednesday | Linked list | Singly linked nodes and basic operations; diagram doubly linked nodes | Reachability, head/tail, search vs known-node updates |
| 4 Thursday | Hash table | Chained integer-key map with forced collisions | Key-to-bucket invariant, updates, load factor, expected vs worst case |
| 5 Friday | Heap and priority queue | Array-based min-heap with sifts, push and pop | Parent/child indexing, heap order, priority vs FIFO |

This week is a first implementation and mental model, not mastery of every variant. Use small API scaffolds to keep the coding feasible. Hand-trace the representation, implement the essential moves, and test a short operation log. From Day 6 onward, every structure is available when choosing an approach.

## Weeks 2 to 4 Applications and deeper analysis

| Week | Monday | Tuesday | Wednesday | Thursday | Friday |
|---|---|---|---|---|---|
| 2 | Bracket nesting; optional postfix evaluation | Next-greater elements; monotonic stack | Queue from two stacks; amortization | In-place linked-list reversal | Merge sorted linked lists |
| 3 | Cycle detection; optional cycle entry | Two Sum and hash lookup | Probing, tombstones and deletion repair | Prefix-sum counting of subarrays | Linked list + hash map: LRU cache |
| 4 | Linear heapify and heapsort | Streaming top-k | Heap frontier: k-way merge | Monotonic deque: sliding-window maximum | Cumulative near-transfer interview/GATE checkpoint |

This sequence deliberately revisits the toolbox rather than reserving a whole late week for first exposure to hashing or heaps. Week 4’s deque problem also brings queues back after the heap applications. Retrieval throughout Weeks 2–4 samples structures not used in that day’s main task.

## Ninety minute budgets

### Week 1 Overview sessions

| Minutes | Work |
|---|---|
| 0–10 | Recall previous structures and compare the new ADT |
| 10–25 | Motivation, representation and invariant |
| 25–55 | Build core operations from a small interface scaffold |
| 55–70 | Test an operation log and adversarial boundary cases |
| 70–85 | GATE trace, runtime/space analysis and application preview |
| 85–90 | Exit ticket: when to use it, one invariant, one failure case |

### Weeks 2 to 4 Application sessions

| Minutes | Work |
|---|---|
| 0–10 | Closed-notes retrieval across the five structures |
| 10–25 | Naive approach, repeated work, and choice of structure |
| 25–45 | Implement the crucial primitive or algorithm step |
| 45–70 | Complete one main application and its tests |
| 70–85 | GATE reasoning plus correctness, runtime/space or amortized proof |
| 85–90 | Log assistance, first failed assumption and next repair target |

Both budgets total exactly 90 minutes. A stretch problem uses spare time inside the budget. One main application per day is the target, not a completion quota. On the LRU day, provide a sentinel-node scaffold so list primitives and cache integration fit within the coding block. No second-language translation is required.

## Invariants and analysis thread

Maintain two statements: what the data structure promises, and what the application’s state means. Then explain how each update preserves them.

- **Stacks:** a live-prefix representation first; unmatched openings and unresolved candidates later. Geometric resizing has linear total copying; a monotonic stack has at most one push and pop per candidate.
- **Queues:** ring indices and FIFO order first; two-stack transfer later. An expensive dequeue can still belong to an O(m) sequence of m operations.
- **Linked lists:** reachability and boundaries first; processed-prefix/suffix reasoning, sentinels and relative cycle motion later. Constant-time mutation at a known location does not make searching constant-time.
- **Hashing:** collision handling first; complement lookup, probe chains, prefix frequencies and cache indexing later. Expected hashing bounds require an appropriate model and controlled load. Rehash amortization is a separate argument from collision behavior.
- **Heaps:** local parent/child order first; node-height counting and retained frontiers later. Heapify is O(n); heap order is not sorted order. Include heap size, array allocation and output costs in application analysis.
- **Combined structures:** LRU maintains both recency links and key-to-node agreement. Sliding-window maxima combine expiry and dominance; O(n) total deque work does not mean every individual update is constant-time worst case.

## Daily task details

### Day 1 Overview: stacks

Implementation: Implement push, pop, peek and empty on a buffer; double capacity when full. Pop does not shrink.

Application: Trace and implement a LIFO operation log; preview nesting as an application.

### Day 2 Overview: queues and deques

Implementation: Implement a fixed-capacity ring queue with head and size; derive tail=(head+size)%capacity.

Application: Replay FIFO requests in a ring buffer; trace both-end deque operations without requiring a second full implementation.

### Day 3 Overview: linked lists

Implementation: Implement Node, traversal, prepend, append with tail and one deletion case; finish empty/head/tail cases during the operation-log block. Preview doubly linked representation.

Application: Replay insert/delete operations on a singly linked list; diagram the extra prev links in a doubly linked list.

### Day 4 Overview: hash tables

Implementation: Implement an integer-key map with buckets: put/get/delete; force collisions using key modulo bucket count.

Application: Replay put/get/update/delete on a chained integer-key map, including collisions; preview membership and counting applications.

### Day 5 Overview: heaps and priority queues

Implementation: Implement sift_up, sift_down, push, peek and pop in a zero-indexed array; do not call heapq yet.

Application: Replay min-priority requests with push/pop; contrast FIFO order, sorted order and heap order.

### Day 6 Stacks for nesting

Implementation: Reuse Day 1 stack; implement a bracket validator without counting alone.

Application: Validate mixed nested brackets; optional transfer: evaluate a postfix expression.

### Day 7 Monotonic stack

Implementation: Implement unresolved-index stack with explicit strict-greater comparisons.

Application: For every array position, return the index of its next strictly greater value, or -1.

### Day 8 Queue applications: lazy transfer and amortization

Implementation: Implement lazy transfer only when the output stack is empty.

Application: Build a FIFO queue using two stacks and replay a long burst followed by alternating operations.

### Day 9 Reversal without losing nodes

Implementation: Implement iterative reversal with prev, curr and saved next.

Application: Reverse a singly linked list in place; optional transfer: reverse a specified prefix.

### Day 10 Sentinels and merging lists

Implementation: Build a dummy-head merge and reconnect existing nodes.

Application: Merge two sorted linked lists without allocating a node for every output entry.

### Day 11 Fast/slow pointers

Implementation: Implement cycle detection; trace positions before writing the loop condition.

Application: Determine whether a linked list contains a cycle; optional: locate its entry after deriving the meeting argument.

### Day 12 Hash maps for lookup and counting

Implementation: Implement a complement lookup; optional frequency-map variation.

Application: Find two distinct indices whose values sum to a target without sorting.

### Day 13 Open addressing, deletion and growth

Implementation: Implement linear probing with EMPTY/OCCUPIED/DELETED states; bound a probe by table capacity.

Application: Repair lookup after deleting a colliding key; optional transfer: rehash a small table into doubled capacity.

### Day 14 Prefix sums plus hashing

Implementation: Implement counts of prior prefix sums, initialized with zero seen once.

Application: Count contiguous subarrays with sum K, allowing negative values.

### Day 15 Killer application: linked list + hashing for LRU

Implementation: Using a provided sentinel-node scaffold, implement detach and append-to-recent; then combine them with a key-to-node map for get/put. Do not use OrderedDict.

Application: Implement bounded least-recently-used caching with positive capacity. The linked-list primitive lab and cache integration share this session’s coding budget; a working scaffold is allowed.

### Day 16 Bottom-up heapify and heapsort

Implementation: Extend Day 5 sifts with bottom-up heapify; adapt comparison for an in-place max-heapsort.

Application: Sort an array by moving the maximum to a growing sorted suffix and repairing the reduced heap.

### Day 17 Killer application: top-k in a stream

Implementation: Maintain a size-k min-heap using Day 5 operations; heapq is permitted after the foundational implementation.

Application: Maintain the kth largest observation as values arrive, counting duplicate observations.

### Day 18 Killer application: k-way merge

Implementation: Keep one unconsumed head per nonempty sorted source in a heap; include a source tie-breaker.

Application: Merge k sorted arrays or iterators; optional: return a lazy iterator instead of a materialized result.

### Day 19 Killer application: sliding-window maximum

Implementation: Build a deque of candidate indices; expire old indices and remove dominated values before appending.

Application: Return the maximum for every consecutive window of k values without rescanning the window.

### Day 20 Cumulative interview and GATE checkpoint

Implementation: Select a structure before coding; state a brute-force baseline and why it wastes work.

Application: Near-transfer mock: merge k sorted linked lists by reusing nodes; optional fallback: implement FIFO using two stacks from memory.

## Checkpoints and completion

Day 5 compares all five representations. Day 10 checks pointer correctness and earlier stack/queue retrieval. Day 15 integrates two structures; scaffolded work is recorded as assisted when appropriate. Day 20 combines a near-transfer coding task with an original mixed GATE set. Checkpoints use the normal session, not extra time.

A solve requires working code under the contract, boundary/adversarial tests, an invariant and correct time/space analysis. Record independent, hinted, reused and partial attempts separately. If the core implementation is unfinished, use the next retrieval block for repair and remove a stretch rather than invent extra homework. A planned syllabus is not evidence of mastery.

## Syllabus scope and practical tools

The [official GATE 2027 DA syllabus](https://gate2027.iitm.ac.in/static/doc/GATE2027_Syllabus/DA_GATE2027_Syllabus.pdf) names stacks, queues, linked lists, trees and hash tables. “All five” here means this month’s agreed set: stacks, queues, linked lists, hashing and heaps. Dedicated trees remain in Month 3; heap indexing alone does not complete trees. Heaps are the requested priority-queue/interview extension, and graphs remain in Month 4. See [the coverage map](syllabus-coverage.md).

Built-in containers may be test oracles. They do not replace the Week 1 implementation being studied. After that, [deque](https://docs.python.org/3/library/collections.html#collections.deque) and [heapq](https://docs.python.org/3/library/heapq.html) may support application work. Analyze the representation actually used, including copying, resizing and output storage.

Use [the practice bank](PRACTICE_BANK.md) for invariants, bounds, trace cases and past-paper links, [the tracker](practice-tracker.csv) for outcomes, and [the structured curriculum](curriculum.json) for session indexing. The prior ordering is retained in `archive-before-overview/`. No daily PDFs or Aleph publication have been generated by this reorganization.
