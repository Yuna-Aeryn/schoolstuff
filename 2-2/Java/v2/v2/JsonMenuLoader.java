package exam.prj.kiosk.v2;

import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import com.google.gson.reflect.TypeToken;

import java.io.FileReader;
import java.io.Reader;
import java.util.ArrayList;
import java.util.List;

public class JsonMenuLoader implements MenuLoader {
    @Override
    public List<MenuItem> loadMenu() throws LoadMenuException {
        List<MenuItem> menu = new ArrayList<>();
        Gson gson = new Gson();
        try {
            Reader reader = new FileReader("menu.json");
            JsonObject jsonObject = gson.fromJson(reader, JsonObject.class);
            menu = gson.fromJson(jsonObject.get("menu"), new TypeToken<List<MenuItem>>(){}.getType());
        } catch (Exception e) {
            throw new LoadMenuException("메뉴 로딩에 실패 했습니다!!");
        }
        return menu;
    }
}
