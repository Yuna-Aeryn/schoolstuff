#include <stdio.h> 
#include <stdlib.h> 

struct list { 
    char name[10];
    int score; 
    struct list *link; 
};

int main() 
{ 
    struct list *head, *list1, *pre, *next; 
    head=NULL;
    int i;
    for (i=0; i<3; i++) { 
        list1 = (struct list*)malloc((sizeof(struct list)));
        if (list1 == NULL) return -1; 
        scanf_s("%s %d ", list1->name,10,&(list1->score));
        if (head ==NULL)
            head = list1;
        else
            head->link=list1;
        list1->link=NULL; 
        pre = list1; 
    };


};