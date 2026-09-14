#!/usr/bin/env python3
"""Cross-check the September 21–25 solution reasoning against small brute-force oracles."""
from itertools import product, combinations


def repair_interval(a):
    l = r = -1
    high = float('-inf')
    for i, x in enumerate(a):
        high = max(high, x)
        if x < high:
            r = i
    low = float('inf')
    for i in range(len(a)-1, -1, -1):
        low = min(low, a[i])
        if a[i] > low:
            l = i
    return l, r


def brute_repair(a):
    if a == sorted(a):
        return -1, -1
    for width in range(1, len(a)+1):
        for l in range(len(a)-width+1):
            r = l+width
            if a[:l]+sorted(a[l:r])+a[r:] == sorted(a):
                return l, r-1


def reversible(a):
    mismatches = [i for i, (x,y) in enumerate(zip(a, sorted(a))) if x != y]
    if not mismatches:
        return True
    l, r = mismatches[0], mismatches[-1]
    return a[:l]+a[l:r+1][::-1]+a[r+1:] == sorted(a)


def count(a, threshold, strict=False):
    l, r, total = 0, len(a)-1, 0
    while l < r:
        valid = a[l]+a[r] < threshold if strict else a[l]+a[r] <= threshold
        if valid:
            total += r-l
            l += 1
        else:
            r -= 1
    return total


def kth_distance(a, k):
    a = sorted(a)
    def feasible(d):
        l = total = 0
        for r in range(len(a)):
            while a[r]-a[l] > d:
                l += 1
            total += r-l
        return total >= k
    lo, hi = 0, a[-1]-a[0]
    while lo < hi:
        mid = (lo+hi)//2
        if feasible(mid):
            hi = mid
        else:
            lo = mid+1
    return lo


def spacing(a, k):
    a = sorted(a)
    def feasible(d):
        last, chosen = a[0], 1
        for x in a[1:]:
            if x-last >= d:
                chosen += 1
                last = x
        return chosen >= k
    lo, hi = 0, a[-1]-a[0]
    while lo < hi:
        mid = (lo+hi+1)//2
        if feasible(mid):
            lo = mid
        else:
            hi = mid-1
    return lo


def split(a):
    total, prefix = sum(a), 0
    best = (float('inf'), 0)
    for t in range(1, len(a)):
        prefix += a[t-1]
        best = min(best, (abs(2*prefix-total), t))
    return best[1], best[0]


def verify():
    checks = 0
    for n in range(6):
        for values in product(range(-1, 2), repeat=n):
            a = list(values)
            assert repair_interval(a) == brute_repair(a), a
            assert reversible(a) == any(a[:l]+a[l:r][::-1]+a[r:] == sorted(a)
                                        for l in range(n+1) for r in range(l,n+1)), a
            ordered = sorted(a)
            for low in range(-2, 3):
                for high in range(low, 3):
                    expected = sum(low <= x+y <= high for x,y in combinations(a,2))
                    assert count(ordered,high)-count(ordered,low,True) == expected
                    unique = sorted(set(a))
                    distinct = count(unique,high)-count(unique,low,True)
                    distinct += sum(a.count(x)>=2 and low <= 2*x <= high for x in unique)
                    oracle = {tuple(sorted((x,y))) for x,y in combinations(a,2) if low <= x+y <= high}
                    assert distinct == len(oracle)
                    checks += 2
            if n >= 2:
                distances = sorted(abs(x-y) for x,y in combinations(a,2))
                for k,d in enumerate(distances,1):
                    assert kth_distance(a,k) == d
                    checks += 1
                expected = min((abs(sum(a[:t])-sum(a[t:])),t) for t in range(1,n))
                assert split(a) == (expected[1],expected[0])
                checks += 1
    for n in range(2,7):
        for a in combinations(range(-3,4),n):
            for k in range(2,n+1):
                expected = max(min(y-x for x,y in zip(c,c[1:])) for c in combinations(a,k))
                assert spacing(a[::-1],k) == expected
                checks += 1
    assert repair_interval([1,3,2,2,4]) == (1,3)
    assert not reversible([1,3,2,4,3,5])
    assert kth_distance([0,4,9],2) == 5
    assert spacing([1,2,4,8,9],3) == 3
    assert split([1,2,3,4]) == (3,2)
    assert split([4,-5,3,2]) == (3,0)
    assert split([0,0,0]) == (1,0)
    assert split([1,1,1]) == (1,1)
    assert count([2]*200000,4) == 19999900000
    assert kth_distance([-10**9,10**9],1) == 2*10**9
    assert spacing([-10**9,10**9],2) == 2*10**9
    assert split([10**9]*200000) == (100000,0)
    print(f'Passed {checks} small-case comparisons plus published examples and wide-arithmetic cases.')


if __name__ == '__main__':
    verify()
