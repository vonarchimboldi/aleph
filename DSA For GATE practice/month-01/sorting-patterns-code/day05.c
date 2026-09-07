#include <stddef.h>

void heap_sort(int *a, size_t n); /* Link with day04.c. */

size_t lower_bound(const int *a, size_t n, int target) {
    size_t lo = 0, hi = n;
    while (lo < hi) {
        size_t mid = lo + (hi - lo) / 2;
        if (a[mid] < target) lo = mid + 1;
        else hi = mid;
    }
    return lo;
}

size_t upper_bound(const int *a, size_t n, int target) {
    size_t lo = 0, hi = n;
    while (lo < hi) {
        size_t mid = lo + (hi - lo) / 2;
        if (a[mid] <= target) lo = mid + 1;
        else hi = mid;
    }
    return lo;
}

size_t occurrences(const int *a, size_t n, int target,
                   size_t *first, size_t *last) {
    size_t begin = lower_bound(a, n, target);
    size_t end = upper_bound(a, n, target);
    *first = begin < end ? begin : n;
    *last = begin < end ? end - 1 : n;
    return end - begin;
}

int integer_sqrt(int n) {
    /* Contract: 0 <= n <= INT_MAX, with 32-bit int. */
    long long lo = 0, hi = n, answer = 0;
    while (lo <= hi) {
        long long mid = lo + (hi - lo) / 2;
        if (mid == 0 || mid <= n / mid) {
            answer = mid;
            lo = mid + 1;
        } else hi = mid - 1;
    }
    return (int)answer;
}

typedef void (*TripletSink)(int, int, int, void *);

void three_sum(int *a, size_t n, TripletSink emit, void *context) {
    /* emit is non-null; it must not mutate a. */
    heap_sort(a, n);
    if (n < 3) return;
    for (size_t i = 0; i < n - 2; ++i) {
        if (i > 0 && a[i] == a[i - 1]) continue;
        size_t left = i + 1, right = n - 1;
        while (left < right) {
            long long total = (long long)a[i] + a[left] + a[right];
            if (total < 0) ++left;
            else if (total > 0) --right;
            else {
                emit(a[i], a[left], a[right], context);
                int low = a[left], high = a[right];
                while (left < right && a[left] == low) ++left;
                while (left < right && a[right] == high) --right;
            }
        }
    }
}
