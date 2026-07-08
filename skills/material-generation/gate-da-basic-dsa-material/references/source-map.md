# Source Map: GATE DA Basic DSA Material

Use this file only when generating or reviewing GATE DA Basic DSA chapter material.

## Source Families

### MIT 6.006 Introduction to Algorithms

Primary URL: https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020/

Use for:

- mathematical modeling of computational problems;
- algorithm/data-structure connection;
- performance measures and analysis;
- clean lecture-note style for recurrence, divide-and-conquer, sorting, search, graphs, and dynamic programming;
- quiz/practice-problem style for compact reasoning.

Source facts: MIT OCW describes 6.006 as an introduction to modeling computational problems, common algorithms, algorithmic paradigms, data structures, and basic performance analysis.

### UC Berkeley CS 61B Data Structures

Primary URLs:

- https://cs61b.org/
- https://sp25.datastructur.es/

Use for:

- concrete implementation examples;
- lists, arrays, linked structures, stacks, queues, trees, maps, hashing, heaps, graph traversal, sorting;
- exam-prep style short problems;
- debugging and edge-case awareness.

Source facts: the Spring 2025 site exposes a weekly schedule with lectures/readings/labs/projects; early weeks cover references, recursion, linked lists, arrays, asymptotics, disjoint sets, BSTs, hashing, heaps, graph traversals, shortest paths, MSTs, tries, and sorting.

### Stanford CS106X Programming Abstractions in C++

Primary URL: https://web.stanford.edu/class/cs106x/

Use for:

- recursion and recursive backtracking examples;
- C++ abstraction examples;
- small implementation-focused projects;
- memory diagrams, pointer/list reasoning, and rigorous introductory programming abstractions.

Source facts: CS106X is described as an accelerated CS106B for strong programmers, with rigorous treatment and more challenging projects.

### Pat Morin, Open Data Structures

Primary URL: https://opendatastructures.org/

Use for:

- lists, stacks, queues, deques;
- array-backed and linked-list-backed implementations;
- sequence abstractions;
- hash tables, trees, heaps, graph representations;
- clean implementation-plus-analysis explanations.

Source facts: Open Data Structures covers implementation and analysis of data structures for sequences, queues, priority queues, dictionaries, and graphs; it includes array and linked-list implementations and is free/open.

### Jeff Erickson, Algorithms

Primary URL: https://jeffe.cs.illinois.edu/teaching/algorithms/

Use for:

- recursion as a thinking tool;
- induction/proof style;
- recurrence intuition;
- divide-and-conquer, dynamic programming, graph algorithms, and correctness arguments;
- problem style that asks for concise reasoning rather than rote implementation.

Source facts: Erickson's page provides a free electronic version of Algorithms and notes that the book assumes discrete math, basic data structures, and especially recursion. It is not a first data-structures textbook, so use it for rigor and problem flavor after basic intuition is established.

## Source-Mining Procedure

For each chapter:

1. Pick at least one implementation-focused source: CS 61B, CS106X, or Open Data Structures.
2. Pick at least one analysis/proof-focused source: MIT 6.006 or Jeff Erickson.
3. Extract ideas, not text:
   - one motivating example;
   - one trace/table/invariant pattern;
   - one common bug or misconception;
   - one end-of-chapter problem style.
4. Convert each extracted idea into original Aleph material.
5. Keep source notes in internal metadata or comments if editing `app.js`.

## GATE DA Fit

GATE DA DSA questions usually reward:

- reading short pseudocode accurately;
- recognizing time complexity quickly;
- tracing loops/recursion on small inputs;
- choosing the correct data structure behavior;
- identifying a correct invariant or recurrence;
- handling boundary cases without long code.

When adapting source ideas, compress them toward these exam behaviors. Avoid large programming projects, long implementation details, and language-specific library trivia.

## End-Of-Chapter Coverage Matrix

Each chapter's final problems should cover:

| Skill | Required evidence |
| --- | --- |
| Concept recognition | At least one question asks what pattern/algorithm/data structure is being used. |
| Trace discipline | At least one small input trace with intermediate state. |
| Complexity | At least one exact or asymptotic runtime question from pseudocode. |
| Invariant/correctness | At least one prompt asks why a loop/recursion/search step is valid. |
| Edge cases | At least one prompt includes empty, one-element, duplicate, equality, first/last, or not-found case. |
| Exam transfer | At least one compact GATE-style item with a plausible trap. |

## Chapter 2 Source Routing

Topic: Induction and Recursion.

Prefer:

- Stanford CS106X for recursion/backtracking intuition and call-stack examples.
- CS 61B for recursion with IntLists/references and implementation traces.
- MIT 6.006 for recurrences and divide-and-conquer framing.
- Jeff Erickson for induction, recursion proof shape, and recurrence reasoning.

Required end problems:

- identify base case and recursive case;
- trace recursive calls and returns;
- write recurrence from code;
- solve simple recurrences by expansion/recursion tree/Master Method;
- prove a recursive algorithm by induction;
- distinguish tail recursion from non-tail recursion.

## Chapter 3 Source Routing

Topic: Arrays, Strings, and Binary Search.

Prefer:

- CS 61B for arrays, ArrayLists, resizing, and exam-prep edge cases.
- Stanford CS106X for string/array programming abstractions and clear C++ traces.
- MIT 6.006 for binary search, invariants, and sorted-array reasoning.
- Open Data Structures for array-backed sequences and implementation tradeoffs.

Required end problems:

- trace an array or string scan;
- identify prefix/suffix invariant;
- count loop iterations;
- detect off-by-one or equality-case bug;
- apply binary search on a small sorted input;
- state why binary search discards the correct half;
- handle not-found and duplicate-value cases.
