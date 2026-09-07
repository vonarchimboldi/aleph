#include <stdbool.h>
#include <stddef.h>
#include <stdint.h>
#include <stdlib.h>

static void merge_visit(int *a, int *buffer, size_t lo, size_t hi) {
    if (hi - lo < 2) return;
    size_t mid = lo + (hi - lo) / 2;
    merge_visit(a, buffer, lo, mid);
    merge_visit(a, buffer, mid, hi);
    size_t i = lo, j = mid;
    for (size_t k = lo; k < hi; ++k) {
        if (i < mid && (j == hi || a[i] <= a[j]))
            buffer[k] = a[i++];
        else buffer[k] = a[j++];
    }
    for (size_t k = lo; k < hi; ++k) a[k] = buffer[k];
}

bool merge_sort(int *a, size_t n) {
    if (n < 2) return true;
    if (n > SIZE_MAX / sizeof *a) return false;
    int *buffer = malloc(n * sizeof *buffer);
    if (!buffer) return false;
    merge_visit(a, buffer, 0, n);
    free(buffer);
    return true;
}

size_t partition(int *a, size_t lo, size_t hi) {
    int pivot = a[hi];
    size_t i = lo;
    for (size_t j = lo; j < hi; ++j) {
        if (a[j] <= pivot) {
            int t = a[i]; a[i] = a[j]; a[j] = t;
            ++i;
        }
    }
    int t = a[i]; a[i] = a[hi]; a[hi] = t;
    return i;
}

static void quick_range(int *a, size_t lo, size_t hi) {
    if (lo >= hi) return;
    size_t p = partition(a, lo, hi);
    if (p > lo) quick_range(a, lo, p - 1);
    if (p < hi) quick_range(a, p + 1, hi);
}

void quick_sort(int *a, size_t n) {
    if (n > 1) quick_range(a, 0, n - 1);
}

size_t min_window(const int *a, size_t n, long long target) {
    /* Contract: positive target/values; exercise n <= 1000000. */
    size_t left = 0, best = n + 1;
    long long total = 0;
    for (size_t right = 0; right < n; ++right) {
        total += a[right];
        while (total >= target) {
            size_t length = right - left + 1;
            if (length < best) best = length;
            total -= a[left++];
        }
    }
    return best == n + 1 ? 0 : best;
}
