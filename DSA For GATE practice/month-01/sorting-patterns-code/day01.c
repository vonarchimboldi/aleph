#include <stdbool.h>
#include <stddef.h>

void bubble(int *a, size_t n) {
    for (size_t end = n; end > 1; --end) {
        bool changed = false;
        for (size_t j = 0; j + 1 < end; ++j) {
            if (a[j] > a[j + 1]) {
                int t = a[j]; a[j] = a[j + 1]; a[j + 1] = t;
                changed = true;
            }
        }
        if (!changed) break;
    }
}

void selection(int *a, size_t n) {
    for (size_t i = 0; i + 1 < n; ++i) {
        size_t smallest = i;
        for (size_t j = i + 1; j < n; ++j)
            if (a[j] < a[smallest]) smallest = j;
        if (smallest != i) {
            int t = a[i]; a[i] = a[smallest]; a[smallest] = t;
        }
    }
}

void insertion(int *a, size_t n) {
    for (size_t i = 1; i < n; ++i) {
        int key = a[i];
        size_t j = i;
        while (j > 0 && a[j - 1] > key) {
            a[j] = a[j - 1];
            --j;
        }
        a[j] = key;
    }
}

bool pair_sum(const int *a, size_t n, long long target,
              size_t *out_left, size_t *out_right) {
    if (n < 2) return false;
    size_t left = 0, right = n - 1;
    while (left < right) {
        long long total = (long long)a[left] + a[right];
        if (total == target) {
            *out_left = left; *out_right = right;
            return true;
        }
        if (total < target) ++left;
        else --right;
    }
    return false;
}

size_t unique_prefix(int *a, size_t n) {
    size_t write = 0;
    for (size_t read = 0; read < n; ++read) {
        if (write == 0 || a[read] != a[write - 1])
            a[write++] = a[read];
    }
    return write;
}
