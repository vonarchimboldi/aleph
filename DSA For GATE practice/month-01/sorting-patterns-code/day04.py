def sift_down(a, root, size):
    while root < size // 2:
        child = 2 * root + 1
        if child + 1 < size and a[child + 1] > a[child]:
            child += 1
        if a[root] >= a[child]:
            break
        a[root], a[child] = a[child], a[root]
        root = child


def heap_sort(a):
    for root in range(len(a) // 2 - 1, -1, -1):
        sift_down(a, root, len(a))
    for end in range(len(a) - 1, 0, -1):
        a[0], a[end] = a[end], a[0]
        sift_down(a, 0, end)


class Node:
    def __init__(self, value, next_node=None):
        self.value = value
        self.next = next_node


def middle(head):
    # Contract: acyclic list; returns second middle for even length.
    slow = fast = head
    while fast is not None and fast.next is not None:
        slow = slow.next
        fast = fast.next.next
    return slow


def has_cycle(head):
    slow = fast = head
    while fast is not None and fast.next is not None:
        slow = slow.next
        fast = fast.next.next
        if slow is fast:
            return True
    return False


def cycle_entry(head):
    slow = fast = head
    while fast is not None and fast.next is not None:
        slow = slow.next
        fast = fast.next.next
        if slow is fast:
            seeker = head
            while seeker is not slow:
                seeker = seeker.next
                slow = slow.next
            return seeker
    return None
