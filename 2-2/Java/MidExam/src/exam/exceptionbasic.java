package exam;

import java.io.FileNotFoundException;

public class exceptionbasic {
    public void methodA(String filename) throws FileNotFoundException {
        if(filename != null)
            System.out.println(filename.toUpperCase());
        else
            throw new FileNotFoundException("File not found");
        e
    }

public void methodB(String filename) {

}

public static void main(String[] args) {
    exceptionbasic eb = new exceptionbasic ();
    try {
        eb.methodA(null);
    } catch (FileNotFoundException e) {
        e.printStackTrace();
    } finally {
        System.out.println("always done this part");
    }
    System.out.println("메인 종료");
    }
}
