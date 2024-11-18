// 202035248 컴퓨터공학과 최윤

package classes;
import java.util.HashMap;
import java.util.Map;
import java.util.Scanner;

public class Quiz {
    public static void main(String[] args) {
        Map<String, Integer> s1 = new HashMap<>();
        s1.put("국어", 85);
        s1.put("영어", 90);
        s1.put("수학", 0);

        Map<String, Integer> s2 = new HashMap<>();
        s2.put("자바", 45);
        s2.put("소프트웨어공학", 55);
        s2.put("데이터베이스", 15);
        s2.put("C++", 50);

        Map<String, Integer> m3 = new HashMap<>();
        m3.put("경영학원론", 85);
        m3.put("통계학", 90);

        Map<String, Map<String, Integer>> students = new HashMap<>();
        students.put("홍길동", s1);
        students.put("김철수", s2);
        students.put("이영희", m3);

        Scanner scanner = new Scanner(System.in);
        System.out.print("검색할 이름을 입력하세요: ");
        String name = scanner.next();

//        int total = students.get(name).values().stream().mapToInt(Integer::intValue).sum();

        System.out.printf("%s의 총점은 %d 평균은 %d 입니다!!\n", name, total, total / students.get(name).size());
    }
}

