// Product Data: 9 items (including 5 Apparel/Clothing items)
const products = [
  {
    id: 1,
    title: "Headphones",
    category: "Electronics",
    price: 199.99,
    oldPrice: 249.99,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80"
  },
  {
    id: 2,
    title: "Digital  Watch",
    category: "Accessories",
    price: 150.00,
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80"
  },
  {
    id: 3,
    title: "Performance Running Sneakers",
    category: "Footwear",
    price: 500.00,
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&q=80"
  },
  {
    id: 4,
    title: "Vintage Leather Jacket",
    category: "Cloths",
    price: 1800.00,
    image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500&q=80"
  },
  {
    id: 5,
    title: "Classic Jacket",
    category: "Cloths",
    price: 899.99,
    oldPrice: 110.00,
    image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=500&q=80"
  },
  {
    id: 6,
    title: " Cotton T-Shirt",
    category: "Cloths",
    price: 299.99,
    image: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=500&q=80"
  },
  {
    id: 7,
    title: "Slim Fit  Pants",
    category: "Cloths",
    price: 399.99,
    image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=500&q=80"
  },
  {
    id: 8,
    title: " Complete wear",
    category: "Cloths",
    price: 1500.99,
    image: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=500&q=80"
  },
  {
    id: 9,
    title: " Winter Sweater",
    category: "Cloths",
    price: 699.99,
    image: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=500&q=80"
  }
];

// Application State
let cart = JSON.parse(localStorage.getItem("shop_cart")) || [];
// Calculate max and min prices dynamically from product list
const maxAvailablePrice = Math.ceil(Math.max(...products.map(p => p.price)));
const minAvailablePrice = Math.floor(Math.min(...products.map(p => p.price)));

let activeFilters = {
  search: "",
  categories: ["All Products"], // Default is all
  maxPrice: maxAvailablePrice
};

// DOM Elements
const productGrid = document.querySelector(".product-grid");
const searchInput = document.querySelector(".search-bar input");
const searchBtn = document.querySelector(".search-bar button");
const categoryCheckboxes = document.querySelectorAll(".filter-list input[type='checkbox']");
const priceSlider = document.querySelector(".price-filter input[type='range']");
const priceDisplay = document.querySelector(".price-filter span");
const cartBadge = document.querySelector(".cart-badge");
const cartBtn = document.querySelector(".cart-btn");
const cartDrawer = document.getElementById("cart-drawer");
const cartOverlay = document.getElementById("cart-overlay");
const closeCartBtn = document.getElementById("close-cart");
const cartItemsContainer = document.querySelector(".cart-items");
const cartTotalDisplay = document.querySelector(".cart-total-value");
const checkoutBtn = document.getElementById("checkout-btn");
const toastContainer = document.getElementById("toast-container");

// Initialize Application
document.addEventListener("DOMContentLoaded", () => {
  // Dynamically configure price slider based on product data
  priceSlider.min = minAvailablePrice;
  priceSlider.max = maxAvailablePrice;
  priceSlider.value = maxAvailablePrice;
  priceDisplay.textContent = `Under ₹${maxAvailablePrice.toFixed(2)}`;

  renderProducts();
  updateCartUI();
  setupEventListeners();
});

// Setup Event Listeners
function setupEventListeners() {
  // Search
  searchInput.addEventListener("input", (e) => {
    activeFilters.search = e.target.value.trim().toLowerCase();
    renderProducts();
  });
  
  searchBtn.addEventListener("click", () => {
    activeFilters.search = searchInput.value.trim().toLowerCase();
    renderProducts();
  });

  // Categories
  categoryCheckboxes.forEach((checkbox, index) => {
    checkbox.addEventListener("change", (e) => {
      const categoryName = e.target.parentElement.textContent.trim();
      
      if (categoryName === "All Products") {
        if (e.target.checked) {
          // Uncheck all others
          categoryCheckboxes.forEach((cb, idx) => {
            if (idx !== 0) cb.checked = false;
          });
          activeFilters.categories = ["All Products"];
        } else {
          // Ensure at least one category or all is selected
          e.target.checked = true;
        }
      } else {
        // A specific category was toggled
        if (e.target.checked) {
          // Uncheck "All Products"
          categoryCheckboxes[0].checked = false;
          // Add to active categories
          activeFilters.categories = activeFilters.categories.filter(c => c !== "All Products");
          activeFilters.categories.push(categoryName);
        } else {
          // Remove from active categories
          activeFilters.categories = activeFilters.categories.filter(c => c !== categoryName);
          // If none checked, default back to All Products
          if (activeFilters.categories.length === 0) {
            categoryCheckboxes[0].checked = true;
            activeFilters.categories = ["All Products"];
          }
        }
      }
      renderProducts();
    });
  });

  // Price Slider
  priceSlider.addEventListener("input", (e) => {
    const val = parseFloat(e.target.value);
    activeFilters.maxPrice = val;
    priceDisplay.textContent = `Under ₹${val.toFixed(2)}`;
    renderProducts();
  });

  // Drawer Toggle
  cartBtn.addEventListener("click", (e) => {
    e.preventDefault();
    openCart();
  });
  
  closeCartBtn.addEventListener("click", closeCart);
  cartOverlay.addEventListener("click", closeCart);

  // Add to Cart Delegation
  productGrid.addEventListener("click", (e) => {
    if (e.target.classList.contains("add-to-cart-btn")) {
      const productId = parseInt(e.target.dataset.id);
      addToCart(productId);
    }
  });

  // Cart operations (Quantity adjust & Delete)
  cartItemsContainer.addEventListener("click", (e) => {
    const id = parseInt(e.target.dataset.id);
    if (e.target.classList.contains("qty-btn-plus")) {
      updateQuantity(id, 1);
    } else if (e.target.classList.contains("qty-btn-minus")) {
      updateQuantity(id, -1);
    } else if (e.target.classList.contains("remove-item-btn") || e.target.closest(".remove-item-btn")) {
      const targetId = id || parseInt(e.target.closest(".remove-item-btn").dataset.id);
      removeFromCart(targetId);
    }
  });

  // Route handling for checkout vs catalog
  function handleRouting() {
    const hash = window.location.hash;
    const shopView = document.getElementById("shop-view");
    const checkoutView = document.getElementById("checkout-view");

    if (hash === "#/checkout") {
      if (cart.length === 0) {
        window.location.hash = "/";
        return;
      }
      closeCart();
      shopView.classList.add("hidden");
      checkoutView.classList.remove("hidden");
      window.scrollTo({ top: 0, behavior: "smooth" });
      
      const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      document.getElementById("payable-amount").textContent = `₹${totalAmount.toFixed(2)}`;
    } else {
      checkoutView.classList.add("hidden");
      shopView.classList.remove("hidden");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  // Hash-based Routing Trigger
  window.addEventListener("hashchange", handleRouting);
  handleRouting(); // check on load

  // Checkout button click updates Hash
  checkoutBtn.addEventListener("click", () => {
    if (cart.length === 0) {
      showToast("Your cart is empty!", "error");
      return;
    }
    window.location.hash = "/checkout";
  });

  // Back to Shop button updates Hash
  document.getElementById("back-to-shop-btn").addEventListener("click", () => {
    window.location.hash = "/";
  });

  // Success overlay button close updates Hash
  document.getElementById("close-success-btn").addEventListener("click", () => {
    document.getElementById("success-overlay").classList.remove("active");
    window.location.hash = "/";
  });

  // Copy buttons
  const copyButtons = document.querySelectorAll(".copy-btn");
  copyButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const targetId = btn.dataset.target;
      const textToCopy = document.getElementById(targetId).textContent;
      
      navigator.clipboard.writeText(textToCopy).then(() => {
        showToast("Copied successfully!", "success");
      }).catch(err => {
        showToast("Failed to copy!", "error");
      });
    });
  });

  // Checkout Form submit
  const checkoutForm = document.getElementById("checkout-form");
  checkoutForm.addEventListener("submit", (e) => {
    e.preventDefault();
    if (validateCheckoutForm()) {
      submitOrder();
    }
  });

  function validateCheckoutForm() {
    let isValid = true;

    // Reset error states
    const inputs = checkoutForm.querySelectorAll("input, textarea");
    inputs.forEach(input => {
      input.classList.remove("invalid-input");
      const errorMsg = document.getElementById(`${input.id}-error`);
      if (errorMsg) errorMsg.classList.remove("show");
    });

    // Name
    const name = document.getElementById("full-name");
    if (!name.value.trim()) {
      showInputError(name);
      isValid = false;
    }

    // Phone
    const phone = document.getElementById("phone-number");
    const phonePattern = /^[0-9]{10}$/;
    if (!phonePattern.test(phone.value.trim())) {
      showInputError(phone);
      isValid = false;
    }

    // Email
    const email = document.getElementById("email-address");
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email.value.trim())) {
      showInputError(email);
      isValid = false;
    }

    // Address
    const address = document.getElementById("shipping-address");
    if (!address.value.trim()) {
      showInputError(address);
      isValid = false;
    }

    // State
    const state = document.getElementById("state");
    if (!state.value.trim()) {
      showInputError(state);
      isValid = false;
    }

    // District
    const district = document.getElementById("district");
    if (!district.value.trim()) {
      showInputError(district);
      isValid = false;
    }

    // City
    const city = document.getElementById("city");
    if (!city.value.trim()) {
      showInputError(city);
      isValid = false;
    }

    // Pincode
    const pincode = document.getElementById("pincode");
    const pinPattern = /^[0-9]{6}$/;
    if (!pinPattern.test(pincode.value.trim())) {
      showInputError(pincode);
      isValid = false;
    }

    // Transaction ID Check
    const transactionId = document.getElementById("transaction-id");
    if (!transactionId.value.trim()) {
      showInputError(transactionId);
      isValid = false;
    }

    return isValid;
  }

  function showInputError(input) {
    input.classList.add("invalid-input");
    const errorMsg = document.getElementById(`${input.id}-error`);
    if (errorMsg) errorMsg.classList.add("show");
  }

  function submitOrder() {
    const submitBtn = document.getElementById("submit-payment-btn");
    submitBtn.disabled = true;
    submitBtn.textContent = "Redirecting to WhatsApp...";

    const name = document.getElementById("full-name").value.trim();
    const phone = document.getElementById("phone-number").value.trim();
    const email = document.getElementById("email-address").value.trim();
    const address = document.getElementById("shipping-address").value.trim();
    const state = document.getElementById("state").value.trim();
    const district = document.getElementById("district").value.trim();
    const city = document.getElementById("city").value.trim();
    const pincode = document.getElementById("pincode").value.trim();
    const landmark = document.getElementById("landmark").value.trim() || "None";
    const transactionId = document.getElementById("transaction-id").value.trim();
    
    const submittedTime = new Date().toLocaleString();
    const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Format product details list
    const productListText = cart.map(item => `• ${item.title} (Qty: ${item.quantity}) - Rs. ${(item.price * item.quantity).toFixed(2)}`).join("\n");

    // Construct pre-filled WhatsApp message
    const whatsappMessage = `⚠️ *[CUSTOMER: Please attach your payment proof screenshot to this chat before sending this message!]*

🛒 *New Order Received - Hari Store*

*Customer Details:*
• *Name:* ${name}
• *Phone:* ${phone}
• *Email:* ${email}

*Shipping Address:*
• *Address:* ${address}
• *State:* ${state}
• *District:* ${district}
• *City:* ${city}
• *Pincode:* ${pincode}
• *Landmark:* ${landmark}

*Order Details:*
${productListText}

*Total Paid:* Rs. ${totalAmount.toFixed(2)}
*Transaction ID:* ${transactionId}

*Submitted Time:* ${submittedTime}`;

    // Target contact number: 9344473472 (Country code 91)
    const OWNER_WHATSAPP = "919344473472";
    const encodedMessage = encodeURIComponent(whatsappMessage);
    const whatsappUrl = `https://api.whatsapp.com/send?phone=${OWNER_WHATSAPP}&text=${encodedMessage}`;

    // Redirect to WhatsApp
    window.open(whatsappUrl, "_blank");

    // Clear cart state
    cart = [];
    saveCart();
    updateCartUI();

    // Show Success Overlay Card
    document.getElementById("success-overlay").classList.add("add", "active");
    // Backup helper since classList can have different active transitions
    document.getElementById("success-overlay").classList.add("active");
    
    // Reset Form
    checkoutForm.reset();

    // Reset button state
    submitBtn.disabled = false;
    submitBtn.textContent = "Submit Payment Details";
  }
}

// Render Products with active filters
function renderProducts() {
  const filtered = products.filter(product => {
    // Search Filter
    const matchesSearch = product.title.toLowerCase().includes(activeFilters.search) || 
                          product.category.toLowerCase().includes(activeFilters.search);
    
    // Category Filter
    let matchesCategory = false;
    if (activeFilters.categories.includes("All Products")) {
      matchesCategory = true;
    } else {
      matchesCategory = activeFilters.categories.some(cat => product.category.toLowerCase() === cat.toLowerCase());
    }

    // Price Filter
    const matchesPrice = product.price <= activeFilters.maxPrice;

    return matchesSearch && matchesCategory && matchesPrice;
  });

  // Build HTML
  if (filtered.length === 0) {
    productGrid.innerHTML = `
      <div class="no-products">
        <p>No products match your filters.</p>
        <button onclick="resetFilters()" class="btn-primary">Reset Filters</button>
      </div>
    `;
    return;
  }

  productGrid.innerHTML = filtered.map(product => {
    const badgeHTML = product.badge ? `<span class="badge ${product.badge.toLowerCase()}">${product.badge}</span>` : "";
    const oldPriceHTML = product.oldPrice ? `<span class="old-price">₹${product.oldPrice.toFixed(2)}</span>` : "";
    
    return `
      <div class="product-card" data-id="${product.id}">
        <div class="image-wrapper">
          ${badgeHTML}
          <img src="${product.image}" alt="${product.title}" loading="lazy" />
        </div>
        <div class="product-details">
          <span class="category">${product.category}</span>
          <h4 class="title">${product.title}</h4>
          <div class="price-row">
            <span class="price">₹${product.price.toFixed(2)}</span>
            ${oldPriceHTML}
          </div>
          <button class="add-to-cart-btn" data-id="${product.id}">Add to Cart</button>
        </div>
      </div>
    `;
  }).join("");
}

// Reset Filters Action
window.resetFilters = function() {
  searchInput.value = "";
  activeFilters.search = "";
  
  categoryCheckboxes.forEach((cb, idx) => {
    cb.checked = idx === 0;
  });
  activeFilters.categories = ["All Products"];
  
  priceSlider.value = maxAvailablePrice;
  activeFilters.maxPrice = maxAvailablePrice;
  priceDisplay.textContent = `Under ₹${maxAvailablePrice.toFixed(2)}`;
  
  renderProducts();
};

// Cart Actions
function addToCart(productId) {
  const product = products.find(p => p.id === productId);
  if (!product) return;

  const existingItem = cart.find(item => item.id === productId);
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({
      ...product,
      quantity: 1
    });
  }

  saveCart();
  updateCartUI();
  showToast(`Added ${product.title} to cart!`, "success");
}

// Quantity adjuster
function updateQuantity(productId, amount) {
  const item = cart.find(item => item.id === productId);
  if (!item) return;

  item.quantity += amount;
  if (item.quantity <= 0) {
    removeFromCart(productId);
  } else {
    saveCart();
    updateCartUI();
  }
}

// Remove from cart
function removeFromCart(productId) {
  const item = cart.find(item => item.id === productId);
  cart = cart.filter(item => item.id !== productId);
  saveCart();
  updateCartUI();
  if (item) {
    showToast(`Removed ${item.title} from cart`, "info");
  }
}

// Save cart to localstorage
function saveCart() {
  localStorage.setItem("shop_cart", JSON.stringify(cart));
}

// Update UI
function updateCartUI() {
  const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  cartBadge.textContent = totalCount;
  
  if (cart.length === 0) {
    cartItemsContainer.innerHTML = `
      <div class="empty-cart-message">
        <p>Your cart is empty.</p>
        <button onclick="closeCart()" class="btn-primary" style="margin-top: 1rem;">Continue Shopping</button>
      </div>
    `;
    cartTotalDisplay.textContent = "₹0.00";
    return;
  }

  cartItemsContainer.innerHTML = cart.map(item => `
    <div class="cart-item">
      <img src="${item.image}" alt="${item.title}" class="cart-item-image" />
      <div class="cart-item-details">
        <h5 class="cart-item-title">${item.title}</h5>
        <div class="cart-item-price-qty">
          <span class="cart-item-price">₹${item.price.toFixed(2)}</span>
          <div class="quantity-controls">
            <button class="qty-btn-minus" data-id="${item.id}">-</button>
            <span class="qty-display">${item.quantity}</span>
            <button class="qty-btn-plus" data-id="${item.id}">+</button>
          </div>
        </div>
      </div>
      <button class="remove-item-btn" data-id="${item.id}" title="Remove item">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </div>
  `).join("");

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  cartTotalDisplay.textContent = `₹${total.toFixed(2)}`;
}

// Drawer Toggle
function openCart() {
  cartDrawer.classList.add("active");
  cartOverlay.classList.add("active");
  document.body.style.overflow = "hidden";
}

function closeCart() {
  cartDrawer.classList.remove("active");
  cartOverlay.classList.remove("active");
  document.body.style.overflow = "";
}

// Toast Messages
function showToast(message, type = "success") {
  const toast = document.createElement("div");
  toast.classList.add("toast", type);
  
  let icon = "";
  if (type === "success") {
    icon = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`;
  } else if (type === "error") {
    icon = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`;
  } else {
    icon = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`;
  }

  toast.innerHTML = `
    <span class="toast-icon">${icon}</span>
    <span class="toast-message">${message}</span>
  `;
  
  toastContainer.appendChild(toast);
  
  setTimeout(() => {
    toast.classList.add("show");
  }, 10);

  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 3000);
}
