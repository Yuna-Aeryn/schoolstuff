package Kiosk_v2;

import java.util.List;

public class JsonMenuLoader implements MenuLoader{
    @Override
    public List<MenuItem> loadMenu() throws LoadMenuException {
        throw new LoadMenuException("JSON Not yet");
    }
}
