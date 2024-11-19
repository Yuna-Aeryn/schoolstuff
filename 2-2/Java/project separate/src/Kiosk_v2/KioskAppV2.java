package Kiosk_v2;
import java.util.ArrayList;
import java.util.List;
import java.util.Scanner;

public class KioskAppV2 {
    // 키오스크 제공 메뉴 목록
    public List<MenuItem> menu = new ArrayList<>();;
    Scanner scan = new Scanner(System.in);

    // 주문 정보
    Order order;

    public KioskAppV2(MenuLoader menuLoader) {
        try {
            menu = menuLoader.loadMenu();
        } catch (LoadMenuException e) {
            throw new RuntimeException(e);
        }
    }

    // 프로그램 구동
    public void start() {
    }

    public void showMenu() {
        System.out.println("#### 메뉴 ####");
        int i = 0;

        // 메뉴 목록 출력 - for-each
        for (MenuItem menuItem : menu) {
            System.out.printf("[%d] %s\n", i++, menuItem);
        }
        System.out.println("--------------\n");
    }

    private void optionSelect(MenuItem menuItem) {
    }

    private void checkOrder() {
    }

    public void checkOut() {
        System.out.println(">>>> 결제를 진행 합니다!!! <<<<");
    }

    public static void main(String[] args) {
        KioskAppV2 app = new KioskAppV2(new BaseMenuLoader()); // 어떤 메뉴 로더를 사용할 것인지 결정.
        app.start();
    }
}