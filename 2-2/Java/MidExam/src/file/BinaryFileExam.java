package file;
import java.io.*;

public class BinaryFileExam {
    public static void main(String[] args) {
        try {
            BufferedInputStream is = new BufferedInputStream(new FileInputStream("a.png"));
            BufferedOutputStream os = new BufferedOutputStream(new FileOutputStream("b.jpg"));

            byte[] buffer = new byte[1024];
            while (is.read(buffer) != -1) {
                os.write(buffer);
            }
            is.close();
            os.close();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}