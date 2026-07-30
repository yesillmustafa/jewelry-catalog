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
    NAME: "Ürün Adı",
    SKU: "SKU",
    CATEGORY: "Kategori",
    PRICE: "Satış Fiyatı (TR)",
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
// Main
// ======================================================

async function main() {

    const pages = await fetchAllPages();

    const products = pages.map(page => {

        const category = getSelect(page, PROPERTIES.CATEGORY);
        const sku = getRichText(page, PROPERTIES.SKU);

        return {

            name: getTitle(page, PROPERTIES.NAME),
            sku,
            category,
            price: getNumber(page, PROPERTIES.PRICE),

            images: getImages(category, sku),

        };

    });

    // Ürünleri SKU'ya göre sırala
    products.sort((a, b) => a.sku.localeCompare(b.sku));

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