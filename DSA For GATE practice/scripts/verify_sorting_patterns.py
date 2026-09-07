#!/usr/bin/env python3
"""Deterministic reference checks, including independent brute-force oracles."""
import bisect
import ctypes as C
import importlib
import itertools
import math
from pathlib import Path
import random
import subprocess
import sys
import tempfile

ROOT = Path(__file__).resolve().parents[1] / "month-01"
CODE = ROOT / "sorting-patterns-code"
sys.dont_write_bytecode = True
sys.path.insert(0, str(CODE))
days = [None] + [importlib.import_module(f"day{i:02}") for i in range(1, 6)]
I, Z, L, B = C.c_int, C.c_size_t, C.c_longlong, C.c_bool
IP, ZP = C.POINTER(I), C.POINTER(Z)


class Counts(C.Structure):
    _fields_ = [("comparisons", C.c_ulonglong), ("moves", C.c_ulonglong)]


class Node(C.Structure):
    pass


NP = C.POINTER(Node)
Node._fields_ = [("value", I), ("next", NP)]
SINK = C.CFUNCTYPE(None, I, I, I, C.c_void_p)


def address(node):
    return C.addressof(node.contents) if node else None


with tempfile.TemporaryDirectory(prefix="aleph-sorting-check-") as temp:
    libpath = Path(temp) / "sorting.dylib"
    subprocess.run(["clang", "-std=c11", "-Wall", "-Wextra", "-Werror",
                    "-shared", "-fPIC", "-O1", "-o", str(libpath)] +
                   [str(CODE / f"day{i:02}.c") for i in range(1, 6)], check=True)
    lib = C.CDLL(str(libpath))
    signatures = {
        "bubble": ([IP,Z],None), "selection": ([IP,Z],None),
        "insertion": ([IP,Z],None), "merge_sort": ([IP,Z],B),
        "quick_sort": ([IP,Z],None), "heap_sort": ([IP,Z],None),
        "pair_sum": ([IP,Z,L,ZP,ZP],B), "unique_prefix": ([IP,Z],Z),
        "sort_counts": ([IP,Z,I],Counts),
        "max_window": ([IP,Z,Z,C.POINTER(L)],B),
        "min_window": ([IP,Z,L],Z),
        "lower_bound": ([IP,Z,I],Z), "upper_bound": ([IP,Z,I],Z),
        "occurrences": ([IP,Z,I,ZP,ZP],Z), "integer_sqrt": ([I],I),
        "middle": ([NP],NP), "has_cycle": ([NP],B),
        "cycle_entry": ([NP],NP), "three_sum": ([IP,Z,SINK,C.c_void_p],None)
    }
    for name, (args, result) in signatures.items():
        function = getattr(lib, name)
        function.argtypes, function.restype = args, result
    rng = random.Random(20260907)
    cases = [[], [0], [2,2], [5,2,4,2,1], [-2**31,1,2**31-1]]
    cases += [list(range(30)), list(range(29,-1,-1)), [3]*30]
    cases += [[rng.randrange(-12,13) for _ in range(rng.randrange(25))]
              for _ in range(300)]
    sorts = [(1,"bubble"),(1,"selection"),(1,"insertion"),
             (3,"merge_sort"),(3,"quick_sort"),(4,"heap_sort")]
    for original in cases:
        n = len(original)
        expected = sorted(original)
        for day, name in sorts:
            py = original.copy()
            getattr(days[day], name)(py)
            assert py == expected, (name, original)
            arr = (I*n)(*original)
            ok = getattr(lib, name)(arr,n)
            assert list(arr) == expected, ("C",name,original)
            if name == "merge_sort": assert ok
        for method, name in enumerate(["insertion","bubble","selection"]):
            py, arr = original.copy(), (I*n)(*original)
            counts = days[2].sort_counts(py,name)
            c = lib.sort_counts(arr,n,method)
            assert counts == (c.comparisons,c.moves)
            assert py == list(arr) == expected
            if name == "selection": assert c.comparisons == n*(n-1)//2
            if name in {"insertion","bubble"}:
                inversions = sum(original[i]>original[j]
                                 for i in range(n) for j in range(i+1,n))
                assert c.moves == inversions
        py, arr = expected.copy(), (I*n)(*expected)
        count = days[1].unique_prefix(py)
        cc = lib.unique_prefix(arr,n)
        assert py[:count] == list(arr)[:cc] == sorted(set(original))
        for target in [-25,-1,0,1,25]:
            arr = (I*n)(*expected)
            pair = days[1].pair_sum(expected,target)
            left, right = Z(), Z()
            found = lib.pair_sum(arr,n,target,C.byref(left),C.byref(right))
            oracle = any(x+y==target for x,y in itertools.combinations(expected,2))
            assert found == (pair is not None) == oracle
            if found:
                assert left.value < right.value
                assert expected[left.value]+expected[right.value] == target
                assert pair[0]<pair[1] and sum(expected[i] for i in pair)==target
            lb, ub = bisect.bisect_left(expected,target), bisect.bisect_right(expected,target)
            assert days[5].lower_bound(expected,target)==lib.lower_bound(arr,n,target)==lb
            assert days[5].upper_bound(expected,target)==lib.upper_bound(arr,n,target)==ub
            count = lib.occurrences(arr,n,target,C.byref(left),C.byref(right))
            assert count==ub-lb
            assert (left.value,right.value)==((lb,ub-1) if count else (n,n))
            assert days[5].occurrences(expected,target)==((lb,ub-1,count) if count else (-1,-1,0))
        for k in set([0,1,n,n+1]):
            out = L(123456)
            arr = (I*n)(*original)
            valid = lib.max_window(arr,n,k,C.byref(out))
            if 1<=k<=n:
                oracle = max(sum(original[i:i+k]) for i in range(n-k+1))
                assert valid and out.value==days[2].max_window(original,k)==oracle
            else:
                assert not valid and out.value==123456
                try: days[2].max_window(original,k)
                except ValueError: pass
                else: raise AssertionError("invalid k accepted")
        positive = [abs(x)+1 for x in original if abs(x)<100]
        for target in [1,7,50]:
            lengths = [j-i for i in range(len(positive)) for j in range(i+1,len(positive)+1)
                       if sum(positive[i:j])>=target]
            oracle = min(lengths,default=0)
            arr = (I*len(positive))(*positive)
            assert days[3].min_window(positive,target)==lib.min_window(arr,len(positive),target)==oracle
        oracle = {tuple(sorted(t)) for t in itertools.combinations(original,3) if sum(t)==0}
        py = days[5].three_sum(original.copy())
        collected = []
        sink = SINK(lambda x,y,z,context: collected.append((x,y,z)))
        lib.three_sum((I*n)(*original),n,sink,None)
        assert len(py)==len(set(py)) and set(py)==oracle
        assert len(collected)==len(set(collected)) and set(collected)==oracle
    for n in [0,1,2,3,4,8,9,15,16,17,2**31-1] + [rng.randrange(2**31) for _ in range(500)]:
        assert days[5].integer_sqrt(n)==lib.integer_sqrt(n)==math.isqrt(n)
    for n in range(12):
        for entry in range(-1,n):
            nodes = [days[4].Node(7) for _ in range(n)]
            cnodes = (Node*n)()
            for i in range(n):
                next_index = i+1 if i+1<n else entry
                nodes[i].next = nodes[next_index] if next_index>=0 else None
                cnodes[i].value = 7
                cnodes[i].next = C.pointer(cnodes[next_index]) if next_index>=0 else NP()
            head = nodes[0] if n else None
            chead = C.pointer(cnodes[0]) if n else NP()
            assert days[4].has_cycle(head)==lib.has_cycle(chead)==(entry>=0)
            expected_entry = nodes[entry] if entry>=0 else None
            assert days[4].cycle_entry(head) is expected_entry
            assert address(lib.cycle_entry(chead))==(C.addressof(cnodes[entry]) if entry>=0 else None)
            if entry==-1:
                assert days[4].middle(head) is (nodes[n//2] if n else None)
                assert address(lib.middle(chead))==(C.addressof(cnodes[n//2]) if n else None)
    for n in range(3,30):
        a,b = [n]+list(range(1,n)),list(range(2,n+1))+[1]
        assert days[2].sort_counts(a,"bubble")== (2*n-3,n-1)
        assert days[2].sort_counts(b,"bubble")== (n*(n-1)//2,n-1)
    print(f"PASS: {len(cases)} array cases across C/Python, 511 square roots, all list cycles for n<12, exact count families.")
