public class Car {
    // 자동차 클래스의 속성 즉 멤버 변수 선언
    private String color;
    private String model;
    private int power;
    private int curSpeed;

    // default 생성자
    public Car() {
        curSpeed = 0;
    }

    // 인자를 받아 객체의 속성들을 초기화 하는 생성자
    public Car(String color, String model, int power) {
        this.color = color;
        this.model = model;
        this.power = power;
    }

    public void go() {
        if (power < 200) {
            curSpeed += 10;
        } else if (power >= 200) {
            curSpeed += 20;
        }
        System.out.printf("%s 가속!!, 현재 속도 %d\n",model,curSpeed);
    }

    public void stop() {
        curSpeed = 0;
    }
    // getter/setter 메서드 생략
}
