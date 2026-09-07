# Sorting and Patterns: post-attempt references

Attempt the matching PDF lab before consulting these files. Copy this whole directory to keep Day 5's Day 4 dependency together. Functions are reference components, not interactive programs. The PDF defines each input/output contract and supplies practice cases and solutions.

- Day 1: three elementary sorts, pair sum, unique compaction.
- Day 2: operation counters and fixed windows.
- Day 3: merge sort, quicksort, positive-sum windows.
- Day 4: heapsort and linked-list pointers.
- Day 5: binary-search bounds, integer square root, and 3Sum.

Python 3 example (run in this directory):

```sh
python3 -c 'from day01 import insertion; a=[5,2,4,2,1]; insertion(a); print(a)'
python3 -c 'from day05 import three_sum; print(three_sum([-1,0,1,2,-1,-4]))'
```

C11 functions compile without a main program:

```sh
cc -std=c11 -Wall -Wextra -Werror -c day01.c day02.c day03.c day04.c day05.c
```

To run them, write a small main/test harness with matching prototypes and link the relevant .c files. Day 5 requires day04.c. A 3Sum sink can have signature `void print_triplet(int x, int y, int z, void *context)`; pass it to three_sum. It receives values by copy and may print/store them; do not mutate the input array during callbacks. Node tests can use a stack array of Node structs. The PDF includes the type definitions.

Exercises assume 32-bit int, at least 64-bit long long, valid pointers for nonempty arrays, and n<=1000000 for bounded-sum/counter examples. Keep adversarial recursive quicksort tests small (<=128); its deliberately naive recursion can exhaust the stack on large ordered or duplicate-heavy inputs. Python arbitrary-size integer arithmetic is not unit-cost in general.

Submit code and written invariant/complexity reasoning together as .txt or .md using the daily Aleph Submit solution control. Prefix each code block with its language. Keep reference-assisted corrections clearly marked.
