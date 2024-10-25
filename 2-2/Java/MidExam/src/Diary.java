import java.util.ArrayList;
import java.util.List;

public class Diary {
    private List<DiaryEntry> entries;

    public Diary() {
        this.entries = new ArrayList<>();
    }

    public void addEntry(String content) {
        entries.add(new DiaryEntry(content));
    }

    public void deleteEntry(int index) {
        if (index >= 0 && index < entries.size()) {
            entries.remove(index);
        } else {
            System.out.println("Invalid entry index.");
        }
    }

    public void displayEntries() {
        if (entries.isEmpty()) {
            System.out.println("No entries found.");
        } else {
            for (int i = 0; i < entries.size(); i++) {
                System.out.println(i + ": " + entries.get(i));
            }
        }
    }
}
