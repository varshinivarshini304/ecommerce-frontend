const siteHeader = document.querySelector('.site-header');
const menuToggle = document.querySelector('.menu-toggle');
const mobileMenu = document.querySelector('.mobile-menu');
const productGrid = document.getElementById('productGrid');

const apiURL = 'https://fakestoreapi.com/products?limit=8';
const cacheKey = 'shopEaseProducts';
const cacheExpiryKey = 'shopEaseProductsExpiry';
const cacheTTL = 1000 * 60 * 15; // 15 minutes

// Firebase Auth State Management
function initAuthState() {
    if (typeof firebase !== 'undefined' && firebase.auth) {
        firebase.auth().onAuthStateChanged((user) => {
            updateAuthUI(user);
        });
    }
}

function updateAuthUI(user) {
    const authLink = document.getElementById('auth-link');
    const mobileAuthLink = document.getElementById('mobile-auth-link');

    if (user) {
        // User is signed in
        const displayName = user.displayName || user.email.split('@')[0];
        authLink.innerHTML = `
            <div class="user-menu">
                <span>Welcome, ${displayName}</span>
                <button id="logout-btn" class="logout-btn">Logout</button>
            </div>
        `;
        mobileAuthLink.innerHTML = `<button id="mobile-logout-btn" class="logout-btn">Logout</button>`;

        // Add logout event listeners
        document.getElementById('logout-btn').addEventListener('click', handleLogout);
        const mobileLogout = document.getElementById('mobile-logout-btn');
        if (mobileLogout) {
            mobileLogout.addEventListener('click', handleLogout);
        }
    } else {
        // User is signed out
        authLink.innerHTML = '<a href="auth.html">Sign In</a>';
        mobileAuthLink.innerHTML = '<a href="auth.html">Sign In</a>';
    }
}

async function handleLogout() {
    try {
        await firebase.auth().signOut();
        localStorage.removeItem('shopEaseUser');
        alert('You have been logged out successfully.');
    } catch (error) {
        console.error('Logout error:', error);
        alert('Error logging out. Please try again.');
    }
}

const fallbackProducts = [
    {
        id: 1,
        title: 'Classic White Sneakers',
        price: 59.99,
        description: 'Clean and comfortable everyday sneakers.',
        image: 'https://via.placeholder.com/400x400?text=Sneakers'
    },
    {
        id: 2,
        title: 'Eco Tote Bag',
        price: 24.99,
        description: 'Reusable tote for shopping and daily use.',
        image: 'https://via.placeholder.com/400x400?text=Tote+Bag'
    },
    {
        id: 3,
        title: 'Wireless Headphones',
        price: 89.99,
        description: 'High-quality sound with long battery life.',
        image: 'https://via.placeholder.com/400x400?text=Headphones'
    },
    {
        id: 4,
        title: 'Minimalist Watch',
        price: 129.99,
        description: 'Sleek watch for everyday style.',
        image: 'https://via.placeholder.com/400x400?text=Watch'
    },
    {
        id: 5,
        title: 'Organic Skincare Set',
        price: 39.99,
        description: 'Gentle care for radiant skin.',
        image: 'https://via.placeholder.com/400x400?text=Skincare'
    },
    {
        id: 6,
        title: 'Travel Backpack',
        price: 69.99,
        description: 'Durable pack for daily adventures.',
        image: 'https://via.placeholder.com/400x400?text=Backpack'
    },
    {
        id: 7,
        title: 'Smart Mug',
        price: 34.99,
        description: 'Keeps your drink warm while you work.',
        image: 'https://via.placeholder.com/400x400?text=Smart+Mug'
    },
    {
        id: 8,
        title: 'Desk Plant',
        price: 19.99,
        description: 'Fresh greenery for a brighter workspace.',
        image: 'https://via.placeholder.com/400x400?text=Desk+Plant'
    }
];

function createProductCard(product) {
    const card = document.createElement('article');
    card.className = 'product-card';

    const imageLink = document.createElement('a');
    imageLink.className = 'product-link';
    imageLink.href = `product.html?id=${product.id}`;

    const image = document.createElement('img');
    image.className = 'product-image lazy-img';
    image.alt = product.title;
    image.loading = 'lazy';

    // Defer actual loading: store sources in data-* attributes for the lazy loader
    image.setAttribute('data-src', product.image);
    image.setAttribute('data-srcset', `
        ${product.image.replace('400x400', '300x300')} 300w,
        ${product.image.replace('400x400', '400x400')} 400w,
        ${product.image.replace('400x400', '600x600')} 600w
    `);
    image.sizes = '(max-width: 640px) 300px, (max-width: 1024px) 400px, 600px';
    
    imageLink.appendChild(image);
    card.appendChild(imageLink);

    const details = document.createElement('div');
    details.className = 'product-details';

    const title = document.createElement('h3');
    title.className = 'product-title';

    const titleLink = document.createElement('a');
    titleLink.className = 'product-link';
    titleLink.href = `product.html?id=${product.id}`;
    titleLink.textContent = product.title;
    title.appendChild(titleLink);
    details.appendChild(title);

    const description = document.createElement('p');
    description.textContent = product.description;
    details.appendChild(description);

    const price = document.createElement('p');
    price.className = 'product-price';
    price.textContent = `$${product.price.toFixed(2)}`;
    details.appendChild(price);

    const button = document.createElement('button');
    button.className = 'add-to-cart';
    button.type = 'button';
    button.textContent = 'Add to Cart';
    button.dataset.productId = String(product.id);
    button.dataset.productTitle = product.title;
    button.dataset.productPrice = String(product.price);
    button.dataset.productImage = product.image;
    details.appendChild(button);

    card.appendChild(details);
    return card;
}

function renderProducts(products) {
    if (!productGrid) return;
    productGrid.innerHTML = '';
    products.forEach((product) => {
        productGrid.appendChild(createProductCard(product));
    });
    initializeCartButtons();
}

function getCachedProducts() {
    try {
        const rawData = localStorage.getItem(cacheKey);
        const expiry = Number(localStorage.getItem(cacheExpiryKey));
        if (!rawData || !expiry || Date.now() > expiry) {
            localStorage.removeItem(cacheKey);
            localStorage.removeItem(cacheExpiryKey);
            return null;
        }
        return JSON.parse(rawData);
    } catch {
        return null;
    }
}

function cacheProducts(products) {
    try {
        localStorage.setItem(cacheKey, JSON.stringify(products));
        localStorage.setItem(cacheExpiryKey, String(Date.now() + cacheTTL));
    } catch {
        // ignore storage errors
    }
}

function showPlaceholder(message = 'Loading products...') {
    if (!productGrid) return;
    productGrid.innerHTML = `
        <div class="product-card loading-card">
            <div class="spinner"></div>
            <p>${message}</p>
        </div>
    `;
}

function showErrorMessage(message) {
    if (!productGrid) return;
    productGrid.innerHTML = `
        <div class="product-card error-card">
            <p>${message}</p>
        </div>
    `;
}

const cartBadge = document.querySelector('.cart-badge');

function getCartItems() {
    try {
        return JSON.parse(localStorage.getItem('shopEaseCart') || '[]');
    } catch {
        return [];
    }
}

function setCartItems(items) {
    try {
        localStorage.setItem('shopEaseCart', JSON.stringify(items));
    } catch {
        // ignore storage errors
    }
}

function updateCartCount() {
    const count = getCartItems().reduce((total, item) => total + item.quantity, 0);
    if (cartBadge) {
        cartBadge.textContent = String(count);
    }
}

function findCartItem(cart, productId, selectedOptions) {
    return cart.find((item) => {
        if (item.id !== productId) return false;
        const optionsA = JSON.stringify(item.options || {});
        const optionsB = JSON.stringify(selectedOptions || {});
        return optionsA === optionsB;
    });
}

function addProductToCart(product, selectedOptions = {}, quantity = 1) {
    const cart = getCartItems();
    const existing = findCartItem(cart, product.id, selectedOptions);
    if (existing) {
        existing.quantity += quantity;
    } else {
        cart.push({
            id: product.id,
            title: product.title,
            price: product.price,
            image: product.image || '',
            quantity,
            options: selectedOptions || {}
        });
    }
    setCartItems(cart);
    updateCartCount();
}

function initializeCartButtons() {
    if (!productGrid) return;
    const buttons = productGrid.querySelectorAll('.add-to-cart');
    buttons.forEach((button) => {
        button.addEventListener('click', () => {
            const productId = Number(button.dataset.productId);
            const productTitle = button.dataset.productTitle;
            const productPrice = Number(button.dataset.productPrice);
            const productImage = button.dataset.productImage || '';
            addProductToCart(
                { id: productId, title: productTitle, price: productPrice, image: productImage },
                {},
                1
            );
            button.textContent = 'Added';
            button.disabled = true;
            setTimeout(() => {
                button.disabled = false;
                button.textContent = 'Add to Cart';
            }, 900);
        });
    });
}

async function loadProducts() {
    if (!productGrid) return;
    showPlaceholder();
    const cachedProducts = getCachedProducts();
    if (cachedProducts) {
        renderProducts(cachedProducts);
    }

    try {
        const response = await fetch(apiURL);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const products = await response.json();
        if (!Array.isArray(products) || products.length === 0) {
            throw new Error('Invalid product data received');
        }
        cacheProducts(products);
        renderProducts(products);
    } catch (error) {
        console.warn('Failed to fetch products from API.', error);
        if (!cachedProducts) {
            showErrorMessage('Unable to load products. Showing sample items.');
            renderProducts(fallbackProducts);
        }
    }
}

function initializeCartNavigation() {
    const cartButton = document.querySelector('.cart-button');
    if (cartButton) {
        cartButton.addEventListener('click', () => {
            window.location.href = 'cart.html';
        });
    }
}

if (menuToggle && siteHeader) {
    menuToggle.addEventListener('click', () => {
        const isExpanded = siteHeader.classList.toggle('nav-open');
        menuToggle.setAttribute('aria-expanded', isExpanded.toString());
        menuToggle.setAttribute('aria-label', isExpanded ? 'Close navigation' : 'Open navigation');
        mobileMenu.setAttribute('aria-hidden', (!isExpanded).toString());
    });
}

window.addEventListener('DOMContentLoaded', () => {
    updateCartCount();
    initializeCartNavigation();
    loadProducts();
    initAuthState();
});

console.log('E-Commerce Website Loaded');
