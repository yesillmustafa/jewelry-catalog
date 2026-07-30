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
let touchStartY = 0;

let touchEndX = 0;
let touchEndY = 0;

let touchCurrentY = 0;
let isDragging = false;
let isSliding = false;

const SWIPE_THRESHOLD = 50;
const CLOSE_THRESHOLD = 100;

function updateLightbox(){

    lightboxImg.src = currentProduct.images[currentLightboxImage];

    counter.textContent =
        `${currentLightboxImage + 1} / ${currentProduct.images.length}`;

}

function changeLightboxImage(direction){

    if(isSliding) return;

    isSliding = true;

    const offset = direction > 0 ? -80 : 80;

    // Çıkış
    lightboxImg.style.transform = `translateX(${offset}px)`;
    lightboxImg.style.opacity = "0";

    setTimeout(() => {

        currentLightboxImage += direction;

        if(currentLightboxImage >= currentProduct.images.length)
            currentLightboxImage = 0;

        if(currentLightboxImage < 0)
            currentLightboxImage = currentProduct.images.length - 1;

        updateLightbox();

        lightboxImg.style.transition = "none";
        lightboxImg.style.transform = `translateX(${-offset}px)`;

        lightboxImg.offsetHeight;

        lightboxImg.style.transition =
            "transform .25s ease, opacity .25s ease";

        requestAnimationFrame(() => {

            lightboxImg.style.transform = "translateX(0)";
            lightboxImg.style.opacity = "1";

        });

        setTimeout(() => {

            isSliding = false;

        },250);

    },125);

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

    document.body.style.overflow = "";

    lightboxImg.style.transform = "translateX(0)";
    lightbox.style.background = "rgba(0,0,0,.92)";

}

// ===============================
// JSON
// ===============================

fetch("products.json")
    .then(response => {
        if (!response.ok) {
            throw new Error("products.json yüklenemedi.");
        }
        return response.json();
    })
    .then(products => {
        allProducts = products;
        renderProducts(products);
    })
    .catch(error => {
        console.error(error);

        productContainer.innerHTML =
            "<p>Ürünler yüklenirken bir hata oluştu.</p>";
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
                    src="${product.images[0]}"
                    alt="${product.name}"
                >

                <button class="arrow right">&#10095;</button>

            </div>

            <div class="info">

                <h2>${product.name}</h2>

                <p class="sku">Ürün Kodu : ${product.sku}</p>

                <p class="price">
                    ${Number(product.price).toLocaleString("tr-TR")} ₺
                </p>

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

            img.src = product.images[currentImage];

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
        const toolbar = document.querySelector(".toolbar");

        const offset = toolbar.offsetHeight + 20;

        window.scrollTo({

            top: productContainer.offsetTop - offset,
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
    touchStartY = e.changedTouches[0].screenY;

    isDragging = false;

    lightboxImg.style.transition = "none";

}, { passive: true });

lightboxImg.addEventListener("touchmove", (e) => {

    touchCurrentY = e.changedTouches[0].screenY;

    const deltaY = touchCurrentY - touchStartY;
    const deltaX = e.changedTouches[0].screenX - touchStartX;

    // Dikey hareket baskınsa resmi parmakla birlikte sürükle
    if (Math.abs(deltaY) > Math.abs(deltaX)) {

        isDragging = true;

        lightboxImg.style.transform = `translateY(${deltaY}px)`;

        lightbox.style.background =
            `rgba(0,0,0,${0.92 - Math.min(Math.abs(deltaY) / 500, 0.5)})`;

    }

}, { passive: true });

lightboxImg.addEventListener("touchend", (e) => {

    touchEndX = e.changedTouches[0].screenX;
    touchEndY = e.changedTouches[0].screenY;

    const deltaX = touchStartX - touchEndX;
    const deltaY = touchEndY - touchStartY;

    lightboxImg.style.transition = "transform .25s ease";
    lightbox.style.transition = "background .25s ease";

    if (isDragging) {

        if (Math.abs(deltaY) > CLOSE_THRESHOLD) {

            closeLightbox();

        } else {

            lightboxImg.style.transform = "translateY(0)";
            lightbox.style.background = "rgba(0,0,0,.92)";

        }

        return;

    }

    // Sağa-sola swipe ile fotoğraf değiştir
    if (
        Math.abs(deltaX) > SWIPE_THRESHOLD &&
        Math.abs(deltaX) > Math.abs(deltaY)
    ) {

        if (deltaX > 0) {

            changeLightboxImage(1);

        } else {

            changeLightboxImage(-1);

        }

    }

}, { passive: true });