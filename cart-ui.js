// ===============================
// ✅ CART-UI.JS — Handles cart display, modal, localStorage, and checkout
// ===============================

document.addEventListener("DOMContentLoaded", () => {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const cartCount = document.getElementById("cart-count");
    const cartItemsContainer = document.getElementById("cart-items");
    const cartTotalEl = document.getElementById("cart-total");
    const cartModal = document.getElementById("cart-modal");
    const overlay = document.getElementById("cart-overlay");
    const cartIcon = document.getElementById("cart-icon");
    const closeCartBtn = document.getElementById("close-cart");

    // 🧮 Update cart count in nav
    function updateCartCount() {
        const count = cart.reduce((sum, item) => sum + item.qty, 0);
        if (cartCount) cartCount.textContent = count;
    }

    // 🧾 Render cart items in modal
    function renderCart() {
        if (!cartItemsContainer) return;
        cartItemsContainer.innerHTML = "";
        let total = 0;

        cart.forEach((item, index) => {
            total += item.price * item.qty;
            const div = document.createElement("div");
            div.classList.add("cart-item");
            div.innerHTML = `
                <div class="cart-item-info">
                    <span>${item.name}</span>
                    <small>GHS ${item.price} × ${item.qty}</small>
                </div>
                <button class="remove-btn" data-index="${index}">❌</button>
            `;
            cartItemsContainer.appendChild(div);
        });

        if (cartTotalEl) cartTotalEl.textContent = total.toFixed(2);
        localStorage.setItem("cart", JSON.stringify(cart));
        updateCartCount();
    }

    // ➕ Add to cart
    document.querySelectorAll(".add-to-cart").forEach((btn) => {
        btn.addEventListener("click", () => {
            const name = btn.dataset.name;
            const price = parseFloat(btn.dataset.price);
            const img = btn.dataset.img;
            const existing = cart.find((item) => item.name === name);

            if (existing) {
                existing.qty += 1;
            } else {
                cart.push({ name, price, img, qty: 1 });
            }

            renderCart();
        });
    });

    // ❌ Remove item
    if (cartItemsContainer) {
        cartItemsContainer.addEventListener("click", (e) => {
            if (e.target.classList.contains("remove-btn")) {
                const index = parseInt(e.target.dataset.index);
                cart.splice(index, 1);
                renderCart();
            }
        });
    }

    // 🧹 Clear entire cart
    window.clearCart = function (skipConfirm = false) {
        const modal = document.getElementById("confirm-modal");

        if (!cart.length) {
            showToast("Your cart is already empty 🛒");
            return;
        }

        if (!skipConfirm) {
            if (!modal) return console.error("Confirm modal not found in DOM.");
            modal.classList.remove("hidden");

            const yesBtn = document.getElementById("confirm-yes");
            const noBtn = document.getElementById("confirm-no");

            yesBtn.onclick = () => {
                cart.length = 0;
                localStorage.removeItem("cart");
                renderCart();

                modal.classList.add("hidden");
                cartModal?.classList.remove("active");
                overlay?.classList.remove("active");

                showToast("Cart cleared successfully ✅");
            };

            noBtn.onclick = () => {
                modal.classList.add("hidden");
            };
        } else {
            // ✅ Skip confirm modal (for successful payment)
            cart.length = 0;
            localStorage.removeItem("cart");
            renderCart();
        }
    };

    // 🔔 Toast helper
    function showToast(message) {
        let toast = document.getElementById("toast-message");
        if (!toast) {
            toast = document.createElement("div");
            toast.id = "toast-message";
            document.body.appendChild(toast);
        }

        toast.textContent = message;
        toast.className = "show";

        setTimeout(() => {
            toast.className = toast.className.replace("show", "");
        }, 3000);
    }

    // 🧺 Toggle cart modal
    function toggleCart() {
        cartModal?.classList.toggle("active");
        overlay?.classList.toggle("active");
        document.body.style.overflow =
            cartModal?.classList.contains("active") ? "hidden" : "auto";
    }

    cartIcon?.addEventListener("click", toggleCart);
    closeCartBtn?.addEventListener("click", toggleCart);
    overlay?.addEventListener("click", toggleCart);

    // 🧭 Expose helper functions globally
    window.cartUI = {
        renderCart,
        toggleCart,
        updateCartCount,
        clearCart,
    };

    renderCart();
});

// ===============================
// 💳 CHECKOUT LOGIC
// ===============================

function getCartItems() {
    return JSON.parse(localStorage.getItem("cart")) || [];
}

function calculateCartTotal() {
    const cart = getCartItems();
    return cart.reduce((sum, item) => sum + item.price * item.qty, 0);
}

// 🔔 Reuse toast
function showModalMessage(msg) {
    let toast = document.getElementById("toast-message");
    if (!toast) {
        toast = document.createElement("div");
        toast.id = "toast-message";
        document.body.appendChild(toast);
    }

    toast.textContent = msg;
    toast.className = "show";
    setTimeout(() => (toast.className = ""), 3000);
}

// 🛒 Checkout
function checkoutCart() {
    const cartItems = getCartItems();

    if (cartItems.length === 0) {
        showModalMessage("Your cart is empty 🛒");
        return;
    }

    const emailModal = document.getElementById("email-modal");
    emailModal?.classList.remove("hidden");
    document.body.style.overflow = "hidden";
}

// 📩 Handle email modal actions
const emailCancel = document.getElementById("email-cancel");
const emailConfirm = document.getElementById("email-confirm");

emailCancel?.addEventListener("click", () => {
    const emailModal = document.getElementById("email-modal");
    if (emailModal) emailModal.classList.add("hidden");
    document.body.style.overflow = "auto";
});

emailConfirm?.addEventListener("click", () => {
    const emailInput = document.getElementById("user-email");
    const email = emailInput?.value.trim();

    if (!email) {
        showModalMessage("Please enter your email before continuing.");
        return;
    }

    // ✅ Close email modal immediately and permanently
    const emailModal = document.getElementById("email-modal");
    if (emailModal) {
        emailModal.classList.add("hidden");
        emailModal.style.display = 'none';
    }
    document.body.style.overflow = "auto";

    const cartItems = getCartItems();
    const total = calculateCartTotal();

    // 💳 Initialize Paystack with cart metadata FOR WEBHOOK
    const handler = PaystackPop.setup({
        key: "pk_live_91d7ab8a3d0335106dea01bd7435b623b9e73099",
        email: email,
        amount: total * 100,
        currency: "GHS",
        metadata: {
            custom_fields: [
                {
                    display_name: "Cart Items",
                    variable_name: "cart_items",
                    value: JSON.stringify(cartItems) // ← THIS IS CRITICAL FOR YOUR WEBHOOK
                }
            ]
        },
        callback: function (response) {
            console.log("Payment initiated. Reference:", response.reference);

            // ✅ Clear cart immediately (optimistic approach)
            if (window.cartUI && typeof window.cartUI.clearCart === "function") {
                window.cartUI.clearCart(true);
            }

            // ✅ Close all modals
            const cartModal = document.getElementById("cart-modal");
            const overlay = document.getElementById("cart-overlay");
            [cartModal, overlay].forEach(modal => {
                if (modal) modal.classList.remove("active", "hidden");
            });

            document.body.style.overflow = "auto";
            showModalMessage(`Payment successful! Ref: ${response.reference}. You will receive a confirmation email shortly.`);
        },
        onClose: function () {
            showModalMessage("Payment canceled. You can try again.");
        }
    });

    handler.openIframe();
});