#linked list
class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next
head = ListNode(0)
head.next = ListNode(1)
head.next.next = ListNode(2)

#traversal
node=head
while node:
    print(node.val)
    node=node.next
#insertion
curr_node = head
new_node = ListNode(1)
curr_node.next = new_node
curr_node=curr_node.next
#deletion
node=head
while node.next:
    if node.next.val==2:
        next_node=node.next.next
        node.next=next_node
        break
    node=node.next
node=head
#search 

# Checks whether key is present in linked list
def search_key(head, key):
    curr = head
    while curr is not next:
        if curr.val == key:
            return True
        curr = curr.next
    return False

key = 2

if search_key(head, key):
    print("Yes")
else:
    print("No")