#include <stdbool.h>
#include <stddef.h>

void sift_down(int *a, size_t root, size_t size) {
    while (root < size / 2) {
        size_t child = 2 * root + 1;
        if (child + 1 < size && a[child + 1] > a[child]) ++child;
        if (a[root] >= a[child]) break;
        int t = a[root]; a[root] = a[child]; a[child] = t;
        root = child;
    }
}

void heap_sort(int *a, size_t n) {
    for (size_t start = n / 2; start > 0; --start)
        sift_down(a, start - 1, n);
    for (size_t size = n; size > 1; --size) {
        int t = a[0]; a[0] = a[size - 1]; a[size - 1] = t;
        sift_down(a, 0, size - 1);
    }
}

typedef struct Node { int value; struct Node *next; } Node;

Node *middle(Node *head) {
    /* Contract: acyclic list. */
    Node *slow = head, *fast = head;
    while (fast && fast->next) {
        slow = slow->next;
        fast = fast->next->next;
    }
    return slow;
}

bool has_cycle(Node *head) {
    Node *slow = head, *fast = head;
    while (fast && fast->next) {
        slow = slow->next;
        fast = fast->next->next;
        if (slow == fast) return true;
    }
    return false;
}

Node *cycle_entry(Node *head) {
    Node *slow = head, *fast = head;
    while (fast && fast->next) {
        slow = slow->next;
        fast = fast->next->next;
        if (slow == fast) {
            Node *seeker = head;
            while (seeker != slow) {
                seeker = seeker->next;
                slow = slow->next;
            }
            return seeker;
        }
    }
    return NULL;
}
