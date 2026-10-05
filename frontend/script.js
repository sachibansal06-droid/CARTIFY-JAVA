const API = "https://cartify-java-1.onrender.com/api";

let products = [];
let cartItems = [];


// ===============================
// LOAD PRODUCTS
// ===============================

async function loadProducts() {

    try {

        const response = await fetch(`${API}/products`);
        products = await response.json();

        displayProducts(products);

    } catch (error) {

        console.error("Products error:", error);

        document.getElementById("product-container").innerHTML = `
            <p style="color:red;">
                Backend is not connected. Please start Spring Boot.
            </p>
        `;
    }
}


// ===============================
// DISPLAY PRODUCTS
// ===============================

function displayProducts(productList) {

    const container = document.getElementById("product-container");

    if (productList.length === 0) {

        container.innerHTML = `
            <p>No products available.</p>
        `;

        return;
    }

    container.innerHTML = productList.map(product => {

        return `
            <div class="product-card">

                <div class="product-image">
                    ${getProductEmoji(product.name)}
                </div>

                <div class="product-info">

                    <h3>${product.name}</h3>
                    <div class="product-rating">
    ⭐⭐⭐⭐⭐
    <span>4.5</span>
</div>
<div class="review-section">

    <button
        class="review-btn"
        onclick="writeReview(${product.id})"
    >
        💬 Write a Review
    </button>

</div>
<div class="reviews-list">
    ${getProductReviews(product.id)}
</div>
                    <p class="product-description">
                        ${product.description || "Amazing product from Cartify"}
                    </p>

                    <div class="product-price">
                        ₹${Number(product.price).toLocaleString("en-IN")}
                    </div>

                    <span class="stock-text">
    ${product.stock} items available
</span>

<div class="product-actions">

    <button
        class="add-btn"
        onclick="addToCart(${product.id})"
    >
        Add to Cart
    </button>

    <button
        class="wishlist-add-btn"
        onclick="addToWishlist(${product.id})"
        title="Add to Wishlist"
    >
        ❤️
    </button>

</div>

                </div>

            </div>
        `;

    }).join("");
}


// ===============================
// PRODUCT EMOJI
// ===============================

function getProductEmoji(name) {

    const productName = name.toLowerCase();

    if (productName.includes("laptop")) return "💻";
    if (productName.includes("phone")) return "📱";
    if (productName.includes("mobile")) return "📱";
    if (productName.includes("headphone")) return "🎧";
    if (productName.includes("watch")) return "⌚";
    if (productName.includes("camera")) return "📷";
    if (productName.includes("shoe")) return "👟";
    if (productName.includes("shirt")) return "👕";
    if (productName.includes("book")) return "📚";
    if (productName.includes("chair")) return "🪑";

    return "🛍️";
}


// ===============================
// ADD TO CART
// ===============================

async function addToCart(productId) {

    try {

        // Check if product is already in cart
        const existingItem = cartItems.find(
            item => item.productId === productId
        );

        if (existingItem) {

            // Product already exists → increase quantity
            await updateCartQuantity({
                ...existingItem,
                quantity: existingItem.quantity + 1
            });

            showToast("Quantity increased! 🛒");
            return;
        }

        // Product is not in cart → add it
        const response = await fetch(`${API}/cart`, {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                productId: productId,
                quantity: 1
            })

        });

        if (!response.ok) {
            alert("Unable to add product. Please check stock.");
            return;
        }

        showToast("Product added to cart! ✓");

        await loadCart();

    } catch (error) {

        console.error("Cart error:", error);

        alert("Backend is not connected.");
    }
}


// 👇 YAHAN SE WISHLIST CODE PASTE KARNA HAI

// ===============================
// WISHLIST
// ===============================

let wishlist = JSON.parse(localStorage.getItem("cartifyWishlist")) || [];

function addToWishlist(productId) {

    const product = products.find(p => p.id === productId);

    if (!product) return;

    const alreadyAdded = wishlist.some(item => item.id === productId);

    if (alreadyAdded) {
        showToast("Already in Wishlist ❤️");
        return;
    }

    wishlist.push(product);

    localStorage.setItem(
        "cartifyWishlist",
        JSON.stringify(wishlist)
    );

    updateWishlistCount();

    showToast("Added to Wishlist ❤️");
}

function updateWishlistCount() {

    const count = document.getElementById("wishlistCount");

    if (count) {
        count.textContent = wishlist.length;
    }
}

function openWishlist() {

    const drawer = document.getElementById("wishlist-drawer");
    const overlay = document.getElementById("wishlist-overlay");

    drawer.classList.add("open");
    overlay.classList.add("show");

    displayWishlist();
}


function closeWishlist() {

    const drawer = document.getElementById("wishlist-drawer");
    const overlay = document.getElementById("wishlist-overlay");

    drawer.classList.remove("open");
    overlay.classList.remove("show");
}


function displayWishlist() {

    const container = document.getElementById("wishlist-items");

    if (wishlist.length === 0) {

        container.innerHTML = `
            <p class="empty-cart">
                Your wishlist is empty ❤️
            </p>
        `;

        return;
    }

    container.innerHTML = wishlist.map(product => {

        return `
            <div class="cart-item">

                <div>
                    <strong>${product.name}</strong>

                    <p>
                        ₹${Number(product.price).toLocaleString("en-IN")}
                    </p>
                </div>

                <div>

                    <button
                        onclick="addToCart(${product.id})"
                    >
                        🛒
                    </button>

                    <button
                        onclick="removeFromWishlist(${product.id})"
                    >
                        🗑️
                    </button>

                </div>

            </div>
        `;

    }).join("");
}


function removeFromWishlist(productId) {

    wishlist = wishlist.filter(
        product => product.id !== productId
    );

    localStorage.setItem(
        "cartifyWishlist",
        JSON.stringify(wishlist)
    );

    updateWishlistCount();

    displayWishlist();

    showToast("Removed from Wishlist");
}
function writeReview(productId) {

    const product = products.find(p => p.id === productId);

    if (!product) return;

    const rating = prompt(
        `Rate ${product.name} from 1 to 5 ⭐`
    );

    if (!rating) return;

    const stars = Number(rating);

    if (stars < 1 || stars > 5 || !Number.isInteger(stars)) {
        alert("Please enter a rating from 1 to 5.");
        return;
    }

    const review = prompt(
        `Write your review for ${product.name}:`
    );

    if (!review || review.trim() === "") {
        return;
    }

    const reviews =
        JSON.parse(localStorage.getItem("cartifyReviews")) || {};

    if (!reviews[productId]) {
        reviews[productId] = [];
    }

    reviews[productId].push({
        rating: stars,
        review: review.trim()
    });

    localStorage.setItem(
        "cartifyReviews",
        JSON.stringify(reviews)
    );

    showToast("Review submitted! ⭐");

    alert("Thank you for your review! ❤️");
}
function getProductReviews(productId) {

    const reviews =
        JSON.parse(localStorage.getItem("cartifyReviews")) || {};

    const productReviews = reviews[productId] || [];

    if (productReviews.length === 0) {
        return `<p class="no-reviews">No reviews yet.</p>`;
    }

    return productReviews.map(item => {

        const stars = "⭐".repeat(item.rating);

        return `
            <div class="review-item">
                <div class="review-stars">${stars}</div>
                <p>${item.review}</p>
            </div>
        `;

    }).join("");
}


// ===============================
// LOAD CART
// ===============================

async function loadCart() {

    try {

        const response = await fetch(`${API}/cart`);

        cartItems = await response.json();

        displayCart();

    } catch (error) {

        console.error("Cart loading error:", error);
    }
}


// ===============================
// DISPLAY CART
// ===============================

function displayCart() {

    const container = document.getElementById("cart-items");

    document.getElementById("cart-count").textContent =
        cartItems.reduce((total, item) => total + item.quantity, 0);

    if (cartItems.length === 0) {

        container.innerHTML = `
            <p class="empty-cart">
                Your cart is empty.
            </p>
        `;

        document.getElementById("cart-total").textContent = "₹0";

        return;
    }

    let total = 0;

    container.innerHTML = cartItems.map(item => {

        const product = products.find(
            p => p.id === item.productId
        );

        if (!product) return "";

        const itemTotal = product.price * item.quantity;

        total += itemTotal;

        return `
            <div class="cart-item">

                <div>
                    <h4>${product.name}</h4>

                    <div class="quantity-controls">

    <button
        onclick="decreaseQuantity(${item.id})"
    >
        −
    </button>

    <span>${item.quantity}</span>

    <button
        onclick="increaseQuantity(${item.id})"
    >
        +
    </button>

</div>

<p>
    ₹${Number(product.price).toLocaleString("en-IN")} each
</p>

                    <strong>
                        ₹${Number(itemTotal).toLocaleString("en-IN")}
                    </strong>
                </div>

                <button
                    class="remove-btn"
                    onclick="removeFromCart(${item.id})"
                >
                    Remove
                </button>

            </div>
        `;

    }).join("");

    document.getElementById("cart-total").textContent =
        `₹${Number(total).toLocaleString("en-IN")}`;
}
// ===============================
// CART QUANTITY CONTROLS
// ===============================

async function increaseQuantity(cartId) {

    const item = cartItems.find(item => item.id === cartId);

    if (!item) return;

    const product = products.find(
        product => product.id === item.productId
    );

    if (!product) return;

    if (item.quantity >= product.stock) {
        alert("No more stock available.");
        return;
    }

    item.quantity++;

    await updateCartQuantity(item);
}


async function decreaseQuantity(cartId) {

    const item = cartItems.find(item => item.id === cartId);

    if (!item) return;

    if (item.quantity <= 1) {
        await removeFromCart(cartId);
        return;
    }

    item.quantity--;

    await updateCartQuantity(item);
}


async function updateCartQuantity(item) {

    try {

        const response = await fetch(
            `${API}/cart/${item.id}`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    quantity: item.quantity
                })
            }
        );

        if (!response.ok) {
            alert("Unable to update quantity.");
            return;
        }

        await loadCart();

    } catch (error) {

        console.error("Quantity update error:", error);

        alert("Backend is not connected.");
    }
}


// ===============================
// REMOVE FROM CART
// ===============================

async function removeFromCart(id) {

    try {

        await fetch(`${API}/cart/${id}`, {
            method: "DELETE"
        });

        await loadCart();

    } catch (error) {

        console.error("Remove cart error:", error);
    }
}


// ===============================
// OPEN CART
// ===============================

function openCart() {

    document
        .getElementById("cart-drawer")
        .classList.add("open");

    document
        .getElementById("cart-overlay")
        .classList.add("open");

    loadCart();
}


// ===============================
// CLOSE CART
// ===============================

function closeCart() {

    document
        .getElementById("cart-drawer")
        .classList.remove("open");

    document
        .getElementById("cart-overlay")
        .classList.remove("open");
}


// ===============================
// CHECKOUT
// ===============================

async function checkout() {

    if (cartItems.length === 0) {

        alert("Your cart is empty.");

        return;
    }

    try {

        const response = await fetch(
            `${API}/orders/checkout?customerId=1`,
            {
                method: "POST"
            }
        );

        if (!response.ok) {

            alert("Checkout failed. Please try again.");

            return;
        }

        const order = await response.json();

        closeCart();

        await loadCart();

        showToast(
            `Order #${order.id} placed successfully! 🎉`
        );

    } catch (error) {

        console.error("Checkout error:", error);

        alert("Backend is not connected.");
    }
}


// ===============================
// SEARCH
// ===============================

function searchProducts() {

    const searchText =
        document
            .getElementById("searchInput")
            .value
            .toLowerCase();

    const filtered = products.filter(product =>

        product.name
            .toLowerCase()
            .includes(searchText)

        ||

        (product.description || "")
            .toLowerCase()
            .includes(searchText)

    );

    displayProducts(filtered);
}


// ===============================
// CATEGORY FILTER
// ===============================

function filterCategory(category) {

    if (category === "All") {

        displayProducts(products);

        return;
    }

    const filtered = products.filter(product => {

        const name = product.name.toLowerCase();

        if (category === "Electronics") {
            return (
                name.includes("laptop") ||
                name.includes("phone") ||
                name.includes("mobile") ||
                name.includes("camera") ||
                name.includes("headphone") ||
                name.includes("watch")
            );
        }

        if (category === "Fashion") {
            return (
                name.includes("shirt") ||
                name.includes("shoe") ||
                name.includes("dress") ||
                name.includes("jeans")
            );
        }

        if (category === "Home") {
            return (
                name.includes("chair") ||
                name.includes("table") ||
                name.includes("home")
            );
        }

        return true;
    });

    displayProducts(filtered);

    document
        .getElementById("products")
        .scrollIntoView({
            behavior: "smooth"
        });
}


// ===============================
// SCROLL TO PRODUCTS
// ===============================

function scrollToProducts() {

    document
        .getElementById("products")
        .scrollIntoView({
            behavior: "smooth"
        });
}


// ===============================
// TOAST
// ===============================

function showToast(message) {

    const toast = document.getElementById("toast");

    toast.textContent = message;

    toast.classList.add("show");

    setTimeout(() => {

        toast.classList.remove("show");

    }, 2500);
}


// ===============================
// START APPLICATION
// ===============================

loadProducts();

loadCart();
updateWishlistCount();