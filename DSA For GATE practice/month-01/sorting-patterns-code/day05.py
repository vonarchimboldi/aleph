from day04 import heap_sort


def lower_bound(a, target):
    lo, hi = 0, len(a)
    while lo < hi:
        mid = lo + (hi - lo) // 2
        if a[mid] < target:
            lo = mid + 1
        else:
            hi = mid
    return lo


def upper_bound(a, target):
    lo, hi = 0, len(a)
    while lo < hi:
        mid = lo + (hi - lo) // 2
        if a[mid] <= target:
            lo = mid + 1
        else:
            hi = mid
    return lo


def occurrences(a, target):
    first = lower_bound(a, target)
    end = upper_bound(a, target)
    return (first, end - 1, end - first) if first < end else (-1, -1, 0)


def integer_sqrt(n):
    # Contract: integer n >= 0.
    lo, hi, answer = 0, n, 0
    while lo <= hi:
        mid = lo + (hi - lo) // 2
        if mid == 0 or mid <= n // mid:
            answer = mid
            lo = mid + 1
        else:
            hi = mid - 1
    return answer


def three_sum(a):
    # Mutates a; returns distinct value triplets in sorted order.
    heap_sort(a)
    result = []
    for i in range(len(a) - 2):
        if i > 0 and a[i] == a[i - 1]:
            continue
        left, right = i + 1, len(a) - 1
        while left < right:
            total = a[i] + a[left] + a[right]
            if total < 0:
                left += 1
            elif total > 0:
                right -= 1
            else:
                result.append((a[i], a[left], a[right]))
                low, high = a[left], a[right]
                while left < right and a[left] == low:
                    left += 1
                while left < right and a[right] == high:
                    right -= 1
    return result
