import { Client } from "@notionhq/client";
import fs from "fs";

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

    const products = pages.map(page => ({

        name: getTitle(page, "Ürün Adı"),
        sku: getRichText(page, "SKU"),
        category: getSelect(page, "Kategori"),
        price: getNumber(page, "Satış Fiyatı (TR)"),

    }));

    fs.writeFileSync(
        "products.json",
        JSON.stringify(products, null, 2),
        "utf8"
    );

    console.log(`${products.length} ürün products.json dosyasına yazıldı.`);
}

main().catch(console.error);