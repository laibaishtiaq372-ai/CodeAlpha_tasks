async function loadProducts() {

    const productsDiv = document.getElementById("products");

    if (!productsDiv) return;

    const response = await fetch("/api/products");
    const products = await response.json();

    productsDiv.innerHTML = "";

    products.forEach(product => {

        productsDiv.innerHTML += `
            <div class="product-card">

                <img src="${product.image}" alt="${product.name}">

                <h3>${product.name}</h3>

                <p>${product.description}</p>

                <p class="price">
                    Rs. ${product.price}
                </p>

                <button onclick="viewProduct(${product.id})">
                    View Details
                </button>

                <button onclick="addToCart(${product.id})">
                    Add to Cart
                </button>

            </div>
        `;

    });
}


function viewProduct(id) {

    window.location.href = "product.html?id=" + id;

}


async function loadProductDetails() {

    const productDetails = document.getElementById("productDetails");

    if (!productDetails) return;

    const params = new URLSearchParams(window.location.search);

    const id = params.get("id");

    const response = await fetch("/api/products/" + id);

    const product = await response.json();

    productDetails.innerHTML = `

        <div class="product-card">

            <img src="${product.image}" alt="${product.name}">

            <h2>${product.name}</h2>

            <p>${product.description}</p>

            <p class="price">
                Rs. ${product.price}
            </p>

            <button onclick="addToCart(${product.id})">
                Add to Cart
            </button>

        </div>

    `;
}


async function addToCart(id) {

    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    const existingProduct = cart.find(item => item.id === id);

    if (existingProduct) {

        existingProduct.quantity++;

    } else {

        cart.push({
            id: id,
            quantity: 1
        });

    }

    localStorage.setItem("cart", JSON.stringify(cart));

    alert("Product added to cart!");

    loadCart();
}


async function loadCart() {

    const cartItems = document.getElementById("cartItems");

    if (!cartItems) return;

    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    cartItems.innerHTML = "";

    let total = 0;

    if (cart.length === 0) {

        cartItems.innerHTML = "<p>Your cart is empty.</p>";

        document.getElementById("cartTotal").innerText = "Total: Rs. 0";

        return;
    }

    for (const item of cart) {

        const response = await fetch("/api/products/" + item.id);

        const product = await response.json();

        const itemTotal = product.price * item.quantity;

        total += itemTotal;

        cartItems.innerHTML += `

            <div class="product-card">

                <h3>${product.name}</h3>

                <p>Price: Rs. ${product.price}</p>

                <p>Quantity: ${item.quantity}</p>

                <p>Subtotal: Rs. ${itemTotal}</p>

                <button onclick="increaseQuantity(${product.id})">
                    ➕
                </button>

                <button onclick="decreaseQuantity(${product.id})">
                    ➖
                </button>

                <button onclick="removeFromCart(${product.id})">
                    🗑️ Remove
                </button>

            </div>
        `;
    }

    document.getElementById("cartTotal").innerText =
        "Total: Rs. " + total;
}


function increaseQuantity(id) {

    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    const item = cart.find(item => item.id === id);

    if (item) {

        item.quantity++;

    }

    localStorage.setItem("cart", JSON.stringify(cart));

    loadCart();
}


function decreaseQuantity(id) {

    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    const item = cart.find(item => item.id === id);

    if (item) {

        item.quantity--;

        if (item.quantity <= 0) {

            cart = cart.filter(item => item.id !== id);

        }
    }

    localStorage.setItem("cart", JSON.stringify(cart));

    loadCart();
}


function removeFromCart(id) {

    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    cart = cart.filter(item => item.id !== id);

    localStorage.setItem("cart", JSON.stringify(cart));

    loadCart();
}


async function placeOrder() {

    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    if (cart.length === 0) {

        alert("Your cart is empty!");

        return;
    }

    const response = await fetch("/api/orders", {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({
            cart: cart
        })

    });

    const result = await response.json();

    alert(result.message);

    if (response.ok) {

        localStorage.removeItem("cart");

        loadCart();
    }
}


const loginForm = document.getElementById("loginForm");

if (loginForm) {

    loginForm.addEventListener("submit", async function(event) {

        event.preventDefault();

        const email = document.getElementById("email").value;

        const password =
            document.getElementById("password").value;

        const response = await fetch("/api/login", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                email: email,
                password: password
            })

        });

        const result = await response.json();

        alert(result.message);

        if (response.ok) {

            window.location.href = "index.html";

        }

    });

}


const registerForm =
    document.getElementById("registerForm");

if (registerForm) {

    registerForm.addEventListener("submit", async function(event) {

        event.preventDefault();

        const name =
            document.getElementById("name").value;

        const email =
            document.getElementById("registerEmail").value;

        const password =
            document.getElementById("registerPassword").value;

        const response = await fetch("/api/register", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                name: name,
                email: email,
                password: password
            })

        });

        const result = await response.json();

        alert(result.message);

        if (response.ok) {

            window.location.href = "login.html";

        }

    });

}


async function loadOrders() {

    const ordersDiv = document.getElementById("orders");

    if (!ordersDiv) return;

    const response = await fetch("/api/orders");

    const orders = await response.json();

    if (!response.ok) {

        ordersDiv.innerHTML = `
            <p>Please login first.</p>
        `;

        return;
    }

    ordersDiv.innerHTML = "";

    if (orders.length === 0) {

        ordersDiv.innerHTML = `
            <p>No orders found.</p>
        `;

        return;
    }

    orders.forEach(order => {

        ordersDiv.innerHTML += `

            <div class="product-card">

                <h3>Order #${order.id}</h3>

                <p>Total: Rs. ${order.total}</p>

                <p>Status: ${order.status}</p>

                <p>Date: ${order.created_at}</p>

            </div>

        `;

    });

}


async function logout() {

    const response = await fetch("/api/logout");

    const result = await response.json();

    alert(result.message);

    window.location.href = "login.html";

}


loadProducts();

loadProductDetails();

loadCart();

loadOrders();