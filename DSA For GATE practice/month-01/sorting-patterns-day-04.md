# Sorting and Patterns - Day 4
## Heapsort and fast/slow pointers

**Priyanka's Platinum study plan | Thursday, September 10, 2026 | 120 minutes | C11 and Python 3**

Today's question: what structure can we encode without allocating a second data structure? An array can encode a heap; two linked-list pointers can reveal position and cycles. Prerequisites: array bounds, Day 3's recursive reasoning, and basic C structs/pointers. Start in C today, then translate to Python. Node definitions are supplied in the appendix; reuse them rather than spending the session on list input/output.

## Your two-hour session

| Minutes | Task | Deliverable |
|---|---|---|
| 0-15 | Draw the array-backed heap | Parent/child formulas |
| 15-50 | Lab A: build heap and heapsort, both languages | Iterative sift-down |
| 50-70 | Heap traces and runtime problems | Linear build proof |
| 70-85 | Derive middle and cycle detection | Pointer-position trace |
| 85-110 | Lab B: implement middle/cycle detection in both languages | Boundary tests |
| 110-120 | Lab C: trace cycle entry and repair reference | Reset-pointer proof |

Lab C is a guided trace and reference-code exercise within the final ten minutes; a second full independent implementation is not added to today's workload. Attempt each task before opening its solution section.

## Lab A - From repeated maximum selection to a heap

Repeatedly scanning for the maximum costs Theta(n^2), as in selection sort. Instead maintain a structure whose maximum is always at index 0. A max heap has two properties: its shape is a complete binary tree, and every parent key is at least each child key. It is NOT a fully sorted array; siblings have no required relative order.

For zero-based indices, left child is 2r+1, right child 2r+2, and parent of r>0 is floor((r-1)/2). The heap occupies [0,size). A node has a child precisely when r<size//2. Derive this before using it: for n=5, nodes 0 and 1 are parents and nodes 2,3,4 are leaves. For n=6, node 2 has only its left child.

### Sift-down invariant

Assume both child subtrees are heaps and only root may violate heap order. Choose the larger EXISTING child. If root>=that child, both parent-child edges are valid and repair is complete. Otherwise swap root with that child and continue there. The larger child moved up dominates both child roots; any remaining violation moves downward along one path. Each step increases depth, so it terminates in O(log size) worst time.

Implementation details: test whether the right child exists before reading it. Use the active heap size, not the original array length. In C, checking root<size/2 before computing 2*root+1 also keeps child-index arithmetic within the active range. Stop on equal values; swapping equals is unnecessary.

### Build then extract

Build bottom-up from the last parent to the root. Before processing a parent, its children are leaves or already-repaired heaps. This proves the sift-down precondition by reverse induction. In C, avoid a loop that decrements unsigned root below zero; start at n/2 and process start-1 while start>0.

For heapsort, swap the maximum root into the final active position, shrink the heap by one, and sift the replacement root down. Outer invariant: the active prefix is a max heap, the suffix is sorted, and every suffix value is at least every active value. Never include the extracted suffix in sift-down.

Implement heap_sort(a) in Python and heap_sort(a,n) in C. Both mutate the input, use iterative sift-down and allocate no auxiliary array. Test [], [1], [2,1], [1,2,3,4,5,6], [4,10,3,5,1], and [2,2,2,2].

## Heap analysis workshop

1. Build a heap from [4,10,3,5,1]. After each extraction, record both the active prefix and fixed suffix.
2. Why is n times the maximum sift cost a valid O(n log n) upper bound for building a heap but not a tight bound?
3. At most about n/2^(h+1) nodes have height h in a full binary tree. Sum the work proportional to n * sum(h/2^(h+1)). Explain why leaves contribute almost no repair work and the total is O(n), also for incomplete final levels up to constant factors.
4. Compare bottom-up construction with n successive heap insertions, which can take Theta(n log n) in the worst case.
5. This sift-down stops early on equal keys. What happens to the BEST-case sorting time on an all-equal array? Distinguish this from its worst-case guarantee.

## Lab B - One pointer samples twice as fast

Represent a singly linked node by a value and a next reference. Compare node identity/address, not stored values: two distinct nodes may hold the same integer. Functions must not mutate links.

**Middle contract:** on an acyclic list, return the middle node; for even length, return the second middle; for an empty list, return null/None. After t iterations, slow has taken t links and fast 2t links, provided both fast moves exist. Advance while fast and fast.next exist. Trace lengths 0 through 6. A two-node list returns its second node.

**Cycle contract:** return whether repeatedly following next ever revisits a node. The naive method stores every visited address in a set, using O(n) memory. Can the two speeds detect repetition with O(1) state? Advance both pointers, then test whether they meet. Checking their equality before the first move would report a cycle in every nonempty list.

Once both are in a cycle of length lambda, fast gains one position modulo lambda per iteration. Therefore they meet within at most lambda further iterations. If there is no cycle, fast reaches null and the guarded loop terminates. Runtime is O(n) over the number of distinct reachable nodes; workspace O(1).

Tests: null head, a singleton ending in null, a self-cycle, two nodes ending in null, a two-node cycle, equal-valued distinct nodes, and a cycle beginning after a prefix. Do not call middle on a cyclic list; acyclicity is part of its contract.

For C tests, a stack array of Node objects avoids allocation cleanup: link each element to the next, then optionally point the tail into the array. For heap-allocated test nodes, disconnect the tail's cycle edge before freeing the list, or free using a separately retained allocation list. Never traverse a cycle to null expecting cleanup to terminate.

## Lab C - Where does the cycle begin?

Trace A->B->C->D->E->C. First locate the slow/fast meeting. Then reset a third pointer to head and move it and the meeting pointer one step at a time until they meet. Predict the returned node before reading the reference.

Let mu be the number of links before the entry and lambda the cycle length. If slow has taken t steps at a meeting, fast has taken 2t; their difference t is a multiple of lambda. Slow's offset from entry is (t-mu) modulo lambda. After mu further steps its offset is t modulo lambda=0, exactly when a head pointer reaches the entry. Explain why comparing VALUES rather than addresses invalidates this argument.

Exit: give the heap-build sum, distinguish heap shape from heap order, and show the two pointer guards needed before fast advances twice. Submit both languages' heapsort/middle/cycle code and the cycle-entry trace. Read the supplied entry implementation and mark the reset, equality check, and two one-step advances.

# Solution appendix

### Heap trace and cost checks

[4,10,3,5,1] becomes [10,5,3,4,1] after construction. Successive repaired active prefixes and suffixes are [5,4,3,1] / [10], [4,1,3] / [5,10], [3,1] / [4,5,10], and [1] / [3,4,5,10]. Final order is [1,3,4,5,10]. Swapping only with the left child fails, for example, at root 1 with children 2 and 3.

The height-weighted sum converges: sum(h/2^(h+1)) for h>=0 equals 1. Thus bottom-up build is O(n), and the traversal itself supplies an Omega(n) bound, so total build time is Theta(n). Sorting has O(n log n) upper time and Theta(n log n) worst time; repeated maximum removal is much cheaper than scanning the entire prefix each time. Under uniformly random distinct permutations its average time is Theta(n log n).

For THIS implementation on all-equal arrays, every sift stops after its first comparison, while construction and extraction each visit O(n) nodes/roots. Therefore best time over arrays allowing duplicates is Theta(n), not an unconditional Theta(n log n). With distinct keys, the conventional heapsort analysis gives Theta(n log n) best time. Always state the input assumptions and early-stop behavior. Iterative sift-down keeps auxiliary space O(1); heapsort is not stable.

### Linked-list answers

For lengths 0,1,2,3,4,5,6, the returned zero-based middle indices are none,0,1,1,2,2,3. A self-cycle is detected after one move. For A->B->C->D->E->C: slow/fast positions after moves are B/C, C/E, D/D. Reset seeker to A, then move seeker/slow through B/E to C/C. The cycle entry is C.

Cycle entry takes O(mu+lambda) time and O(1) workspace, including detection and the reset phase. For no cycle it returns null/None. Node values play no role in either detection or entry.

### Progressive hints

Heap: first mark which indices are leaves, then repair parents in reverse order. Middle: draw fast's landing position, including null. Cycle: compare after moving. Entry: reason modulo lambda and keep mu as a distance, not a node value.
