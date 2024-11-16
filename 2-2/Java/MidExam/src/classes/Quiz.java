/* 202035248 컴퓨터공학과 최윤 */
package classes;
import java.util.HashMap;
import java.util.Map;

public class Quiz {
    public static void main(String[] args) {
        Map<String, List<Integer>> s1 = new HashMap<>();
        s1.put("국어", 85);
        s1.put("영어", 90);
        s1.put("수학", 0);

        Map<String, List<Integer>> s2 = new HashMap<>();
        s1.put("자바", 45);
        s1.put("소프트웨어공학", 55);
        s1.put("데이터베이스", 15);
        s1.put("C++", 50);

        Map<String, List<Integer>> s3 = new HashMap<>();
        s1.put("경영학원론", 85);
        s1.put("통계학", 90);

        Map<String, Map<String, List<Integer>>> students = new HashMap<>();
        students.put("홍길동", s1);
        students.put("김철수", s2);
        students.put("이영희", s3);

        Scanner scanner = new Scanner(System.in);
        System.out.print("검색할 이름을 입력하세요: ");
        String name = scanner.next();

        // 합계 구하기
//        int total = students.get(name).stream().mapToInt(Integer::intValue).sum();
        int total = 0;
        for () {
           total += score;
        }
        System.out.printf("%s의 총점은 %d 평균은 %d 입니다!!\n", name, total, total / students.get(name).size());
    }
}

