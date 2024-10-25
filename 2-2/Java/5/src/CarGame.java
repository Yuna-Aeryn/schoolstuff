public class CarGame {
    public static void main(String[] args){
        Car c1 = new Car();
        c1.setColor("레드");
        c1.setModel("현대 소나타");
        c1.setPower(180);

        Car c2 = new Car("블루","BMW 520",210);
        c1.go();
        c2.go();
    }
}
