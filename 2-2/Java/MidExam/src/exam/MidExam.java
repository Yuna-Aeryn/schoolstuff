package exam;// 컴퓨터공학과 202035248 최윤

import java.util.ArrayList;
import java.util.Scanner;

public class MidExam {

    // Store diary entries in an ArrayList
    private ArrayList<String> entries;

    // Constructor to initialize the entries list
    public MidExam() {
        entries = new ArrayList<>();
    }

    // Method to add a new entry
    public void addEntry(String entry) {
        entries.add(entry);
        System.out.println("내용 입력 성공\n");
    }

    // Method to display all entries
    public void viewEntries() {
        if (entries.isEmpty()) {
            System.out.println("일기장 내용 없음\n");
        } else {
            System.out.println("일기장 목록:");
            for (int i = 0; i < entries.size(); i++) {
                System.out.println((i + 1) + ". " + entries.get(i));
            }
            System.out.println();
        }
    }

    public static void main(String[] args) {
        MidExam diary = new MidExam();
        Scanner scanner = new Scanner(System.in);

        while (true) {
            System.out.println("일기장 메뉴:");
            System.out.println("1. 일기장 쓰기");
            System.out.println("2. 내용 열람");
            System.out.println("3. 종료");
            int choice = scanner.nextInt();
            scanner.nextLine();  // Consume newline

            switch (choice) {
                case 1:
                    System.out.print("일기장을 써주세요: ");
                    String entry = scanner.nextLine();
                    diary.addEntry(entry);
                    break;
                case 2:
                    diary.viewEntries();
                    break;
                case 3:
                    System.out.println("안녕히가세요!");
                    scanner.close();
                    System.exit(0);
                    break;
                default:
                    System.out.println("에러\n");
            }
        }
    }
}
