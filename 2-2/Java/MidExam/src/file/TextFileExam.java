package file;
import java.io.*;
import java.text.ParseException;

public class TextFileExam {
    public static void main(String[] args) throws IOException, ParseException {
        // 단순 파일 입출력
        File file = new File("menu.json");
        BufferedReader br = new BufferedReader(new FileReader(file));

        String data;
        StringBuffer sb = new StringBuffer();
        while((data = br.readLine()) != null) {
            sb.append(data);
            System.out.println(data);
        }

        // 다음 장에서 JSON 파일 내용을 파싱하는 부분 추가.
    }
}