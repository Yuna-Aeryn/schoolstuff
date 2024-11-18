package Kiosk_v2;

public class MenuItem {
    private String name;
    private int price;
    private List<Option> options;

    public MenuItem() {
    }

    public MenuItem(String name, int price) {
        this.name = name;
        this.price = price;
    }

    // getter, setter
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public int getPrice() {
        return price;
    }

    public void setPrice(int price) {
        this.price = price;
    }

    public List<Option> getOptions() {
        return options;
    }

    public void setOptions(List<Option> options) {
        this.options = options;
    }
}