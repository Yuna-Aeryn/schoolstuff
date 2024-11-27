package file;

import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;
import java.io.*;

    public class JsonSimpleExam {
    JSONObject json;

    public JsonSimpleExam() throws IOException, ParseException {
        File file = new File("menu.json");
        BufferedReader br = new BufferedReader(new FileReader(file));

        JSONParser parser = new JSONParser();
        json = (JSONObject) parser.parse(br);

        // 단순 출력
        System.out.println(json.get("menu"));
    }

    // 사용자 정의 출력
    void customPrint() {
        // 메뉴와 옵션을 출력
        for(JSONObject menu : (Iterable<JSONObject>) json.get("menu")) {
            System.out.printf("[%s, %s]\n", menu.get("name"), menu.get("price"));
            for(JSONObject option : (Iterable<JSONObject>) menu.get("options")) {
                System.out.printf("\t >> %s, %s\n", option.get("name"), option.get("price"));
            }
        }
    }

    public static void main(String[] args) throws IOException, ParseException {
        JsonSimpleExam exam = new JsonSimpleExam();
        exam.customPrint();
    }
}
