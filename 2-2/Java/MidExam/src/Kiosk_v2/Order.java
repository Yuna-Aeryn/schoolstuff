package Kiosk_v2;

public class Order {
    private MenuItem menuItem;
    private List<Option> selOptions = new ArrayList<>();

    // getter, setter
    public MenuItem getMenuItem() {
        return menuItem;
    }

    public void setMenuItem(MenuItem menuItem) {
        this.menuItem = menuItem;
    }

    public List<Option> getSelOptions() {
        return selOptions;
    }

    public void setSelOptions(List<Option> selOptions) {
        this.selOptions = selOptions;
    }
}