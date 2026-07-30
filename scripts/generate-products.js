import { Client } from "@notionhq/client";
import fs from "fs";
import path from "path";

const notion = new Client({
    auth: process.env.NOTION_TOKEN,
});

const DATABASE_ID = process.env.NOTION_DATABASE_ID;

function getTitle(page, property) {
    return page.properties[property]?.title?.[0]?.plain_text ?? "";
}

function getRichText(page, property) {
    return page.properties[property]?.rich_text?.[0]?.plain_text ?? "";
}

function getSelect(page, property) {
    return page.properties[property]?.select?.name ?? "";
}

function getNumber(page, property) {
    return page.properties[property]?.number ?? 0;
}

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

async function main() {

    const pages = await fetchAllPages();
    
    console.log(JSON.stringify(pages[0].properties["SKU"], null, 2));
    return;

    const products = pages.map(page => {

        const category = getSelect(page, "Kategori");
        const sku = getRichText(page, "SKU");

        return {

            name: getTitle(page, "Ürün Adı"),
            sku,
            category,
            price: getNumber(page, "Satış Fiyatı (TR)"),

            images: getImages(category, sku),

        };

    });

    products.sort((a, b) => a.sku.localeCompare(b.sku));

    fs.writeFileSync(
        "products.json",
        JSON.stringify(products, null, 2),
        "utf8"
    );

    console.log(`✅ ${products.length} ürün products.json dosyasına yazıldı.`);
}

main().catch(error => {
    console.error(error);
    process.exit(1);
});