#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#define INPUT_FILE "plist1.dat"
//#define INPUT_FILE "plist2.dat"

void printResult(int pnum, int *pid, int *at, int *bt, int *tt, int *rt) {
	int i, sum_tt=0, sum_rt=0;

	printf("%15s %15s %15s %15s %15s\n", "Process id", "Arrive time", "Burst time", "Turnaround time", "Response time");
	for(i=0; i<pnum; ++i) {
		printf("%15d %15d %15d %15d %15d\n", pid[i], at[i], bt[i], tt[i], rt[i]);
		sum_tt+=tt[i];
		sum_rt+=rt[i];
	}

	printf("  avg. of TT: %.2f\n", (float)sum_tt/pnum);
	printf("  avg. of RT: %.2f\n", (float)sum_rt/pnum);
}	

//순서정리용 compare 함수
int compare(const void* a, const void* b) {
    return (*(int*)a - *(int*)b);
}


void FIFO(int pnum, int *pid, int *at, int *bt, int *tt, int *rt) {
	printf("  Scheme: First-In-First-Out\n");
	/* fifo는 대충 온순서로 실행시키고 stf는 걍 시간 비교해서 짧은 순서대로 하고 그럼되는거 */
	/* 구조체로 각 프로세스별로 도착시간 실행시간 같은거 넣고 실행시간 비교해서 우선순위 정하고 끝난시간 - 도착시간 하고 */
	/* fill in */

	int at_numbers[] = {at[pid[0]], at[pid[1]], at[pid[2]], at[pid[3]], at[pid[4]]};
	int array_size = sizeof(at_numbers) / sizeof(at_numbers[0]);
	qsort(at_numbers, array_size, sizeof(int), compare);
	int fifo_bt[] = {at_numbers[0]};
	
}

void SJF(int pnum, int *pid, int *at, int *bt, int *tt, int *rt) {
	printf("  Scheme: Shortest-Job-First t\n");
	/* fill in */

}


int main(void) {
	FILE *fp;
	int pnum, i, exit=0;
	int *pid, *at, *bt, *tt, *rt;

	fp = fopen(INPUT_FILE, "r");
	//read the number of processes 
	fscanf(fp, "%d", &pnum);

	pid = (int*)calloc(pnum, sizeof(int));
	at = (int*)calloc(pnum, sizeof(int));
	bt = (int*)calloc(pnum, sizeof(int));
	tt = (int*)calloc(pnum, sizeof(int));
	rt = (int*)calloc(pnum, sizeof(int));

	for(i=0; i<pnum; ++i) {
		fscanf(fp, "%d %d %d", &pid[i], &at[i], &bt[i]);
	}

	fclose(fp);
		
	FIFO(pnum, pid, at, bt, tt, rt);
	//SJF(pnum, pid, at, bt, tt, rt);
		

	printResult(pnum, pid, at, bt, tt, rt);
	memset(tt, 0, sizeof(int)*pnum);
	memset(rt, 0, sizeof(int)*pnum);
	
	return 0;
}