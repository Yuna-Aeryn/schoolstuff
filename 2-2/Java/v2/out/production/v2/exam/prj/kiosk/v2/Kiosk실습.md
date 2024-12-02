# 식당 키오스크 소프트웨어 개발

## 클래스

- KioskApp.java: 메인 클래스
- Menu.java: 메뉴 클래스, 메뉴의 이름, 가격, 옵션목록을 가지고 있음.
- Order.java: 주문 클래스, 선택한 Menu와 옵션을 가지고 있음.
- Option.java: 옵션 클래스, 메뉴의 옵션을 가지고 있음. 주문에도 사용.

## 시나리오

- 프로그램 실행시 loadData() 메서드를 통해 메뉴와 옵션을 제공.
- showMenu() 메서드를 통해 메뉴를 보여줌.
- 사용자가 메뉴를 선택하면, 선택한 메뉴의 옵션을 보여줌.
- 사용자가 옵션을 선택하면, 주문을 생성하고
- checkOrder()에서 주문내역과 총액을 표시
- checkOut() 메서드를 통해 결제를 진행(메시지만 출력)

## 개선-1

- kios.v2 패키지에 작성.
- 메뉴와 옵션을 파일(json 규격)로 부터 읽어 처리하도록 함.
- 기존 소스 코드 수정 없이 동작할 수 있어야 함.
- json 처리는 Google gson2.10.x 라이브러리 사용
- json 처리 코드는 다음과 같음.

```java
        try{
        Reader reader=new FileReader("src/menuItem.json");
        JsonObject jsonObject=new Gson().fromJson(reader,JsonObject.class);
        JsonArray jsonArray=jsonObject.getAsJsonArray("menuItem");

        Gson gson=new Gson();
        List<Menu> menus=gson.fromJson(jsonArray,new TypeToken<ArrayList<Menu>>(){}.getType());
        }catch(Exception e){
        throw new RuntimeException(e);
        }
```

```json
{
  "menuItem": [
    {
      "name": "짜장면",
      "price": 8000,
      "options": [
        {
          "name": "일반",
          "price": 0
        },
        {
          "name": "간짜장",
          "price": 2000
        },
        {
          "name": "청양고추",
          "price": 500
        }
      ]
    },
    {
      "name": "돈까스",
      "price": 10000,
      "options": [
        {
          "name": "일반",
          "price": 0
        },
        {
          "name": "왕돈까스",
          "price": 1000
        },
        {
          "name": "치즈가루",
          "price": 500
        }
      ]
    },
    {
      "name": "카레라이스",
      "price": 9000,
      "options": [
        {
          "name": "보통",
          "price": 0
        },
        {
          "name": "맵게",
          "price": 200
        },
        {
          "name": "치킨",
          "price": 1000
        },
        {
          "name": "새우",
          "price": 2000
        },
        {
          "name": "난 추가",
          "price": 2000
        }
      ]
    }
  ]
}
```