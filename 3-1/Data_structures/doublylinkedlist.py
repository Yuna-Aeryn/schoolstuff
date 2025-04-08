class Node:
    def __init__(self, data):
        self.data = data
        self.prev = None
        self.next = None

class DoublyLinkedList:
    def __init__(self):
        self.head = None

    # Function to append a new node at the end of the list
    def append(self, data):
        new_node = Node(data)
        if not self.head:
            self.head = new_node
            return
        last = self.head
        while last.next:
            last = last.next
        last.next = new_node
        new_node.prev = last

    # Function to print the list (for debugging purposes)
    def print_list(self):
        temp = self.head
        while temp:
            print(temp.data, end=" <-> " if temp.next else "")
            temp = temp.next
        print()

def merge_sorted_lists(list1, list2):
    # Create a dummy node to start the merged list
    dummy = Node(0)
    tail = dummy

    # Pointers for both input lists
    p1 = list1.head
    p2 = list2.head

    # Traverse both lists and merge them into the new list
    while p1 and p2:
        if p1.data <= p2.data:
            tail.next = p1
            p1.prev = tail
            p1 = p1.next
        else:
            tail.next = p2
            p2.prev = tail
            p2 = p2.next
        tail = tail.next

    # If there are any remaining nodes in list1
    if p1:
        tail.next = p1
        p1.prev = tail

    # If there are any remaining nodes in list2
    if p2:
        tail.next = p2
        p2.prev = tail

    # Return the merged list starting from the node after the dummy
    merged_list = DoublyLinkedList()
    merged_list.head = dummy.next
    return merged_list

# Example usage
list1 = DoublyLinkedList()
list1.append(1)
list1.append(3)
list1.append(5)

list2 = DoublyLinkedList()
list2.append(2)
list2.append(4)
list2.append(6)

print("List 1:")
list1.print_list()
print("List 2:")
list2.print_list()

merged_list = merge_sorted_lists(list1, list2)

print("Merged List:")
merged_list.print_list()
