const products = [
    {
        "id": 1,
        "name": "갤럭시 태블릿",
        "manufacturer": "삼성",
        "price": 1000000,
        "description": "삼성의 최신 갤럭시 태블릿입니다.",
        "image": "img/1.jpg"
    },
    {
        "id": 2,
        "name": "그램 노트북",
        "manufacturer": "LG",
        "price": 2000000,
        "description": "LG의 초경량 그램 노트북입니다.",
        "image": "img/2.jpg"
    },
    {
        "id": 3,
        "name": "애플 아이폰",
        "manufacturer": "애플",
        "price": 1300000,
        "description": "애플의 최신 아이폰입니다.",
        "image": "img/3.jpg"
    }
];

// 상품 목록을 화면에 출력하는 함수
function showProductList() {
    const productList = document.getElementById('product-list');
    products.forEach(product => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${product.id}</td>
            <td><a href="product_detail.html?id=${product.id}">${product.name}</a></td>
            <td>${product.manufacturer}</td>
            <td>${product.price.toLocaleString()}원</td>
        `;
        productList.appendChild(row);
    });
};