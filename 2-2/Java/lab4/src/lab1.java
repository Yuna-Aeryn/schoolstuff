// 컴퓨터공학과 202035248 최윤
/* in 파이썬: 90, 92, 87, 그다음 자바, 그다음 파이썬 */

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

public class lab1 {

    public static void main(String[] args) {

        int count = ...;

        String [] students = new String [count];
        int[] java = new int [count];
        int[] python = new int [count];
        int[] cplusplus = new int[count];
        int[] sum = new int[count];
        int[] average = new int[count];

        // Fill arrays with data here
        String[] students = {"홍길동", "김사랑", "나대장"};
        int[] java = {90, 92, 87};
        int[] python = {85, 95, 94};
        int[] cplusplus = {91, 88 , 96};
        int[] sum = {266, 275, 277};
        int[] average = {88, 91, 92};

        Object [] combined = new Object [count * 3];

        for (int i = 0, j = 0; i < count; i++)
        {
            combined [j++] = students [i];
            combined [j++] = java [i];
            combined [j++] = python [i];
            combined [j++] = cplusplus [i];
            combined [j++] = sum [i];
            combined [j++] = average [i];
        }

        /*different approach*/

        String[] array1 = { "hello1", "A2", "X19912" };
        String[] array2 = { "hello2", "B2", "Y19912" };
        String[] array3 = { "hello3", "C2", "Z19912" };
        String[] copyArrays = new String[array1.length + array2.length
                + array3.length];
        System.arraycopy(array1, 0, copyArrays, 0, array1.length);
        System.arraycopy(array2, 0, copyArrays, array1.length, array2.length);
        System.arraycopy(array3, 0, copyArrays, array1.length + array2.length,
                array3.length);

        String[][] array = new String[3][3];
        int index = 0;
        for (int i = 0; i < array.length; i++)
            for (int j = 0; j < array[i].length; j++) {
                array[i][j] = copyArrays[index++];
            }

        for (int i = 0; i < array.length; i++) {
            for (int j = 0; j < array[i].length; j++) {

                System.out.print(array[i][j] + "  ");
            }
            System.out.println();
        }



    }
}
