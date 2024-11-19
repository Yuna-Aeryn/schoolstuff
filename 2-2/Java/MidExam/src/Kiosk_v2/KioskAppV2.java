package Kiosk_v2;
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
        // 주문 정보 초기화
        order = new Order();

        // 메뉴 보여주고 입력 받기
        showMenu();
        System.out.print("# 메뉴를 선택 하세요: ");
        int sel = scan.nextInt();
        MenuItem menuItem = menu.get(sel);
        order.setMenu(menuItem);

        // 옵션 선택 호출
        optionSelect(menuItem);

        checkOrder(); // 주문 내역 출력. 선택메뉴, 옵션, 총액.
        checkOut(); // 결제 진행.
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