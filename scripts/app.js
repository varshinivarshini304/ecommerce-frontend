const siteHeader = document.querySelector('.site-header');
const menuToggle = document.querySelector('.menu-toggle');
const mobileMenu = document.querySelector('.mobile-menu');
const productGrid = document.getElementById('productGrid');

const apiURL = 'https://fakestoreapi.com/products?limit=8';
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

    const image = document.createElement('img');
    image.className = 'product-image';
    image.src = product.image;
    image.alt = product.title;
    image.loading = 'lazy';
    card.appendChild(image);

    const details = document.createElement('div');
    details.className = 'product-details';

    const title = document.createElement('h3');
    title.className = 'product-title';
    title.textContent = product.title;
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
}

async function loadProducts() {
    if (!productGrid) return;
    try {
        const response = await fetch(apiURL);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const products = await response.json();
        renderProducts(products);
    } catch (error) {
        console.warn('Failed to fetch products, using fallback.', error);
        renderProducts(fallbackProducts);
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
    loadProducts();
});

console.log('E-Commerce Website Loaded');
