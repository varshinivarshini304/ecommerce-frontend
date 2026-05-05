const apiURL = 'https://fakestoreapi.com/products';
const cacheKey = 'shopEaseProducts';
const cacheExpiryKey = 'shopEaseProductsExpiry';
const cacheTTL = 1000 * 60 * 15;

const detailPlaceholder = document.getElementById('detailPlaceholder');
const cartBadge = document.querySelector('.cart-badge');
const siteHeader = document.querySelector('.site-header');
const menuToggle = document.querySelector('.menu-toggle');
const mobileMenu = document.querySelector('.mobile-menu');
const minQuantity = 1;
const maxQuantity = 10;

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

function showDetailLoading(message = 'Loading product details...') {
    if (!detailPlaceholder) return;
    detailPlaceholder.innerHTML = `
        <div class="product-card loading-card">
            <div class="spinner"></div>
            <p>${message}</p>
        </div>
    `;
}

function showDetailError(message = 'Unable to load product.') {
    if (!detailPlaceholder) return;
    detailPlaceholder.innerHTML = `
        <div class="product-card error-card">
            <p>${message}</p>
        </div>
    `;
}

function getProductOptions(product) {
    const category = String(product.category || '').toLowerCase();
    const options = [];

    if (category.includes('clothing') || category.includes("men's") || category.includes("women's") || category.includes('jewelery')) {
        options.push({
            label: 'Size',
            id: 'sizeSelect',
            values: ['Small', 'Medium', 'Large', 'XL'],
            extraPrice: {
                Small: 0,
                Medium: 0,
                Large: 0,
                XL: 5
            }
        });
        options.push({
            label: 'Color',
            id: 'colorSelect',
            values: ['Black', 'White', 'Blue', 'Olive'],
            extraPrice: {
                Black: 0,
                White: 0,
                Blue: 0,
                Olive: 0
            }
        });
    } else if (category.includes('electronics')) {
        options.push({
            label: 'Warranty',
            id: 'warrantySelect',
            values: ['1 Year', '2 Years', '3 Years'],
            extraPrice: {
                '1 Year': 0,
                '2 Years': 20,
                '3 Years': 35
            }
        });
    }

    return options;
}

function getSelectedOptions(optionGroups) {
    return optionGroups.reduce((selection, option) => {
        selection[option.id] = option.values[0];
        return selection;
    }, {});
}

function calculatePrice(product, selectedOptions, quantity) {
    let total = product.price;

    if (selectedOptions) {
        Object.keys(selectedOptions).forEach((key) => {
            const optionValue = selectedOptions[key];
            const optionGroup = getProductOptions(product).find((option) => option.id === key);
            if (optionGroup && optionGroup.extraPrice) {
                total += optionGroup.extraPrice[optionValue] || 0;
            }
        });
    }

    return total * quantity;
}

function findCartItem(cart, productId, selectedOptions) {
    return cart.find((item) => {
        if (item.id !== productId) return false;
        const optionsA = JSON.stringify(item.options || {});
        const optionsB = JSON.stringify(selectedOptions || {});
        return optionsA === optionsB;
    });
}

function addProductToCart(product, selectedOptions, quantity) {
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

function renderRelatedProducts(products, currentId) {
    if (!detailPlaceholder) return;
    const relatedSection = document.createElement('div');
    relatedSection.className = 'related-products';
    relatedSection.innerHTML = '<h3>More to explore</h3>';

    const relatedGrid = document.createElement('div');
    relatedGrid.className = 'product-grid';

    products.filter((product) => product.id !== currentId).slice(0, 4).forEach((product) => {
        const card = document.createElement('article');
        card.className = 'product-card';

        const link = document.createElement('a');
        link.href = `product.html?id=${product.id}`;
        link.className = 'product-link';

        const image = document.createElement('img');
        image.className = 'product-image';
        image.src = product.image;
        image.alt = product.title;
        image.loading = 'lazy';
        image.srcset = `${product.image.replace('300x300', '200x200')} 200w, ${product.image.replace('300x300', '300x300')} 300w, ${product.image.replace('300x300', '400x400')} 400w`;
        image.sizes = '(max-width: 640px) 200px, (max-width: 1024px) 300px, 400px';
        link.appendChild(image);

        const title = document.createElement('h3');
        title.className = 'product-title';
        title.innerHTML = `<a class="product-link" href="product.html?id=${product.id}">${product.title}</a>`;

        const price = document.createElement('p');
        price.className = 'product-price';
        price.textContent = `$${product.price.toFixed(2)}`;

        card.appendChild(link);
        card.appendChild(title);
        card.appendChild(price);
        relatedGrid.appendChild(card);
    });

    relatedSection.appendChild(relatedGrid);
    const container = document.querySelector('.product-detail-page');
    if (container) {
        const existing = container.querySelector('.related-products');
        if (existing) {
            existing.remove();
        }
        container.appendChild(relatedSection);
    }
}

function renderProductDetail(product, relatedProducts = []) {
    if (!detailPlaceholder) return;

    const optionGroups = getProductOptions(product);
    const optionsMarkup = optionGroups.length
        ? `<div class="detail-options">${optionGroups.map((option) => `
                <label for="${option.id}">
                    ${option.label}
                    <select id="${option.id}">
                        ${option.values.map((value) => `<option value="${value}">${value}</option>`).join('')}
                    </select>
                </label>
            `).join('')}</div>`
        : '';

    const selectedOptions = getSelectedOptions(optionGroups);
    const basePrice = calculatePrice(product, selectedOptions, 1);

    detailPlaceholder.innerHTML = `
        <div class="detail-image-wrapper" id="detailImageWrapper">
            <img id="detailImage" class="detail-image" src="${product.image}" alt="${product.title}" loading="lazy" 
                 srcset="${product.image.replace('300x300', '400x400')} 400w, ${product.image.replace('300x300', '600x600')} 600w, ${product.image.replace('300x300', '800x800')} 800w"
                 sizes="(max-width: 640px) 400px, (max-width: 1024px) 600px, 800px" />
            <span class="zoom-hint">Hover to zoom</span>
        </div>
        <div class="detail-info">
            <p class="eyebrow">${product.category || 'Product'}</p>
            <h1 class="detail-title">${product.title}</h1>
            <p class="detail-price">$${product.price.toFixed(2)}</p>
            <p class="detail-description">${product.description}</p>
            ${optionsMarkup}
            <div class="quantity-selector">
                <button type="button" id="quantityDecrease" aria-label="Decrease quantity">−</button>
                <input id="detailQuantity" type="number" min="${minQuantity}" max="${maxQuantity}" value="1" aria-label="Product quantity" />
                <button type="button" id="quantityIncrease" aria-label="Increase quantity">+</button>
                <span class="detail-total-label">Total:</span>
                <span class="detail-total-price" id="detailTotalPrice">$${basePrice.toFixed(2)}</span>
            </div>
            <button class="add-to-cart detail-add" id="detailAddButton">Add to Cart</button>
            <div class="detail-feedback" id="detailFeedback" aria-live="polite"></div>
        </div>
    `;

    const detailImage = document.getElementById('detailImage');
    const detailImageWrapper = document.getElementById('detailImageWrapper');
    const feedback = document.getElementById('detailFeedback');
    const quantityInput = document.getElementById('detailQuantity');
    const decreaseButton = document.getElementById('quantityDecrease');
    const increaseButton = document.getElementById('quantityIncrease');
    const totalPriceLabel = document.getElementById('detailTotalPrice');
    const addButton = document.getElementById('detailAddButton');
    const optionInputs = optionGroups.map((option) => document.getElementById(option.id));

    function refreshPrice() {
        const currentQuantity = Number(quantityInput.value) || minQuantity;
        const currentOptions = optionInputs.reduce((selection, input) => {
            selection[input.id] = input.value;
            return selection;
        }, {});
        totalPriceLabel.textContent = `$${calculatePrice(product, currentOptions, currentQuantity).toFixed(2)}`;
        return currentOptions;
    }

    function updatePreview(currentOptions) {
        if (!detailImageWrapper) return;
        const color = currentOptions.colorSelect;
        detailImageWrapper.style.backgroundColor = color === 'Black'
            ? '#111'
            : color === 'White'
            ? '#f7f9fc'
            : color === 'Blue'
            ? '#e8f0ff'
            : color === 'Olive'
            ? '#eef4e8'
            : '#fafafa';
    }

    if (optionInputs.length) {
        optionInputs.forEach((input) => {
            input.addEventListener('change', () => {
                const currentOptions = refreshPrice();
                updatePreview(currentOptions);
            });
        });
    }

    if (quantityInput) {
        quantityInput.addEventListener('input', () => {
            let quantity = Number(quantityInput.value) || minQuantity;
            if (quantity < minQuantity) quantity = minQuantity;
            if (quantity > maxQuantity) quantity = maxQuantity;
            quantityInput.value = String(quantity);
            refreshPrice();
        });
    }

    if (decreaseButton) {
        decreaseButton.addEventListener('click', () => {
            let quantity = Number(quantityInput.value) || minQuantity;
            if (quantity > minQuantity) {
                quantity -= 1;
                quantityInput.value = String(quantity);
                refreshPrice();
            }
        });
    }

    if (increaseButton) {
        increaseButton.addEventListener('click', () => {
            let quantity = Number(quantityInput.value) || minQuantity;
            if (quantity < maxQuantity) {
                quantity += 1;
                quantityInput.value = String(quantity);
                refreshPrice();
            }
        });
    }

    if (detailImageWrapper) {
        detailImageWrapper.addEventListener('mousemove', (event) => {
            const rect = detailImageWrapper.getBoundingClientRect();
            const x = ((event.clientX - rect.left) / rect.width) * 100;
            const y = ((event.clientY - rect.top) / rect.height) * 100;
            if (detailImage) {
                detailImage.style.transformOrigin = `${x}% ${y}%`;
                detailImage.style.transform = 'scale(1.8)';
            }
        });

        detailImageWrapper.addEventListener('mouseleave', () => {
            if (detailImage) {
                detailImage.style.transform = 'scale(1)';
            }
        });

        detailImageWrapper.addEventListener('touchstart', () => {
            if (detailImage) {
                detailImage.classList.toggle('zoom-active');
            }
        });
    }

    if (addButton) {
        addButton.addEventListener('click', () => {
            const currentQuantity = Number(quantityInput.value) || minQuantity;
            const currentOptions = refreshPrice();
            addProductToCart(product, currentOptions, currentQuantity);
            addButton.textContent = 'Added to Cart';
            addButton.disabled = true;
            if (feedback) {
                feedback.textContent = `Added ${currentQuantity} item${currentQuantity > 1 ? 's' : ''} to cart.`;
            }
            setTimeout(() => {
                addButton.disabled = false;
                addButton.textContent = 'Add to Cart';
                if (feedback) {
                    feedback.textContent = '';
                }
            }, 1400);
        });
    }

    const initialOptions = refreshPrice();
    updatePreview(initialOptions);

    if (relatedProducts.length) {
        renderRelatedProducts(relatedProducts, product.id);
    }
}

function getProductId() {
    return Number(new URLSearchParams(window.location.search).get('id')) || null;
}

async function loadProductDetail() {
    const productId = getProductId();
    if (!productId) {
        showDetailError('No product selected.');
        return;
    }

    showDetailLoading();
    const cachedProducts = getCachedProducts();

    if (cachedProducts) {
        const cachedProduct = cachedProducts.find((product) => product.id === productId);
        if (cachedProduct) {
            renderProductDetail(cachedProduct, cachedProducts);
        }
    }

    try {
        const response = await fetch(`${apiURL}/${productId}`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const product = await response.json();
        if (!product || !product.id) {
            throw new Error('Invalid product data');
        }
        const relatedSource = cachedProducts || [];
        renderProductDetail(product, relatedSource);
    } catch (error) {
        console.warn('Product load failed.', error);
        if (!cachedProducts) {
            showDetailError('Unable to load product details at this time.');
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

function initializeMobileMenu() {
    if (!menuToggle || !siteHeader || !mobileMenu) return;
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
    initializeMobileMenu();
    loadProductDetail();
});
