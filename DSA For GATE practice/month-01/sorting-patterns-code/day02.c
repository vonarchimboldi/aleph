#include <stdbool.h>
#include <stddef.h>

typedef struct { unsigned long long comparisons, moves; } Counts;

/* method: 0=insertion, 1=bubble, 2=selection. */
Counts sort_counts(int *a, size_t n, int method) {
    Counts c = {0, 0};
    if (method == 0) {
        for (size_t i = 1; i < n; ++i) {
            int key = a[i]; size_t j = i;
            while (j > 0) {
                ++c.comparisons;
                if (a[j - 1] <= key) break;
                a[j] = a[j - 1]; ++c.moves; --j;
            }
            a[j] = key;
        }
    } else if (method == 1) {
        for (size_t end = n; end > 1; --end) {
            bool changed = false;
            for (size_t j = 0; j + 1 < end; ++j) {
                ++c.comparisons;
                if (a[j] > a[j + 1]) {
                    int t = a[j]; a[j] = a[j + 1]; a[j + 1] = t;
                    ++c.moves; changed = true;
                }
            }
            if (!changed) break;
        }
    } else if (method == 2) {
        for (size_t i = 0; i + 1 < n; ++i) {
            size_t smallest = i;
            for (size_t j = i + 1; j < n; ++j) {
                ++c.comparisons;
                if (a[j] < a[smallest]) smallest = j;
            }
            if (smallest != i) {
                int t = a[i]; a[i] = a[smallest]; a[smallest] = t;
                ++c.moves;
            }
        }
    }
    return c;
}

bool max_window(const int *a, size_t n, size_t k, long long *out) {
    if (k == 0 || k > n) return false;
    long long total = 0;
    for (size_t i = 0; i < k; ++i) total += a[i];
    long long best = total;
    for (size_t right = k; right < n; ++right) {
        total += (long long)a[right] - a[right - k];
        if (total > best) best = total;
    }
    *out = best;
    return true;
}
