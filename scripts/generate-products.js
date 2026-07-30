import { Client } from "@notionhq/client";

const notion = new Client({
    auth: process.env.NOTION_TOKEN,
});

const DATABASE_ID = process.env.NOTION_DATABASE_ID;

async function main() {

    const response = await notion.databases.query({
        database_id: DATABASE_ID
    });

    console.log(`Toplam ürün: ${response.results.length}`);

    for (const page of response.results) {

        const sku =
            page.properties?.SKU?.rich_text?.[0]?.plain_text ??
            page.properties?.SKU?.title?.[0]?.plain_text ??
            "";

        console.log(sku);
    }
}

main().catch(console.error);