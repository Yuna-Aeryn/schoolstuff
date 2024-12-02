package exam.prj.kiosk.v2;

import java.util.ArrayList;
import java.util.List;

public class Order {
    private MenuItem menuItem;
    private List<Option> selOptions = new ArrayList<>();

    public MenuItem getMenu() {
        return menuItem;
    }

    public void setMenu(MenuItem menuItem) {
        this.menuItem = menuItem;
    }

    public List<Option> getSelOptions() {
        return selOptions;
    }

    public void setSelOptions(List<Option> selOptions) {
        this.selOptions = selOptions;
    }
}