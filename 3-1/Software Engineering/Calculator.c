#include <stdio.h>

int main(void) {
    float b, n, p, gp;

    //get prices and people numbers
    printf("Tell me the price for an individual:\n");
    scanf("%f", &p);
    printf("Tell me the price for a group ticket:\n");
    scanf("%f", &gp);
    printf("Tell me how many people are going:\n");
    scanf("%f", &n);

    //calculate breakpoint for price
    b = gp / p;

    //print whether its worth it or n
    if ( b < n ) {
        printf("it'll be worth buying the group tickets!\n");
    }
    else if ( b > n ) {


    }
    else if ( b == n ) {
        printf("it won't matter whether you buy individual or group tickets.\n");
    }
}
