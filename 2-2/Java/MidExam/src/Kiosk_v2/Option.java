package Kiosk_v2;

public class Option {
    private final String name;
    private final int price;

    public Option(String name, int price) {
        this.name = name;
        this.price = price;
    }

    @Override
    public String toString() {
        return String.format("%s, %d원", name, price);
    }

    // getter
    public int getPrice() {
        return price;
    }

    public String getName() {
        return name;
    }
}