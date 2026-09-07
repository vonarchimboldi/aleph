def sort_counts(a, method):
    comparisons = moves = 0
    if method == "insertion":
        for i in range(1, len(a)):
            key, j = a[i], i
            while j > 0:
                comparisons += 1
                if a[j - 1] <= key:
                    break
                a[j] = a[j - 1]
                moves += 1  # shifts; excludes the final key write
                j -= 1
            a[j] = key
    elif method == "bubble":
        for end in range(len(a) - 1, 0, -1):
            changed = False
            for j in range(end):
                comparisons += 1
                if a[j] > a[j + 1]:
                    a[j], a[j + 1] = a[j + 1], a[j]
                    moves += 1  # swaps, not individual assignments
                    changed = True
            if not changed:
                break
    elif method == "selection":
        for i in range(len(a) - 1):
            smallest = i
            for j in range(i + 1, len(a)):
                comparisons += 1
                if a[j] < a[smallest]:
                    smallest = j
            if smallest != i:
                a[i], a[smallest] = a[smallest], a[i]
                moves += 1
    else:
        raise ValueError("unknown sort")
    return comparisons, moves


def max_window(a, k):
    if not 1 <= k <= len(a):
        raise ValueError("require 1 <= k <= n")
    total = 0
    for i in range(k):
        total += a[i]
    best = total
    for right in range(k, len(a)):
        total += a[right] - a[right - k]
        best = max(best, total)
    return best
