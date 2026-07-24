const productContainer = document.getElementById("products");
const categoryButtons = document.querySelectorAll("#categories button");
const searchInput = document.getElementById("search");

const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightbox-img");
const closeBtn = document.getElementById("close");
const prevBtn = document.getElementById("prev");
const nextBtn = document.getElementById("next");

let allProducts = [];

let currentProduct = null;
let currentLightboxImage = 0;

let touchStartX = 0;
let touchEndX = 0;

// ===============================
// JSON
// ===============================

fetch("products.json")
    .then(response => response.json())
    .then(products => {

        allProducts = products;

        renderProducts(products);

    });

// ===============================
// Ürünleri çiz
// ===============================

function renderProducts(products) {

    productContainer.innerHTML = "";

    products.forEach(product => {

        let currentImage = 0;

        const card = document.createElement("div");

        card.className = "card";

        card.innerHTML = `

            <div class="image">

                <button class="arrow left">&#10094;</button>

                <img
                    src="images/${product.category}/${product.sku}/${product.images[0]}"
                    alt="${product.name}"
                >

                <button class="arrow right">&#10095;</button>

            </div>

            <div class="info">

                <h2>${product.name}</h2>

                <p class="sku">SKU : ${product.sku}</p>

                <p class="price">${product.price}</p>

            </div>

        `;

        const img = card.querySelector("img");

        img.addEventListener("touchstart", (e) => {

    touchStartX = e.changedTouches[0].screenX;

});

img.addEventListener("touchend", (e) => {

    touchEndX = e.changedTouches[0].screenX;

    handleSwipe();

});

function handleSwipe() {

    const distance = touchStartX - touchEndX;

    // sola kaydır
    if (distance > 50) {

        currentImage++;

        if (currentImage >= product.images.length)
            currentImage = 0;

        showImage();

    }

    // sağa kaydır
    if (distance < -50) {

        currentImage--;

        if (currentImage < 0)
            currentImage = product.images.length - 1;

        showImage();

    }

}

        const left = card.querySelector(".left");

        const right = card.querySelector(".right");

        // ---------------------

        function showImage() {

            img.src =
                `images/${product.category}/${product.sku}/${product.images[currentImage]}`;

        }

        // ---------------------

        right.addEventListener("click", (e) => {

            e.stopPropagation();

            currentImage++;

            if (currentImage >= product.images.length) {

                currentImage = 0;

            }

            showImage();

        });

        // ---------------------

        left.addEventListener("click", (e) => {

            e.stopPropagation();

            currentImage--;

            if (currentImage < 0) {

                currentImage = product.images.length - 1;

            }

            showImage();

        });

        // ---------------------
        // Lightbox
        // ---------------------

        img.addEventListener("click", () => {

            currentProduct = product;

            currentLightboxImage = currentImage;

            lightbox.style.display = "flex";

            lightboxImg.src =
                `images/${product.category}/${product.sku}/${product.images[currentLightboxImage]}`;

        });

        productContainer.appendChild(card);

    });

}

// ===============================
// Filtreleme
// ===============================

function filterProducts() {

    const search = searchInput.value.toLowerCase().trim();

    const activeCategory =
        document.querySelector("#categories .active").textContent.trim();

    let filtered = allProducts;

    if (activeCategory !== "Tümü") {

        filtered = filtered.filter(product =>
            product.category === activeCategory
        );

    }

    filtered = filtered.filter(product =>

        product.name.toLowerCase().includes(search) ||

        product.sku.toLowerCase().includes(search)

    );

    renderProducts(filtered);

}

// ===============================
// Kategoriler
// ===============================

categoryButtons.forEach(button => {

    button.addEventListener("click", () => {

        categoryButtons.forEach(btn =>
            btn.classList.remove("active")
        );

        button.classList.add("active");

        filterProducts();

    });

});

// ===============================
// Arama
// ===============================

searchInput.addEventListener("input", filterProducts);

// ===============================
// Lightbox Kapat
// ===============================

closeBtn.addEventListener("click", () => {

    lightbox.style.display = "none";

});

lightbox.addEventListener("click", e => {

    if (e.target === lightbox) {

        lightbox.style.display = "none";

    }

});

// ===============================
// Sonraki Foto
// ===============================

nextBtn.addEventListener("click", () => {

    if (!currentProduct) return;

    currentLightboxImage++;

    if (currentLightboxImage >= currentProduct.images.length) {

        currentLightboxImage = 0;

    }

    lightboxImg.src =
        `images/${currentProduct.category}/${currentProduct.sku}/${currentProduct.images[currentLightboxImage]}`;

});

// ===============================
// Önceki Foto
// ===============================

prevBtn.addEventListener("click", () => {

    if (!currentProduct) return;

    currentLightboxImage--;

    if (currentLightboxImage < 0) {

        currentLightboxImage = currentProduct.images.length - 1;

    }

    lightboxImg.src =
        `images/${currentProduct.category}/${currentProduct.sku}/${currentProduct.images[currentLightboxImage]}`;

});

lightboxImg.addEventListener("touchstart", (e) => {

    touchStartX = e.changedTouches[0].screenX;

});

lightboxImg.addEventListener("touchend", (e) => {

    touchEndX = e.changedTouches[0].screenX;

    const distance = touchStartX - touchEndX;

    // sola kaydır
    if (distance > 50) {

        currentLightboxImage++;

        if (currentLightboxImage >= currentProduct.images.length)
            currentLightboxImage = 0;

    }

    // sağa kaydır
    else if (distance < -50) {

        currentLightboxImage--;

        if (currentLightboxImage < 0)
            currentLightboxImage = currentProduct.images.length - 1;

    }

    lightboxImg.src =
        `images/${currentProduct.category}/${currentProduct.sku}/${currentProduct.images[currentLightboxImage]}`;

});