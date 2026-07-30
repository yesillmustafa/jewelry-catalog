const productContainer = document.getElementById("products");
const categoryButtons = document.querySelectorAll("#categories button");
const searchInput = document.getElementById("search");

const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightbox-img");
const counter = document.querySelector(".lightbox-counter");

const closeBtn = document.getElementById("close");
const prevBtn = document.getElementById("prev");
const nextBtn = document.getElementById("next");

let allProducts = [];

let currentProduct = null;
let currentLightboxImage = 0;

let touchStartX = 0;
let touchEndX = 0;

function updateLightbox() {

    if (!currentProduct) return;

    lightboxImg.src =
        `images/${currentProduct.category}/${currentProduct.sku}/${currentProduct.images[currentLightboxImage]}`;

    counter.textContent =
        `${currentLightboxImage + 1} / ${currentProduct.images.length}`;

}

function changeLightboxImage(direction) {

    if (!currentProduct) return;

    currentLightboxImage += direction;

    if (currentLightboxImage >= currentProduct.images.length)
        currentLightboxImage = 0;

    if (currentLightboxImage < 0)
        currentLightboxImage =
            currentProduct.images.length - 1;

    updateLightbox();

}

function openLightbox(product, imageIndex = 0) {

    currentProduct = product;
    currentLightboxImage = imageIndex;

    document.body.style.overflow = "hidden";

    lightbox.classList.add("active");

    updateLightbox();

}

function closeLightbox(){

    lightbox.classList.remove("active");

    document.body.style.overflow="";

}

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
                    loading="lazy"
                    src="images/${product.category}/${product.sku}/${product.images[0]}"
                    alt="${product.name}"
                >

                <button class="arrow right">&#10095;</button>

            </div>

            <div class="info">

                <h2>${product.name}</h2>

                <p class="sku">Ürün Kodu : ${product.sku}</p>

                <p class="price">${product.price}</p>

            </div>

        `;

        const img = card.querySelector("img");
        const left = card.querySelector(".left");
        const right = card.querySelector(".right");

        // Tek fotoğraf varsa okları gizle
        if (product.images.length <= 1) {

            left.style.display = "none";
            right.style.display = "none";

        }

        // ---------------------
        // Fotoğrafı Güncelle
        // ---------------------

        function showImage() {

            img.src =
                `images/${product.category}/${product.sku}/${product.images[currentImage]}`;

        }

        // ---------------------
        // Sonraki Fotoğraf
        // ---------------------

        right.addEventListener("click", (e) => {

            e.preventDefault();
            e.stopPropagation();

            currentImage++;

            if (currentImage >= product.images.length) {

                currentImage = 0;

            }

            showImage();

        });

        // ---------------------
        // Önceki Fotoğraf
        // ---------------------

        left.addEventListener("click", (e) => {

            e.preventDefault();
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

           openLightbox(product, currentImage);
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

        // Ürünlerin başına yumuşak kaydır
        const products = document.getElementById("products");
        const toolbar = document.querySelector(".toolbar");

        const offset = toolbar.offsetHeight + 20;

        window.scrollTo({

            top: products.offsetTop - offset,
            behavior: "smooth"

        });

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

    closeLightbox();

});

lightbox.addEventListener("click", e => {

    if (e.target === lightbox) {

        closeLightbox();

    }

});

// ===============================
// Sonraki Foto
// ===============================

nextBtn.addEventListener("click", () => {

    changeLightboxImage(1);

});

// ===============================
// Önceki Foto
// ===============================

prevBtn.addEventListener("click", () => {

    changeLightboxImage(-1);

});

// ===============================
// Lightbox Klavye Destegi
// ===============================

document.addEventListener("keydown", (e) => {

    if (!lightbox.classList.contains("active")) return;

    switch (e.key) {

        case "ArrowRight":
            changeLightboxImage(1);
            break;

        case "ArrowLeft":
            changeLightboxImage(-1);
            break;

        case "Escape":
            closeLightbox();
            break;

    }

});

// ===============================
// Swipe
// ==========

lightboxImg.addEventListener("touchstart", (e) => {

    touchStartX = e.changedTouches[0].screenX;

}, { passive: true });

lightboxImg.addEventListener("touchend", (e) => {

    touchEndX = e.changedTouches[0].screenX;

    const distance = touchStartX - touchEndX;

    // Çok kısa hareketleri yok say
    if (Math.abs(distance) < 50) return;

    if (distance > 0) {

        changeLightboxImage(1);

    } else {

        changeLightboxImage(-1);

    }

}, { passive: true });