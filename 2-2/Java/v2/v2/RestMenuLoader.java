package exam.prj.kiosk.v2;

import com.google.gson.Gson;
import com.google.gson.JsonObject;
import com.google.gson.reflect.TypeToken;

import javax.net.ssl.HttpsURLConnection;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.URL;
import java.util.ArrayList;
import java.util.List;

public class RestMenuLoader implements MenuLoader {
    final String site = "https://qu4wqricio5pamdqij2mai57we0wjwal.lambda-url.ap-northeast-2.on.aws";

    @Override
    public List<MenuItem> loadMenu() throws LoadMenuException {
        List<MenuItem> menu = new ArrayList<>();
        Gson gson = new Gson();

        try {
            URL url = new URL(site);
            HttpsURLConnection conn = (HttpsURLConnection) url.openConnection();
            conn.setRequestMethod("GET");

            BufferedReader reader = new BufferedReader(new InputStreamReader(conn.getInputStream()));
            JsonObject jsonObject = gson.fromJson(reader, JsonObject.class);
            menu = gson.fromJson(jsonObject.get("menu"), new TypeToken<List<MenuItem>>(){}.getType());
        } catch (Exception e) {
            throw new LoadMenuException("메뉴 로딩에 실패 했습니다!!");
        }
        return menu;
    }
}
