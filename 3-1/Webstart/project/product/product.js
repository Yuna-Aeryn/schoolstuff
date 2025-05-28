//컴퓨터공학과, 202035248, 최윤

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
]

// 로그인 체크 함수
function checkLogin() {
    // 로그인 아이디, 비번, 경고창 요소 가져오기
    const id = document.getElementById('userid');
    const pw = document.getElementById('pwd');
    const alert = document.getElementById('alert');

    if (id.value === 'user1' && pw.value === '1234') {
        document.location.href = 'product_list.html';
    } else {
        // 입력값을 초기화
        id.value = '';
        pw.value = '';

        // 경고창 보이기
        alert.classList.add('show');
    }
};

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

// 상품 상세 정보를 출력하는 함수
function showProductDetail() {
    // URL에서 id 값을 가져와서 해당 상품 정보를 출력
    const urlParams = new URLSearchParams(window.location.search);
    const productId = parseInt(urlParams.get('id'));
    const product = products.find(p => p.id === productId);

    if (product) {
        document.getElementById('product-img').src = product.image;
        document.getElementById('product-name').innerText = `상품명: ${product.name}`;
        document.getElementById('order-btn').href = `product_order.html?id=${product.id}`;
        productdetails.innerHTML = `
            <li>제조사: ${product.manufacturer}</li>
            <li>설명: ${product.description}</li>   
            <li>가격: ${product.price.toLocaleString()}원</li>
        `;
    }
};

// 주문 정보를 서버로 전송하는 함수, 서버는 아직 없으므로 alert로 출력
function submitOrder() {
    // URL에서 id 값을 가져와서 해당 상품 정보를 출력
    const urlParams = new URLSearchParams(window.location.search);
    const product = products.find(p => p.id === parseInt(urlParams.get('id')));

    const formData = {
        product: product.name,
        amount: document.getElementById('amount').value,
        buyer: document.getElementById('buyer').value,
        address: document.getElementById('address').value,
        memo: document.getElementById('memo').value,
        color: document.getElementById('color').value,
        options: Array.from(document.querySelectorAll('input[name="options"]:checked')).map(option => option.value),
        shipping: document.querySelector('input[name="shipping"]:checked') ? document.querySelector('input[name="shipping"]:checked').value : null
    };

    alert(JSON.stringify(formData));
    document.location.href = "product_list.html"};  