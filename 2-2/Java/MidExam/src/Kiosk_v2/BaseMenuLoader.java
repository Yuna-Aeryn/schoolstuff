package Kiosk_v2;

import java.util.*;
import java.util.List;

public class BaseMenuLoader implements MenuLoader {
    @Override
    public List<MenuItem> loadMenu() throws LoadMenuException {
        List<MenuItem> menu = new ArrayList<>();

        // 메뉴 로딩
        MenuItem m = new MenuItem();
        m.setName("돈까스");
        m.setPrice(7000);
        List<Option> op = new ArrayList<>();
        op.add(new Option("일반", 0));
        op.add(new Option("왕돈까스", 1000));
        op.add(new Option("치즈가루", 500));
        m.setOptions(op);
        menu.add(m);

        m = new MenuItem("카레라이스", 9000);
        op = new ArrayList<>();
        op.add(new Option("보통", 0));
        op.add(new Option("맵게", 200));
        op.add(new Option("치킨", 1000));
        op.add(new Option("새우", 2000));
        op.add(new Option("난 추가", 2000));
        m.setOptions(op);
        menu.add(m);

        if(menu.size() != 2) {
            throw new LoadMenuException("메뉴 로딩 실패");
        } else {
            return menu;
        }
    }
}