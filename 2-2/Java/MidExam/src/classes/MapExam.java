package classes;

import java.util.HashMap;
import java.util.Map;

public class MapExam {
    public static void main(String[] args) {
        // Map 생성및 데이터 등록
        Map<String, String> map = new HashMap<>();
        map.put("1922876", "Apple Iphone");
        map.put("1922877", "Apple Ipad");
        map.put("2136861", "Samsung Galaxy");
        map.put("2136863", "Samsung Tablet");

        // 데이터 조회
        System.out.println("1922877: " + map.get("1922877"));

        // 전체 Map 데이터 출력 - for, entrySet()
        System.out.println("# 키와 값 출력 --------------------");
        for (Map.Entry<String, String> entry : map.entrySet()) {
            System.out.printf("%s:%s\n", entry.getKey(), entry.getValue());
        }

        // 전체 Key 데이터 출력
        System.out.println("# 키만 출력 --------------------");
        for (String s : map.keySet()) {
            System.out.printf("%s\n", s);
        }

        // 전체 Value 데이터 출력
        System.out.println("# 값만 출력 --------------------");
        for (String s : map.values()) {
            System.out.printf("%s\n", s);
        }
    }
}

