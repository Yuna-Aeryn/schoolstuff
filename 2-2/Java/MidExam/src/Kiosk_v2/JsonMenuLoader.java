package Kiosk_v2;
import java.util.List;
import com.google.gson.JsonObject;
import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;
import java.io.*;


public class JsonMenuLoader implements MenuLoader{
    JsonObject json;
    Gson gson = new Gson();
    @Override
    public List<MenuItem> loadMenu() throws LoadMenuException {
        throw new LoadMenuException("JSON Not yet");
        List<Menu> menus = gson.fromJson(json.get("menu"), new TypeToken<List<MenuItem>>(){}.getType());
        for(Menu menu : menus) {
        }
    }
}


