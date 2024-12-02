package exam.prj.kiosk.v2;

public record Option(String name, int price) {

    @Override
    public String toString() {
        return String.format("%s, %d원", name, price);
    }
}