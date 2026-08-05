import { Client } from "@notionhq/client";
import fs from "fs";
import path from "path";

// ======================================================
// Notion Client
// ======================================================

const notion = new Client({
    auth: process.env.NOTION_TOKEN,
});

const DATABASE_ID = process.env.NOTION_DATABASE_ID;

// ======================================================
// Notion Property Names
// (Sütun adlarını tek yerden yönetmek için)
// ======================================================

const PROPERTIES = {
    NAME: "Product Name",
    SKU: "SKU",
    CATEGORY: "Category",
    PRICE: "Price",
    STATUS: "Status",
    BADGES: "Badges",
};

// Status öncelikleri
const STATUS_ORDER = {
    "Available": 0,
    "Sold Out": 1,
};

// ======================================================
// Property Helpers
// ======================================================

// Title alanını oku
function getTitle(page, property) {
    return page.properties[property]?.title?.[0]?.plain_text ?? "";
}

// Rich Text alanını oku
// Notion bazen metni birden fazla parçaya bölebiliyor.
// (Örneğin bold yapılmış SKU'lar)
function getRichText(page, property) {
    return (
        page.properties[property]?.rich_text
            ?.map(item => item.plain_text)
            .join("") ?? ""
    ).trim();
}

// Select alanını oku
function getSelect(page, property) {
    return page.properties[property]?.select?.name ?? "";
}

// Number alanını oku
function getNumber(page, property) {
    return page.properties[property]?.number ?? 0;
}

// Multi Select alanını oku
function getMultiSelect(page, property) {
    return (
        page.properties[property]?.multi_select?.map(item => item.name) ?? []
    );
}

// ======================================================
// Product Images
// ======================================================

// images/Kategori/SKU klasöründeki görselleri oku
function getImages(category, sku) {

    const folder = path.join("images", category, sku);

    if (!fs.existsSync(folder)) {
        console.warn(`⚠ Görsel klasörü bulunamadı: ${folder}`);
        return [];
    }

    return fs
        .readdirSync(folder)
        .filter(file => /\.(webp|jpg|jpeg|png)$/i.test(file))
        .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
        .map(file => `images/${category}/${sku}/${file}`);
}

// ======================================================
// Fetch All Pages From Notion
// ======================================================

// Veritabanındaki tüm sayfaları sayfalama desteğiyle getir
async function fetchAllPages() {

    let results = [];
    let cursor = undefined;

    do {

        const response = await notion.databases.query({
            database_id: DATABASE_ID,
            start_cursor: cursor,
        });

        results.push(...response.results);

        cursor = response.has_more
            ? response.next_cursor
            : undefined;

    } while (cursor);

    return results;
}

// ======================================================
// Create Product
// ======================================================

function createProduct(page) {

    const category = getSelect(page, PROPERTIES.CATEGORY);
    const sku = getRichText(page, PROPERTIES.SKU);

    return {
        name: getTitle(page, PROPERTIES.NAME),
        sku,
        category,
        price: getNumber(page, PROPERTIES.PRICE),
        status: getSelect(page, PROPERTIES.STATUS),
        badges: getMultiSelect(page, PROPERTIES.BADGES),
        images: getImages(category, sku),
    };
}

// ======================================================
// Main
// ======================================================

async function main() {

    const pages = await fetchAllPages();

    const products = pages
        .map(createProduct)
        .filter(product => product.status !== "Hidden"); // Hidden'ları filtrele

    // Ürün Sıralama
    products.sort((a, b) => {

        const orderA = STATUS_ORDER[a.status] ?? 999;
        const orderB = STATUS_ORDER[b.status] ?? 999;

        // Önce status'a göre sırala
        if (orderA !== orderB) {
            return orderA - orderB;
        }

        // Aynı status'teyse SKU'ya göre sırala
        return a.sku.localeCompare(b.sku);

    });

    // products.json oluştur
    fs.writeFileSync(
        "products.json",
        JSON.stringify(products, null, 2),
        "utf8"
    );

    console.log(`✅ ${products.length} ürün products.json dosyasına yazıldı.`);
}

// ======================================================
// Run
// ======================================================

main().catch(error => {
    console.error(error);
    process.exit(1);
});