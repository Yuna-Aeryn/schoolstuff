// 컴퓨터공학과 202035248 최윤
import java.util.Scanner;

public class MidExam {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        Diary diary = new Diary();
        String command;

        System.out.println("Welcome to the Diary App!");

        while (true) {
            System.out.println("\nCommands: add, view, delete, exit");
            System.out.print("Enter a command: ");
            command = scanner.nextLine().toLowerCase();

            switch (command) {
                case "add":
                    System.out.print("Enter diary entry: ");
                    String content = scanner.nextLine();
                    diary.addEntry(content);
                    System.out.println("Entry added.");
                    break;
                case "view":
                    System.out.println("Diary Entries:");
                    diary.displayEntries();
                    break;
                case "delete":
                    diary.displayEntries();
                    System.out.print("Enter entry index to delete: ");
                    int index = scanner.nextInt();
                    scanner.nextLine(); // consume the newline
                    diary.deleteEntry(index);
                    break;
                case "exit":
                    System.out.println("Exiting the Diary App. Goodbye!");
                    return;
                default:
                    System.out.println("Unknown command.");
            }
        }
    }
}
