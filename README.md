# 💎 Marevia Jewelry Catalog

[![Live Catalog](https://img.shields.io/badge/Live-Catalog-gold?style=for-the-badge)](https://yesillmustafa.github.io/Marevia-Catalog/)

A personal jewelry catalog built with **HTML**, **CSS**, **Vanilla JavaScript**, **Notion API**, and **GitHub Actions**.

This project allows me to manage my jewelry collection through a Notion database while automatically publishing an up-to-date catalog with GitHub Pages.

---

## ✨ Features

- 📦 Product management with Notion
- 🔄 Automatic JSON generation
- 🖼️ Multiple images for each product
- 🔍 Live search
- 🏷️ Category filtering
- 📱 Responsive design
- 🔎 Fullscreen lightbox gallery
- 👆 Mobile swipe gestures
- ⌨️ Keyboard navigation
- ⚡ Lazy-loaded images

---

## 🏗️ Project Structure

```
.
├── assets/
├── images/
│   ├── Küpe/
│   ├── Kolye/
│   ├── Bileklik/
│   ├── Şahmeran/
│   └── Halhal/
│
├── scripts/
│   └── generate-products.js
│
├── .github/
│   └── workflows/
│       └── notion-sync.yml
│
├── products.json
├── index.html
├── style.css
├── script.js
├── package.json
└── README.md
```

---

## 🔄 Workflow

```
          Notion Database
                 │
                 ▼
      generate-products.js
                 │
                 ▼
          products.json
                 │
                 ▼
          GitHub Pages
```

Products are maintained in **Notion**.

Running the GitHub Action generates a new `products.json`, which is then used by the frontend to display the catalog.

---

## 📂 Product Images

Product images are stored inside the repository.

Example:

```
images/
└── Küpe/
    └── MKE0044/
        ├── 1.webp
        ├── 2.webp
        └── 3.webp
```

The folder name must match the product SKU.

---

## 📝 Product Information

The following fields are synchronized from Notion:

| Property | Description |
|----------|-------------|
| Ürün Adı | Product name |
| SKU | Product code |
| Kategori | Product category |
| Satış Fiyatı (TR) | Product price |

---

## ⚙️ Technologies

- HTML5
- CSS3
- Vanilla JavaScript
- Node.js
- Notion API
- GitHub Actions
- GitHub Pages

---

## 🚀 Synchronization

Synchronization is executed manually through GitHub Actions.

Required GitHub Secrets:

```
NOTION_TOKEN
NOTION_DATABASE_ID
```

The workflow automatically:

1. Reads products from Notion
2. Scans image folders
3. Generates `products.json`
4. Commits the updated file
5. Publishes the latest catalog

---

## 📱 Frontend Features

- Responsive product grid
- Image gallery
- Category filters
- Live search
- Lightbox viewer
- Keyboard shortcuts
- Swipe support on mobile
- Smooth image transitions

---

## 📌 Purpose

This repository is a personal tool used to organize, manage, and publish my jewelry catalog.

It is designed to keep product information centralized in Notion while providing a clean, responsive catalog website powered by GitHub Pages.

---

## 📄 License

This project is maintained for personal use.