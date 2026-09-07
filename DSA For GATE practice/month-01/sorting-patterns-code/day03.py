def merge_sort(a):
    buffer = [0] * len(a)

    def visit(lo, hi):
        if hi - lo < 2:
            return
        mid = lo + (hi - lo) // 2
        visit(lo, mid)
        visit(mid, hi)
        i, j = lo, mid
        for k in range(lo, hi):
            if i < mid and (j == hi or a[i] <= a[j]):
                buffer[k] = a[i]
                i += 1
            else:
                buffer[k] = a[j]
                j += 1
        for k in range(lo, hi):
            a[k] = buffer[k]

    visit(0, len(a))


def partition(a, lo, hi):
    # Inclusive hi; caller supplies a nonempty valid range.
    pivot = a[hi]
    i = lo
    for j in range(lo, hi):
        if a[j] <= pivot:
            a[i], a[j] = a[j], a[i]
            i += 1
    a[i], a[hi] = a[hi], a[i]
    return i


def quick_range(a, lo, hi):
    if lo >= hi:
        return
    p = partition(a, lo, hi)
    quick_range(a, lo, p - 1)
    quick_range(a, p + 1, hi)


def quick_sort(a):
    quick_range(a, 0, len(a) - 1)


def min_window(a, target):
    # Contract: target > 0 and every value > 0.
    left = total = 0
    best = len(a) + 1
    for right, value in enumerate(a):
        total += value
        while total >= target:
            best = min(best, right - left + 1)
            total -= a[left]
            left += 1
    return 0 if best == len(a) + 1 else best
